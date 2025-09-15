package deletion

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

// ProgressTracker tracks progress for deletion operations
type ProgressTracker struct {
	operationID string
	progress    *DeletionProgress
	mu          sync.RWMutex
	startTime   time.Time
	updateChan  chan DeletionProgress
}

// ProgressManager manages multiple progress trackers
type ProgressManager struct {
	trackers map[string]*ProgressTracker
	mu       sync.RWMutex
}

// NewProgressManager creates a new progress manager
func NewProgressManager() *ProgressManager {
	return &ProgressManager{
		trackers: make(map[string]*ProgressTracker),
	}
}

// NewProgressTracker creates a new progress tracker for an operation
func (pm *ProgressManager) NewProgressTracker(operationID string) *ProgressTracker {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	
	tracker := &ProgressTracker{
		operationID: operationID,
		progress: &DeletionProgress{
			Operation: operationID,
			Status:    "initializing",
			Message:   "Operation starting...",
		},
		startTime:  time.Now(),
		updateChan: make(chan DeletionProgress, 100),
	}
	
	pm.trackers[operationID] = tracker
	return tracker
}

// GetTracker returns a progress tracker by operation ID
func (pm *ProgressManager) GetTracker(operationID string) (*ProgressTracker, error) {
	pm.mu.RLock()
	defer pm.mu.RUnlock()
	
	tracker, exists := pm.trackers[operationID]
	if !exists {
		return nil, fmt.Errorf("progress tracker not found for operation: %s", operationID)
	}
	
	return tracker, nil
}

// RemoveTracker removes a progress tracker
func (pm *ProgressManager) RemoveTracker(operationID string) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	
	if tracker, exists := pm.trackers[operationID]; exists {
		close(tracker.updateChan)
		delete(pm.trackers, operationID)
	}
}

// GetAllTrackers returns all active progress trackers
func (pm *ProgressManager) GetAllTrackers() map[string]*ProgressTracker {
	pm.mu.RLock()
	defer pm.mu.RUnlock()
	
	trackers := make(map[string]*ProgressTracker)
	for id, tracker := range pm.trackers {
		trackers[id] = tracker
	}
	
	return trackers
}

// UpdateProgress updates the progress for an operation
func (pt *ProgressTracker) UpdateProgress(progress DeletionProgress) {
	pt.mu.Lock()
	defer pt.mu.Unlock()
	
	// Update the progress
	pt.progress = &progress
	pt.progress.ElapsedTime = time.Since(pt.startTime)
	
	// Send update to channel
	select {
	case pt.updateChan <- progress:
	default:
		// Channel is full, skip this update
	}
}

// GetProgress returns the current progress
func (pt *ProgressTracker) GetProgress() DeletionProgress {
	pt.mu.RLock()
	defer pt.mu.RUnlock()
	
	// Create a copy to avoid race conditions
	progress := *pt.progress
	progress.ElapsedTime = time.Since(pt.startTime)
	
	return progress
}

// GetUpdateChannel returns the update channel for this tracker
func (pt *ProgressTracker) GetUpdateChannel() <-chan DeletionProgress {
	return pt.updateChan
}

// SetStatus sets the status of the operation
func (pt *ProgressTracker) SetStatus(status, message string) {
	pt.mu.Lock()
	defer pt.mu.Unlock()
	
	pt.progress.Status = status
	pt.progress.Message = message
	pt.progress.ElapsedTime = time.Since(pt.startTime)
	
	// Send update
	select {
	case pt.updateChan <- *pt.progress:
	default:
	}
}

// SetFileProgress sets the progress for file processing
func (pt *ProgressTracker) SetFileProgress(currentFile string, filesProcessed, totalFiles int, currentSize, totalSize int64) {
	pt.mu.Lock()
	defer pt.mu.Unlock()
	
	pt.progress.CurrentFile = currentFile
	pt.progress.FilesProcessed = filesProcessed
	pt.progress.TotalFiles = totalFiles
	pt.progress.CurrentSize = currentSize
	pt.progress.TotalSize = totalSize
	pt.progress.Progress = float64(filesProcessed) / float64(totalFiles) * 100
	pt.progress.ElapsedTime = time.Since(pt.startTime)
	
	// Calculate estimated time
	if filesProcessed > 0 {
		avgTimePerFile := time.Since(pt.startTime) / time.Duration(filesProcessed)
		remainingFiles := totalFiles - filesProcessed
		pt.progress.EstimatedTime = avgTimePerFile * time.Duration(remainingFiles)
	}
	
	// Send update
	select {
	case pt.updateChan <- *pt.progress:
	default:
	}
}

// SetBackupProgress sets the backup progress
func (pt *ProgressTracker) SetBackupProgress(progress float64, message string) {
	pt.mu.Lock()
	defer pt.mu.Unlock()
	
	pt.progress.BackupProgress = progress
	pt.progress.Message = message
	pt.progress.ElapsedTime = time.Since(pt.startTime)
	
	// Send update
	select {
	case pt.updateChan <- *pt.progress:
	default:
	}
}

// SetDeletionProgress sets the deletion progress
func (pt *ProgressTracker) SetDeletionProgress(progress float64, message string) {
	pt.mu.Lock()
	defer pt.mu.Unlock()
	
	pt.progress.DeletionProgress = progress
	pt.progress.Message = message
	pt.progress.ElapsedTime = time.Since(pt.startTime)
	
	// Send update
	select {
	case pt.updateChan <- *pt.progress:
	default:
	}
}

// Complete marks the operation as completed
func (pt *ProgressTracker) Complete(message string) {
	pt.SetStatus("completed", message)
}

// Fail marks the operation as failed
func (pt *ProgressTracker) Fail(message string) {
	pt.SetStatus("failed", message)
}

// Cancel marks the operation as cancelled
func (pt *ProgressTracker) Cancel(message string) {
	pt.SetStatus("cancelled", message)
}

// GetOperationID returns the operation ID
func (pt *ProgressTracker) GetOperationID() string {
	return pt.operationID
}

// GetDuration returns the duration of the operation
func (pt *ProgressTracker) GetDuration() time.Duration {
	return time.Since(pt.startTime)
}

// IsComplete returns true if the operation is complete
func (pt *ProgressTracker) IsComplete() bool {
	pt.mu.RLock()
	defer pt.mu.RUnlock()
	
	return pt.progress.Status == "completed" || pt.progress.Status == "failed" || pt.progress.Status == "cancelled"
}

// GetProgressJSON returns the progress as JSON
func (pt *ProgressTracker) GetProgressJSON() (string, error) {
	pt.mu.RLock()
	defer pt.mu.RUnlock()
	
	progress := *pt.progress
	progress.ElapsedTime = time.Since(pt.startTime)
	
	jsonData, err := json.Marshal(progress)
	if err != nil {
		return "", err
	}
	
	return string(jsonData), nil
}

// GetStats returns statistics about the progress
func (pt *ProgressTracker) GetStats() map[string]interface{} {
	pt.mu.RLock()
	defer pt.mu.RUnlock()
	
	stats := map[string]interface{}{
		"operation_id":    pt.operationID,
		"status":          pt.progress.Status,
		"message":         pt.progress.Message,
		"elapsed_time":    time.Since(pt.startTime),
		"files_processed": pt.progress.FilesProcessed,
		"total_files":     pt.progress.TotalFiles,
		"progress":        pt.progress.Progress,
		"current_size":    pt.progress.CurrentSize,
		"total_size":      pt.progress.TotalSize,
		"backup_progress": pt.progress.BackupProgress,
		"deletion_progress": pt.progress.DeletionProgress,
	}
	
	if pt.progress.EstimatedTime > 0 {
		stats["estimated_time"] = pt.progress.EstimatedTime
	}
	
	return stats
}

// CleanupCompletedTrackers removes completed trackers older than the specified duration
func (pm *ProgressManager) CleanupCompletedTrackers(olderThan time.Duration) {
	pm.mu.Lock()
	defer pm.mu.Unlock()
	
	cutoff := time.Now().Add(-olderThan)
	
	for id, tracker := range pm.trackers {
		if tracker.IsComplete() && tracker.startTime.Before(cutoff) {
			close(tracker.updateChan)
			delete(pm.trackers, id)
		}
	}
}

// GetManagerStats returns statistics about the progress manager
func (pm *ProgressManager) GetManagerStats() map[string]interface{} {
	pm.mu.RLock()
	defer pm.mu.RUnlock()
	
	stats := map[string]interface{}{
		"total_trackers": len(pm.trackers),
		"active_trackers": 0,
		"completed_trackers": 0,
		"failed_trackers": 0,
		"cancelled_trackers": 0,
	}
	
	for _, tracker := range pm.trackers {
		tracker.mu.RLock()
		status := tracker.progress.Status
		tracker.mu.RUnlock()
		
		switch status {
		case "completed":
			stats["completed_trackers"] = stats["completed_trackers"].(int) + 1
		case "failed":
			stats["failed_trackers"] = stats["failed_trackers"].(int) + 1
		case "cancelled":
			stats["cancelled_trackers"] = stats["cancelled_trackers"].(int) + 1
		default:
			stats["active_trackers"] = stats["active_trackers"].(int) + 1
		}
	}
	
	return stats
}
