package backup

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// RestoreManager handles restoration of files from backups
type RestoreManager struct {
	backupManager *BackupManager
	progressChan  chan RestoreProgress
	stopChan      chan bool
	isRestoring   bool
	mu            sync.RWMutex
}

// RestoreProgress represents progress information during restore operations
type RestoreProgress struct {
	SessionID        string  `json:"session_id"`
	CurrentFile      string  `json:"current_file"`
	FilesProcessed   int     `json:"files_processed"`
	TotalFiles       int     `json:"total_files"`
	Progress         float64 `json:"progress"`
	ElapsedTime      time.Duration `json:"elapsed_time"`
	EstimatedTime    time.Duration `json:"estimated_time"`
	CurrentSize      int64   `json:"current_size"`
	TotalSize        int64   `json:"total_size"`
}

// RestoreResult represents the result of a restore operation
type RestoreResult struct {
	SessionID       string    `json:"session_id"`
	StartTime       time.Time `json:"start_time"`
	EndTime         time.Time `json:"end_time"`
	TotalFiles      int       `json:"total_files"`
	SuccessCount    int       `json:"success_count"`
	FailureCount    int       `json:"failure_count"`
	TotalSize       int64     `json:"total_size"`
	RestoredSize    int64     `json:"restored_size"`
	Status          string    `json:"status"`
	Error           string    `json:"error,omitempty"`
	RestoredFiles   []string  `json:"restored_files"`
	FailedFiles     []string  `json:"failed_files"`
}

// NewRestoreManager creates a new restore manager instance
func NewRestoreManager(backupManager *BackupManager) *RestoreManager {
	return &RestoreManager{
		backupManager: backupManager,
		progressChan:  make(chan RestoreProgress, 100),
		stopChan:      make(chan bool, 1),
	}
}

// GetProgressChannel returns the progress channel for monitoring restore progress
func (rm *RestoreManager) GetProgressChannel() <-chan RestoreProgress {
	return rm.progressChan
}

// StopRestore signals the restore manager to stop the current restore operation
func (rm *RestoreManager) StopRestore() {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	
	if rm.isRestoring {
		select {
		case rm.stopChan <- true:
		default:
		}
	}
}

// IsRestoring returns whether a restore is currently in progress
func (rm *RestoreManager) IsRestoring() bool {
	rm.mu.RLock()
	defer rm.mu.RUnlock()
	return rm.isRestoring
}

// setRestoring sets the restoring state
func (rm *RestoreManager) setRestoring(restoring bool) {
	rm.mu.Lock()
	defer rm.mu.Unlock()
	rm.isRestoring = restoring
}

// RestoreSession restores all files from a backup session
func (rm *RestoreManager) RestoreSession(sessionID string, overwrite bool) (*RestoreResult, error) {
	if rm.IsRestoring() {
		return nil, fmt.Errorf("restore already in progress")
	}

	rm.setRestoring(true)
	defer rm.setRestoring(false)

	// Get the backup session
	session, err := rm.backupManager.GetSession(sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get backup session: %w", err)
	}

	result := &RestoreResult{
		SessionID:     sessionID,
		StartTime:     time.Now(),
		TotalFiles:    len(session.Entries),
		Status:        "in_progress",
		RestoredFiles: make([]string, 0),
		FailedFiles:   make([]string, 0),
	}

	startTime := time.Now()

	for i, entry := range session.Entries {
		// Check for stop signal
		select {
		case <-rm.stopChan:
			result.Status = "cancelled"
			result.EndTime = time.Now()
			return result, fmt.Errorf("restore cancelled by user")
		default:
		}

		if !entry.Success {
			result.FailedFiles = append(result.FailedFiles, entry.OriginalPath)
			result.FailureCount++
			continue
		}

		// Restore the file
		if err := rm.restoreSingleFile(entry, overwrite); err != nil {
			result.FailedFiles = append(result.FailedFiles, entry.OriginalPath)
			result.FailureCount++
		} else {
			result.RestoredFiles = append(result.RestoredFiles, entry.OriginalPath)
			result.SuccessCount++
			result.RestoredSize += entry.Size
		}
		result.TotalSize += entry.Size

		// Send progress update
		progress := RestoreProgress{
			SessionID:      sessionID,
			CurrentFile:    entry.OriginalPath,
			FilesProcessed: i + 1,
			TotalFiles:     len(session.Entries),
			Progress:       float64(i+1) / float64(len(session.Entries)) * 100,
			ElapsedTime:    time.Since(startTime),
			CurrentSize:    result.RestoredSize,
			TotalSize:      result.TotalSize,
		}

		// Calculate estimated time
		if i > 0 {
			avgTimePerFile := time.Since(startTime) / time.Duration(i+1)
			remainingFiles := len(session.Entries) - (i + 1)
			progress.EstimatedTime = avgTimePerFile * time.Duration(remainingFiles)
		}

		select {
		case rm.progressChan <- progress:
		default:
			// Channel is full, skip this update
		}
	}

	result.EndTime = time.Now()
	result.Status = "completed"

	return result, nil
}

// RestoreFiles restores specific files from a backup session
func (rm *RestoreManager) RestoreFiles(sessionID string, filePaths []string, overwrite bool) (*RestoreResult, error) {
	if rm.IsRestoring() {
		return nil, fmt.Errorf("restore already in progress")
	}

	rm.setRestoring(true)
	defer rm.setRestoring(false)

	// Get the backup session
	session, err := rm.backupManager.GetSession(sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get backup session: %w", err)
	}

	result := &RestoreResult{
		SessionID:     sessionID,
		StartTime:     time.Now(),
		TotalFiles:    len(filePaths),
		Status:        "in_progress",
		RestoredFiles: make([]string, 0),
		FailedFiles:   make([]string, 0),
	}

	// Create a map for quick lookup
	entryMap := make(map[string]BackupEntry)
	for _, entry := range session.Entries {
		entryMap[entry.OriginalPath] = entry
	}

	startTime := time.Now()

	for i, filePath := range filePaths {
		// Check for stop signal
		select {
		case <-rm.stopChan:
			result.Status = "cancelled"
			result.EndTime = time.Now()
			return result, fmt.Errorf("restore cancelled by user")
		default:
		}

		entry, exists := entryMap[filePath]
		if !exists {
			result.FailedFiles = append(result.FailedFiles, filePath)
			result.FailureCount++
			continue
		}

		if !entry.Success {
			result.FailedFiles = append(result.FailedFiles, filePath)
			result.FailureCount++
			continue
		}

		// Restore the file
		if err := rm.restoreSingleFile(entry, overwrite); err != nil {
			result.FailedFiles = append(result.FailedFiles, filePath)
			result.FailureCount++
		} else {
			result.RestoredFiles = append(result.RestoredFiles, filePath)
			result.SuccessCount++
			result.RestoredSize += entry.Size
		}
		result.TotalSize += entry.Size

		// Send progress update
		progress := RestoreProgress{
			SessionID:      sessionID,
			CurrentFile:    filePath,
			FilesProcessed: i + 1,
			TotalFiles:     len(filePaths),
			Progress:       float64(i+1) / float64(len(filePaths)) * 100,
			ElapsedTime:    time.Since(startTime),
			CurrentSize:    result.RestoredSize,
			TotalSize:      result.TotalSize,
		}

		// Calculate estimated time
		if i > 0 {
			avgTimePerFile := time.Since(startTime) / time.Duration(i+1)
			remainingFiles := len(filePaths) - (i + 1)
			progress.EstimatedTime = avgTimePerFile * time.Duration(remainingFiles)
		}

		select {
		case rm.progressChan <- progress:
		default:
			// Channel is full, skip this update
		}
	}

	result.EndTime = time.Now()
	result.Status = "completed"

	return result, nil
}

// restoreSingleFile restores a single file from backup
func (rm *RestoreManager) restoreSingleFile(entry BackupEntry, overwrite bool) error {
	// Check if destination file exists
	if _, err := os.Stat(entry.OriginalPath); err == nil {
		if !overwrite {
			return fmt.Errorf("file already exists and overwrite is disabled: %s", entry.OriginalPath)
		}
	}

	// Ensure destination directory exists
	destDir := filepath.Dir(entry.OriginalPath)
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return fmt.Errorf("failed to create destination directory: %w", err)
	}

	// Copy file from backup to original location
	if err := rm.copyFile(entry.BackupPath, entry.OriginalPath); err != nil {
		return fmt.Errorf("failed to copy file from backup: %w", err)
	}

	// Verify checksum if available
	if entry.Checksum != "" {
		currentChecksum, err := rm.backupManager.calculateChecksum(entry.OriginalPath)
		if err != nil {
			return fmt.Errorf("failed to verify checksum: %w", err)
		}

		if currentChecksum != entry.Checksum {
			return fmt.Errorf("checksum verification failed: expected %s, got %s", 
				entry.Checksum, currentChecksum)
		}
	}

	return nil
}

// copyFile copies a file from source to destination
func (rm *RestoreManager) copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("failed to open source file: %w", err)
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %w", err)
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	if err != nil {
		return fmt.Errorf("failed to copy file content: %w", err)
	}

	// Copy file permissions
	sourceInfo, err := sourceFile.Stat()
	if err != nil {
		return fmt.Errorf("failed to get source file info: %w", err)
	}

	if err := destFile.Chmod(sourceInfo.Mode()); err != nil {
		return fmt.Errorf("failed to set destination file permissions: %w", err)
	}

	return nil
}

// GetRestoreableFiles returns a list of files that can be restored from a session
func (rm *RestoreManager) GetRestoreableFiles(sessionID string) ([]string, error) {
	session, err := rm.backupManager.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	var files []string
	for _, entry := range session.Entries {
		if entry.Success {
			files = append(files, entry.OriginalPath)
		}
	}

	return files, nil
}

// PreviewRestore shows what files would be restored without actually restoring them
func (rm *RestoreManager) PreviewRestore(sessionID string) (*RestoreResult, error) {
	session, err := rm.backupManager.GetSession(sessionID)
	if err != nil {
		return nil, err
	}

	result := &RestoreResult{
		SessionID:     sessionID,
		TotalFiles:    len(session.Entries),
		Status:        "preview",
		RestoredFiles: make([]string, 0),
		FailedFiles:   make([]string, 0),
	}

	for _, entry := range session.Entries {
		if !entry.Success {
			result.FailedFiles = append(result.FailedFiles, entry.OriginalPath)
			result.FailureCount++
			continue
		}

		// Check if file would conflict
		if _, err := os.Stat(entry.OriginalPath); err == nil {
			result.FailedFiles = append(result.FailedFiles, entry.OriginalPath+" (would conflict)")
			result.FailureCount++
		} else {
			result.RestoredFiles = append(result.RestoredFiles, entry.OriginalPath)
			result.SuccessCount++
			result.RestoredSize += entry.Size
		}
		result.TotalSize += entry.Size
	}

	return result, nil
}
