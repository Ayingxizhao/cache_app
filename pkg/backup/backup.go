package backup

import (
	"fmt"
	"time"
)

// BackupSystem provides a unified interface for backup operations
type BackupSystem struct {
	manager  *BackupManager
	restorer *RestoreManager
	deleter  *SafeDeleter
}

// NewBackupSystem creates a new backup system instance
func NewBackupSystem() (*BackupSystem, error) {
	manager, err := NewBackupManager()
	if err != nil {
		return nil, fmt.Errorf("failed to create backup manager: %w", err)
	}

	restorer := NewRestoreManager(manager)
	deleter := NewSafeDeleter(manager)

	return &BackupSystem{
		manager:  manager,
		restorer: restorer,
		deleter:  deleter,
	}, nil
}

// GetManager returns the backup manager
func (bs *BackupSystem) GetManager() *BackupManager {
	return bs.manager
}

// GetRestorer returns the restore manager
func (bs *BackupSystem) GetRestorer() *RestoreManager {
	return bs.restorer
}

// GetDeleter returns the safe deleter
func (bs *BackupSystem) GetDeleter() *SafeDeleter {
	return bs.deleter
}

// BackupFiles creates backups of the specified files
func (bs *BackupSystem) BackupFiles(files []string, operation string) (*BackupSession, error) {
	return bs.manager.BackupFiles(files, operation)
}

// RestoreSession restores all files from a backup session
func (bs *BackupSystem) RestoreSession(sessionID string, overwrite bool) (*RestoreResult, error) {
	return bs.restorer.RestoreSession(sessionID, overwrite)
}

// RestoreFiles restores specific files from a backup session
func (bs *BackupSystem) RestoreFiles(sessionID string, filePaths []string, overwrite bool) (*RestoreResult, error) {
	return bs.restorer.RestoreFiles(sessionID, filePaths, overwrite)
}

// DeleteFilesWithBackup safely deletes files after creating backups
func (bs *BackupSystem) DeleteFilesWithBackup(files []string, operation string) (*DeletionResult, error) {
	return bs.deleter.DeleteFilesWithBackup(files, operation)
}

// DeleteFilesWithoutBackup deletes files without creating backups
func (bs *BackupSystem) DeleteFilesWithoutBackup(files []string, operation string) (*DeletionResult, error) {
	return bs.deleter.DeleteFilesWithoutBackup(files, operation)
}

// GetManifest returns the current backup manifest
func (bs *BackupSystem) GetManifest() (*BackupManifest, error) {
	return bs.manager.GetManifest()
}

// GetSession returns a specific backup session by ID
func (bs *BackupSystem) GetSession(sessionID string) (*BackupSession, error) {
	return bs.manager.GetSession(sessionID)
}

// ListSessions returns all backup sessions
func (bs *BackupSystem) ListSessions() ([]BackupSession, error) {
	return bs.manager.ListSessions()
}

// VerifyBackupIntegrity verifies the integrity of a backup session
func (bs *BackupSystem) VerifyBackupIntegrity(sessionID string) (bool, []string, error) {
	return bs.manager.VerifyBackupIntegrity(sessionID)
}

// CleanupOldBackups removes backup sessions older than the specified duration
func (bs *BackupSystem) CleanupOldBackups(olderThan time.Duration) error {
	return bs.manager.CleanupOldBackups(olderThan)
}

// GetBackupProgressChannel returns the backup progress channel
func (bs *BackupSystem) GetBackupProgressChannel() <-chan BackupProgress {
	return bs.manager.GetProgressChannel()
}

// GetRestoreProgressChannel returns the restore progress channel
func (bs *BackupSystem) GetRestoreProgressChannel() <-chan RestoreProgress {
	return bs.restorer.GetProgressChannel()
}

// GetDeletionProgressChannel returns the deletion progress channel
func (bs *BackupSystem) GetDeletionProgressChannel() <-chan DeletionProgress {
	return bs.deleter.GetProgressChannel()
}

// StopAllOperations stops all running operations
func (bs *BackupSystem) StopAllOperations() {
	bs.manager.StopBackup()
	bs.restorer.StopRestore()
	bs.deleter.StopDeletion()
}

// IsAnyOperationRunning returns true if any operation is currently running
func (bs *BackupSystem) IsAnyOperationRunning() bool {
	return bs.manager.IsBackingUp() || bs.restorer.IsRestoring() || bs.deleter.IsDeleting()
}

// GetSystemStatus returns the current status of all components
func (bs *BackupSystem) GetSystemStatus() map[string]interface{} {
	manifest, err := bs.manager.GetManifest()
	if err != nil {
		manifest = &BackupManifest{}
	}

	return map[string]interface{}{
		"backup_manager_running":  bs.manager.IsBackingUp(),
		"restore_manager_running": bs.restorer.IsRestoring(),
		"deleter_running":         bs.deleter.IsDeleting(),
		"total_sessions":          manifest.TotalSessions,
		"total_files":             manifest.TotalFiles,
		"total_size":              manifest.TotalSize,
		"last_updated":            manifest.LastUpdated,
		"backup_directory":         bs.manager.backupDir,
	}
}
