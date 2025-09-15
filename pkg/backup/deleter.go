package backup

import (
	"fmt"
	"os"
	"sync"
	"time"
)

// SafeDeleter handles safe deletion of cache files with backup
type SafeDeleter struct {
	backupManager *BackupManager
	progressChan  chan DeletionProgress
	stopChan      chan bool
	isDeleting    bool
	mu            sync.RWMutex
}

// DeletionProgress represents progress information during deletion operations
type DeletionProgress struct {
	Operation       string  `json:"operation"`
	CurrentFile     string  `json:"current_file"`
	FilesProcessed  int     `json:"files_processed"`
	TotalFiles      int     `json:"total_files"`
	Progress        float64 `json:"progress"`
	ElapsedTime     time.Duration `json:"elapsed_time"`
	EstimatedTime   time.Duration `json:"estimated_time"`
	CurrentSize     int64   `json:"current_size"`
	TotalSize       int64   `json:"total_size"`
	BackupProgress  float64 `json:"backup_progress"`
	DeletionProgress float64 `json:"deletion_progress"`
}

// DeletionResult represents the result of a deletion operation
type DeletionResult struct {
	Operation       string    `json:"operation"`
	StartTime       time.Time `json:"start_time"`
	EndTime         time.Time `json:"end_time"`
	TotalFiles      int       `json:"total_files"`
	BackedUpCount   int       `json:"backed_up_count"`
	DeletedCount    int       `json:"deleted_count"`
	FailedCount     int       `json:"failed_count"`
	TotalSize       int64     `json:"total_size"`
	BackedUpSize    int64     `json:"backed_up_size"`
	DeletedSize     int64     `json:"deleted_size"`
	BackupSessionID string    `json:"backup_session_id"`
	Status          string    `json:"status"`
	Error           string    `json:"error,omitempty"`
	DeletedFiles    []string  `json:"deleted_files"`
	FailedFiles     []string  `json:"failed_files"`
}

// NewSafeDeleter creates a new safe deleter instance
func NewSafeDeleter(backupManager *BackupManager) *SafeDeleter {
	return &SafeDeleter{
		backupManager: backupManager,
		progressChan:  make(chan DeletionProgress, 100),
		stopChan:      make(chan bool, 1),
	}
}

// GetProgressChannel returns the progress channel for monitoring deletion progress
func (sd *SafeDeleter) GetProgressChannel() <-chan DeletionProgress {
	return sd.progressChan
}

// StopDeletion signals the deleter to stop the current deletion operation
func (sd *SafeDeleter) StopDeletion() {
	sd.mu.Lock()
	defer sd.mu.Unlock()
	
	if sd.isDeleting {
		select {
		case sd.stopChan <- true:
		default:
		}
	}
}

// IsDeleting returns whether a deletion is currently in progress
func (sd *SafeDeleter) IsDeleting() bool {
	sd.mu.RLock()
	defer sd.mu.RUnlock()
	return sd.isDeleting
}

// setDeleting sets the deleting state
func (sd *SafeDeleter) setDeleting(deleting bool) {
	sd.mu.Lock()
	defer sd.mu.Unlock()
	sd.isDeleting = deleting
}

// DeleteFilesWithBackup safely deletes files after creating backups
func (sd *SafeDeleter) DeleteFilesWithBackup(files []string, operation string) (*DeletionResult, error) {
	if sd.IsDeleting() {
		return nil, fmt.Errorf("deletion already in progress")
	}

	sd.setDeleting(true)
	defer sd.setDeleting(false)

	result := &DeletionResult{
		Operation:    operation,
		StartTime:    time.Now(),
		TotalFiles:   len(files),
		Status:       "in_progress",
		DeletedFiles: make([]string, 0),
		FailedFiles:  make([]string, 0),
	}

	startTime := time.Now()

	// Step 1: Create backup
	sd.sendProgress(DeletionProgress{
		Operation:      operation,
		TotalFiles:     len(files),
		BackupProgress: 0,
		DeletionProgress: 0,
	})

	backupSession, err := sd.backupManager.BackupFiles(files, operation)
	if err != nil {
		result.Status = "failed"
		result.Error = fmt.Sprintf("backup failed: %v", err)
		result.EndTime = time.Now()
		return result, fmt.Errorf("backup failed: %w", err)
	}

	result.BackupSessionID = backupSession.SessionID
	result.BackedUpCount = backupSession.SuccessCount
	result.BackedUpSize = backupSession.BackupSize

	sd.sendProgress(DeletionProgress{
		Operation:      operation,
		TotalFiles:     len(files),
		BackupProgress: 100,
		DeletionProgress: 0,
	})

	// Step 2: Delete files
	for i, filePath := range files {
		// Check for stop signal
		select {
		case <-sd.stopChan:
			result.Status = "cancelled"
			result.EndTime = time.Now()
			return result, fmt.Errorf("deletion cancelled by user")
		default:
		}

		// Find the corresponding backup entry
		var backupEntry *BackupEntry
		for _, entry := range backupSession.Entries {
			if entry.OriginalPath == filePath {
				backupEntry = &entry
				break
			}
		}

		// Only delete if backup was successful
		if backupEntry != nil && backupEntry.Success {
			if err := sd.deleteSingleFile(filePath); err != nil {
				result.FailedFiles = append(result.FailedFiles, filePath)
				result.FailedCount++
			} else {
				result.DeletedFiles = append(result.DeletedFiles, filePath)
				result.DeletedCount++
				result.DeletedSize += backupEntry.Size
			}
		} else {
			result.FailedFiles = append(result.FailedFiles, filePath)
			result.FailedCount++
		}

		result.TotalSize += backupEntry.Size

		// Send progress update
		progress := DeletionProgress{
			Operation:       operation,
			CurrentFile:     filePath,
			FilesProcessed:  i + 1,
			TotalFiles:      len(files),
			Progress:        float64(i+1) / float64(len(files)) * 100,
			ElapsedTime:     time.Since(startTime),
			CurrentSize:     result.DeletedSize,
			TotalSize:       result.TotalSize,
			BackupProgress:  100,
			DeletionProgress: float64(i+1) / float64(len(files)) * 100,
		}

		// Calculate estimated time
		if i > 0 {
			avgTimePerFile := time.Since(startTime) / time.Duration(i+1)
			remainingFiles := len(files) - (i + 1)
			progress.EstimatedTime = avgTimePerFile * time.Duration(remainingFiles)
		}

		sd.sendProgress(progress)
	}

	result.EndTime = time.Now()
	result.Status = "completed"

	return result, nil
}

// DeleteFilesWithoutBackup deletes files without creating backups (use with caution)
func (sd *SafeDeleter) DeleteFilesWithoutBackup(files []string, operation string) (*DeletionResult, error) {
	if sd.IsDeleting() {
		return nil, fmt.Errorf("deletion already in progress")
	}

	sd.setDeleting(true)
	defer sd.setDeleting(false)

	result := &DeletionResult{
		Operation:    operation,
		StartTime:    time.Now(),
		TotalFiles:   len(files),
		Status:       "in_progress",
		DeletedFiles: make([]string, 0),
		FailedFiles:  make([]string, 0),
	}

	startTime := time.Now()

	for i, filePath := range files {
		// Check for stop signal
		select {
		case <-sd.stopChan:
			result.Status = "cancelled"
			result.EndTime = time.Now()
			return result, fmt.Errorf("deletion cancelled by user")
		default:
		}

		// Get file size before deletion
		info, err := os.Stat(filePath)
		var fileSize int64
		if err == nil {
			fileSize = info.Size()
		}

		if err := sd.deleteSingleFile(filePath); err != nil {
			result.FailedFiles = append(result.FailedFiles, filePath)
			result.FailedCount++
		} else {
			result.DeletedFiles = append(result.DeletedFiles, filePath)
			result.DeletedCount++
			result.DeletedSize += fileSize
		}
		result.TotalSize += fileSize

		// Send progress update
		progress := DeletionProgress{
			Operation:       operation,
			CurrentFile:     filePath,
			FilesProcessed:  i + 1,
			TotalFiles:      len(files),
			Progress:        float64(i+1) / float64(len(files)) * 100,
			ElapsedTime:     time.Since(startTime),
			CurrentSize:     result.DeletedSize,
			TotalSize:       result.TotalSize,
			BackupProgress:  0, // No backup
			DeletionProgress: float64(i+1) / float64(len(files)) * 100,
		}

		// Calculate estimated time
		if i > 0 {
			avgTimePerFile := time.Since(startTime) / time.Duration(i+1)
			remainingFiles := len(files) - (i + 1)
			progress.EstimatedTime = avgTimePerFile * time.Duration(remainingFiles)
		}

		sd.sendProgress(progress)
	}

	result.EndTime = time.Now()
	result.Status = "completed"

	return result, nil
}

// deleteSingleFile deletes a single file or directory
func (sd *SafeDeleter) deleteSingleFile(filePath string) error {
	info, err := os.Stat(filePath)
	if err != nil {
		return fmt.Errorf("failed to get file info: %w", err)
	}

	if info.IsDir() {
		// Delete directory recursively
		return os.RemoveAll(filePath)
	} else {
		// Delete single file
		return os.Remove(filePath)
	}
}

// sendProgress sends progress update to the channel
func (sd *SafeDeleter) sendProgress(progress DeletionProgress) {
	select {
	case sd.progressChan <- progress:
	default:
		// Channel is full, skip this update
	}
}

// GetBackupSession returns the backup session for a deletion operation
func (sd *SafeDeleter) GetBackupSession(sessionID string) (*BackupSession, error) {
	return sd.backupManager.GetSession(sessionID)
}

// VerifyDeletionIntegrity verifies that files were properly deleted and backups are intact
func (sd *SafeDeleter) VerifyDeletionIntegrity(sessionID string) (bool, []string, error) {
	session, err := sd.backupManager.GetSession(sessionID)
	if err != nil {
		return false, nil, err
	}

	var errors []string
	allValid := true

	for _, entry := range session.Entries {
		if !entry.Success {
			continue
		}

		// Check if original file was deleted
		if _, err := os.Stat(entry.OriginalPath); err == nil {
			errors = append(errors, fmt.Sprintf("original file still exists: %s", entry.OriginalPath))
			allValid = false
		}

		// Check if backup file exists
		if _, err := os.Stat(entry.BackupPath); os.IsNotExist(err) {
			errors = append(errors, fmt.Sprintf("backup file missing: %s", entry.BackupPath))
			allValid = false
		}
	}

	return allValid, errors, nil
}

// GetDeletionSummary returns a summary of deletion operations
func (sd *SafeDeleter) GetDeletionSummary() (map[string]interface{}, error) {
	manifest, err := sd.backupManager.GetManifest()
	if err != nil {
		return nil, err
	}

	totalDeletions := 0
	totalFiles := 0
	totalSize := int64(0)
	operations := make(map[string]int)

	for _, session := range manifest.Sessions {
		if session.Operation == "deletion" || session.Operation == "cache_cleanup" {
			totalDeletions++
			totalFiles += session.TotalFiles
			totalSize += session.TotalSize
			operations[session.Operation]++
		}
	}

	return map[string]interface{}{
		"total_deletions": totalDeletions,
		"total_files":     totalFiles,
		"total_size":      totalSize,
		"operations":      operations,
		"last_deletion":   manifest.LastUpdated,
	}, nil
}
