package deletion

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"cache_app/pkg/backup"
	"cache_app/pkg/safety"
)

// DeletionService provides comprehensive deletion functionality with mandatory backup
type DeletionService struct {
	backupSystem *backup.BackupSystem
	progressChan chan DeletionProgress
	stopChan     chan bool
	isDeleting   bool
	mu           sync.RWMutex
	logger       *DeletionLogger
}

// DeletionProgress represents progress information during deletion operations
type DeletionProgress struct {
	Operation         string        `json:"operation"`
	CurrentFile       string        `json:"current_file"`
	FilesProcessed    int           `json:"files_processed"`
	TotalFiles        int           `json:"total_files"`
	Progress          float64       `json:"progress"`
	ElapsedTime       time.Duration `json:"elapsed_time"`
	EstimatedTime     time.Duration `json:"estimated_time"`
	CurrentSize       int64         `json:"current_size"`
	TotalSize         int64         `json:"total_size"`
	BackupProgress    float64       `json:"backup_progress"`
	DeletionProgress  float64       `json:"deletion_progress"`
	Status            string        `json:"status"`
	Message           string        `json:"message"`
}

// DeletionRequest represents a request to delete files
type DeletionRequest struct {
	Files       []string `json:"files"`
	Operation   string   `json:"operation"`
	ForceDelete bool     `json:"force_delete"` // Skip safety checks
	DryRun      bool     `json:"dry_run"`      // Don't actually delete
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
	SkippedCount    int       `json:"skipped_count"`
	TotalSize       int64     `json:"total_size"`
	BackedUpSize    int64     `json:"backed_up_size"`
	DeletedSize     int64     `json:"deleted_size"`
	BackupSessionID string    `json:"backup_session_id"`
	Status          string    `json:"status"`
	Error           string    `json:"error,omitempty"`
	DeletedFiles    []string  `json:"deleted_files"`
	FailedFiles     []string  `json:"failed_files"`
	SkippedFiles    []string  `json:"skipped_files"`
	Warnings        []string  `json:"warnings"`
	Logs            []string  `json:"logs"`
}

// SafetyCheckResult represents the result of safety validation
type SafetyCheckResult struct {
	IsSafe        bool     `json:"is_safe"`
	Warnings      []string `json:"warnings"`
	BlockedFiles  []string `json:"blocked_files"`
	RiskyFiles    []string `json:"risky_files"`
	SafeFiles     []string `json:"safe_files"`
	TotalSize     int64    `json:"total_size"`
	EstimatedTime time.Duration `json:"estimated_time"`
}

// NewDeletionService creates a new deletion service instance
func NewDeletionService(backupSystem *backup.BackupSystem) *DeletionService {
	return &DeletionService{
		backupSystem: backupSystem,
		progressChan: make(chan DeletionProgress, 100),
		stopChan:     make(chan bool, 1),
		logger:       NewDeletionLogger(),
	}
}

// GetProgressChannel returns the progress channel for monitoring deletion progress
func (ds *DeletionService) GetProgressChannel() <-chan DeletionProgress {
	return ds.progressChan
}

// StopDeletion signals the service to stop the current deletion operation
func (ds *DeletionService) StopDeletion() {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	
	if ds.isDeleting {
		select {
		case ds.stopChan <- true:
		default:
		}
	}
}

// IsDeleting returns whether a deletion is currently in progress
func (ds *DeletionService) IsDeleting() bool {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.isDeleting
}

// setDeleting sets the deleting state
func (ds *DeletionService) setDeleting(deleting bool) {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.isDeleting = deleting
}

// ValidateDeletionRequest performs comprehensive safety validation before deletion
func (ds *DeletionService) ValidateDeletionRequest(request *DeletionRequest) (*SafetyCheckResult, error) {
	if ds.IsDeleting() {
		return nil, fmt.Errorf("deletion already in progress")
	}

	result := &SafetyCheckResult{
		IsSafe:       true,
		Warnings:     make([]string, 0),
		BlockedFiles: make([]string, 0),
		RiskyFiles:   make([]string, 0),
		SafeFiles:    make([]string, 0),
	}

	startTime := time.Now()
	totalSize := int64(0)

	ds.logger.LogInfo("Starting deletion validation", map[string]interface{}{
		"file_count": len(request.Files),
		"operation":  request.Operation,
		"force":      request.ForceDelete,
		"dry_run":    request.DryRun,
	})

	for _, filePath := range request.Files {
		// Check if file exists
		info, err := os.Stat(filePath)
		if err != nil {
			result.BlockedFiles = append(result.BlockedFiles, filePath)
			result.Warnings = append(result.Warnings, fmt.Sprintf("File not found: %s", filePath))
			continue
		}

		// Get file size
		fileSize := int64(0)
		if !info.IsDir() {
			fileSize = info.Size()
		}
		totalSize += fileSize

		// Check file permissions
		if !ds.checkFilePermissions(filePath, info) {
			result.BlockedFiles = append(result.BlockedFiles, filePath)
			result.Warnings = append(result.Warnings, fmt.Sprintf("Insufficient permissions: %s", filePath))
			continue
		}

		// Safety classification (if not force delete)
		if !request.ForceDelete {
			safetyLevel := ds.classifyFileSafety(filePath, info)
			switch safetyLevel {
			case "Risky":
				result.RiskyFiles = append(result.RiskyFiles, filePath)
				result.Warnings = append(result.Warnings, fmt.Sprintf("Risky file detected: %s", filePath))
				if !request.ForceDelete {
					result.IsSafe = false
				}
			case "Caution":
				result.Warnings = append(result.Warnings, fmt.Sprintf("Caution file detected: %s", filePath))
				result.SafeFiles = append(result.SafeFiles, filePath)
			default:
				result.SafeFiles = append(result.SafeFiles, filePath)
			}
		} else {
			result.SafeFiles = append(result.SafeFiles, filePath)
		}

		// Check for system critical files
		if ds.isSystemCritical(filePath) {
			result.BlockedFiles = append(result.BlockedFiles, filePath)
			result.Warnings = append(result.Warnings, fmt.Sprintf("System critical file blocked: %s", filePath))
			result.IsSafe = false
		}
	}

	result.TotalSize = totalSize
	result.EstimatedTime = time.Since(startTime) * time.Duration(len(request.Files))

	ds.logger.LogInfo("Deletion validation completed", map[string]interface{}{
		"is_safe":       result.IsSafe,
		"safe_files":    len(result.SafeFiles),
		"risky_files":   len(result.RiskyFiles),
		"blocked_files": len(result.BlockedFiles),
		"total_size":    result.TotalSize,
		"warnings":      len(result.Warnings),
	})

	return result, nil
}

// DeleteFilesWithBackup safely deletes files after creating mandatory backups
func (ds *DeletionService) DeleteFilesWithBackup(request *DeletionRequest) (*DeletionResult, error) {
	if ds.IsDeleting() {
		return nil, fmt.Errorf("deletion already in progress")
	}

	ds.setDeleting(true)
	defer ds.setDeleting(false)

	result := &DeletionResult{
		Operation:    request.Operation,
		StartTime:    time.Now(),
		TotalFiles:   len(request.Files),
		Status:       "in_progress",
		DeletedFiles: make([]string, 0),
		FailedFiles:  make([]string, 0),
		SkippedFiles: make([]string, 0),
		Warnings:     make([]string, 0),
		Logs:         make([]string, 0),
	}

	ds.logger.LogInfo("Starting deletion operation", map[string]interface{}{
		"operation":  request.Operation,
		"file_count": len(request.Files),
		"force":      request.ForceDelete,
		"dry_run":    request.DryRun,
	})

	// Step 1: Validate deletion request
	ds.sendProgress(DeletionProgress{
		Operation: request.Operation,
		Status:    "validating",
		Message:   "Validating deletion request...",
	})

	safetyResult, err := ds.ValidateDeletionRequest(request)
	if err != nil {
		result.Status = "failed"
		result.Error = fmt.Sprintf("validation failed: %v", err)
		result.EndTime = time.Now()
		return result, err
	}

	// Add validation warnings to result
	result.Warnings = append(result.Warnings, safetyResult.Warnings...)

	// Check if deletion is safe
	if !safetyResult.IsSafe && !request.ForceDelete {
		result.Status = "blocked"
		result.Error = "Deletion blocked due to safety concerns. Use force delete to override."
		result.EndTime = time.Now()
		return result, fmt.Errorf("deletion blocked due to safety concerns")
	}

	// Filter files based on safety results
	filesToDelete := safetyResult.SafeFiles
	if request.ForceDelete {
		filesToDelete = request.Files
	}

	if len(filesToDelete) == 0 {
		result.Status = "completed"
		result.EndTime = time.Now()
		result.SkippedFiles = request.Files
		result.SkippedCount = len(request.Files)
		return result, nil
	}

	// Step 2: Create mandatory backup
	ds.sendProgress(DeletionProgress{
		Operation:      request.Operation,
		Status:         "backing_up",
		Message:        "Creating mandatory backup...",
		BackupProgress: 0,
	})

	backupSession, err := ds.backupSystem.BackupFiles(filesToDelete, request.Operation)
	if err != nil {
		result.Status = "failed"
		result.Error = fmt.Sprintf("backup failed: %v", err)
		result.EndTime = time.Now()
		ds.logger.LogError("Backup failed", err, map[string]interface{}{
			"operation": request.Operation,
			"files":     filesToDelete,
		})
		return result, fmt.Errorf("mandatory backup failed: %w", err)
	}

	result.BackupSessionID = backupSession.SessionID
	result.BackedUpCount = backupSession.SuccessCount
	result.BackedUpSize = backupSession.BackupSize

	ds.logger.LogInfo("Backup created successfully", map[string]interface{}{
		"session_id":    backupSession.SessionID,
		"backed_up":     backupSession.SuccessCount,
		"backup_size":   backupSession.BackupSize,
	})

	ds.sendProgress(DeletionProgress{
		Operation:      request.Operation,
		Status:         "backup_complete",
		Message:        "Backup completed, starting deletion...",
		BackupProgress: 100,
	})

	// Step 3: Delete files (if not dry run)
	if !request.DryRun {
		startTime := time.Now()
		for i, filePath := range filesToDelete {
			// Check for stop signal
			select {
			case <-ds.stopChan:
				result.Status = "cancelled"
				result.EndTime = time.Now()
				ds.logger.LogInfo("Deletion cancelled by user", map[string]interface{}{
					"files_processed": i,
					"total_files":     len(filesToDelete),
				})
				return result, fmt.Errorf("deletion cancelled by user")
			default:
			}

			// Find the corresponding backup entry
			var backupEntry *backup.BackupEntry
			for _, entry := range backupSession.Entries {
				if entry.OriginalPath == filePath {
					backupEntry = &entry
					break
				}
			}

			// Only delete if backup was successful
			if backupEntry != nil && backupEntry.Success {
				if err := ds.deleteSingleFile(filePath); err != nil {
					result.FailedFiles = append(result.FailedFiles, filePath)
					result.FailedCount++
					ds.logger.LogError("Failed to delete file", err, map[string]interface{}{
						"file_path": filePath,
					})
				} else {
					result.DeletedFiles = append(result.DeletedFiles, filePath)
					result.DeletedCount++
					result.DeletedSize += backupEntry.Size
					ds.logger.LogInfo("File deleted successfully", map[string]interface{}{
						"file_path": filePath,
						"size":      backupEntry.Size,
					})
				}
			} else {
				result.FailedFiles = append(result.FailedFiles, filePath)
				result.FailedCount++
				ds.logger.LogWarning("Skipped deletion due to backup failure", map[string]interface{}{
					"file_path": filePath,
				})
			}

			result.TotalSize += backupEntry.Size

			// Send progress update
			progress := DeletionProgress{
				Operation:         request.Operation,
				CurrentFile:       filePath,
				FilesProcessed:    i + 1,
				TotalFiles:        len(filesToDelete),
				Progress:          float64(i+1) / float64(len(filesToDelete)) * 100,
				ElapsedTime:       time.Since(startTime),
				CurrentSize:       result.DeletedSize,
				TotalSize:         result.TotalSize,
				BackupProgress:    100,
				DeletionProgress:  float64(i+1) / float64(len(filesToDelete)) * 100,
				Status:            "deleting",
				Message:           fmt.Sprintf("Deleting file %d of %d", i+1, len(filesToDelete)),
			}

			// Calculate estimated time
			if i > 0 {
				avgTimePerFile := time.Since(startTime) / time.Duration(i+1)
				remainingFiles := len(filesToDelete) - (i + 1)
				progress.EstimatedTime = avgTimePerFile * time.Duration(remainingFiles)
			}

			ds.sendProgress(progress)
		}
	} else {
		// Dry run - just log what would be deleted
		ds.logger.LogInfo("Dry run completed", map[string]interface{}{
			"files_to_delete": filesToDelete,
			"total_size":      result.TotalSize,
		})
		result.DeletedFiles = filesToDelete
		result.DeletedCount = len(filesToDelete)
	}

	result.EndTime = time.Now()
	result.Status = "completed"

	ds.logger.LogInfo("Deletion operation completed", map[string]interface{}{
		"operation":      request.Operation,
		"deleted_count":  result.DeletedCount,
		"failed_count":   result.FailedCount,
		"skipped_count":  result.SkippedCount,
		"deleted_size":   result.DeletedSize,
		"duration":       result.EndTime.Sub(result.StartTime),
	})

	return result, nil
}

// RestoreFromBackup restores files from the most recent backup session
func (ds *DeletionService) RestoreFromBackup(sessionID string, overwrite bool) (*backup.RestoreResult, error) {
	if ds.IsDeleting() {
		return nil, fmt.Errorf("deletion in progress, cannot restore")
	}

	ds.logger.LogInfo("Starting restore operation", map[string]interface{}{
		"session_id": sessionID,
		"overwrite":  overwrite,
	})

	result, err := ds.backupSystem.RestoreSession(sessionID, overwrite)
	if err != nil {
		ds.logger.LogError("Restore failed", err, map[string]interface{}{
			"session_id": sessionID,
		})
		return nil, err
	}

	ds.logger.LogInfo("Restore operation completed", map[string]interface{}{
		"session_id":     sessionID,
		"restored_count": result.SuccessCount,
		"failed_count":   len(result.FailedFiles),
	})

	return result, nil
}

// GetDeletionHistory returns the history of deletion operations
func (ds *DeletionService) GetDeletionHistory() ([]DeletionLogEntry, error) {
	history := ds.logger.GetHistory()
	return history, nil
}

// GetBackupSessions returns all available backup sessions
func (ds *DeletionService) GetBackupSessions() ([]backup.BackupSession, error) {
	return ds.backupSystem.ListSessions()
}

// Helper methods

func (ds *DeletionService) checkFilePermissions(filePath string, info os.FileInfo) bool {
	// Check if we have write permissions
	mode := info.Mode()
	if mode&0200 == 0 {
		return false
	}

	// Check if parent directory is writable
	parentDir := filepath.Dir(filePath)
	parentInfo, err := os.Stat(parentDir)
	if err != nil {
		return false
	}

	return parentInfo.Mode()&0200 != 0
}

func (ds *DeletionService) classifyFileSafety(filePath string, info os.FileInfo) string {
	// Create file metadata for safety classification
	fileMetadata := safety.FileMetadata{
		Name:         info.Name(),
		Path:         filePath,
		Size:         info.Size(),
		LastModified: info.ModTime(),
		LastAccessed: getLastAccessTime(info),
		IsDir:        info.IsDir(),
		Permissions:  info.Mode().String(),
	}

	// Classify the file
	classifier := safety.NewDefaultSafetyClassifier()
	classification := classifier.ClassifyFile(fileMetadata)

	return string(classification.Level)
}

func (ds *DeletionService) isSystemCritical(filePath string) bool {
	criticalPaths := []string{
		"/System",
		"/usr",
		"/bin",
		"/sbin",
		"/etc",
		"/var",
		"/Library/System",
		"/Library/Application Support",
		"/Applications",
	}

	for _, criticalPath := range criticalPaths {
		if filepath.HasPrefix(filePath, criticalPath) {
			return true
		}
	}

	return false
}

func (ds *DeletionService) deleteSingleFile(filePath string) error {
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

func (ds *DeletionService) sendProgress(progress DeletionProgress) {
	select {
	case ds.progressChan <- progress:
	default:
		// Channel is full, skip this update
	}
}

// getLastAccessTime gets the last access time from file info
func getLastAccessTime(info os.FileInfo) time.Time {
	// On macOS, we can use the access time from the file info
	// This is a simplified implementation
	return info.ModTime()
}
