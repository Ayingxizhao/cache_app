package backup

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// BackupManager handles backup operations for cache files
type BackupManager struct {
	backupDir    string
	manifestFile string
	mu           sync.RWMutex
	progressChan chan BackupProgress
	stopChan     chan bool
	isBackingUp  bool
}

// BackupEntry represents a single file backup entry
type BackupEntry struct {
	OriginalPath    string    `json:"original_path"`
	BackupPath      string    `json:"backup_path"`
	Size            int64     `json:"size"`
	Checksum        string    `json:"checksum"`
	BackupTime      time.Time `json:"backup_time"`
	Operation       string    `json:"operation"`
	Success         bool      `json:"success"`
	Error           string    `json:"error,omitempty"`
	Metadata        map[string]interface{} `json:"metadata,omitempty"`
}

// BackupSession represents a complete backup operation
type BackupSession struct {
	SessionID       string         `json:"session_id"`
	StartTime       time.Time      `json:"start_time"`
	EndTime         time.Time      `json:"end_time"`
	Operation       string         `json:"operation"`
	TotalFiles      int            `json:"total_files"`
	SuccessCount    int            `json:"success_count"`
	FailureCount    int            `json:"failure_count"`
	TotalSize       int64          `json:"total_size"`
	BackupSize      int64          `json:"backup_size"`
	Entries         []BackupEntry  `json:"entries"`
	Status          string         `json:"status"`
	Error           string         `json:"error,omitempty"`
}

// BackupProgress represents progress information during backup operations
type BackupProgress struct {
	SessionID       string  `json:"session_id"`
	CurrentFile     string  `json:"current_file"`
	FilesProcessed  int     `json:"files_processed"`
	TotalFiles      int     `json:"total_files"`
	Progress        float64 `json:"progress"`
	ElapsedTime     time.Duration `json:"elapsed_time"`
	EstimatedTime   time.Duration `json:"estimated_time"`
	CurrentSize     int64   `json:"current_size"`
	TotalSize       int64   `json:"total_size"`
}

// BackupManifest represents the complete backup manifest
type BackupManifest struct {
	Version         string          `json:"version"`
	CreatedAt       time.Time       `json:"created_at"`
	LastUpdated     time.Time       `json:"last_updated"`
	Sessions        []BackupSession `json:"sessions"`
	TotalSessions   int             `json:"total_sessions"`
	TotalFiles      int             `json:"total_files"`
	TotalSize       int64           `json:"total_size"`
}

// NewBackupManager creates a new backup manager instance
func NewBackupManager() (*BackupManager, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	backupDir := filepath.Join(homeDir, "CacheCleaner", "Backups")
	manifestFile := filepath.Join(backupDir, "manifest.json")

	bm := &BackupManager{
		backupDir:    backupDir,
		manifestFile: manifestFile,
		progressChan: make(chan BackupProgress, 100),
		stopChan:     make(chan bool, 1),
	}

	// Ensure backup directory exists
	if err := bm.ensureBackupDirectory(); err != nil {
		return nil, fmt.Errorf("failed to create backup directory: %w", err)
	}

	return bm, nil
}

// ensureBackupDirectory creates the backup directory structure if it doesn't exist
func (bm *BackupManager) ensureBackupDirectory() error {
	if err := os.MkdirAll(bm.backupDir, 0755); err != nil {
		return fmt.Errorf("failed to create backup directory %s: %w", bm.backupDir, err)
	}

	// Create subdirectories for organization
	subdirs := []string{"files", "metadata", "logs"}
	for _, subdir := range subdirs {
		path := filepath.Join(bm.backupDir, subdir)
		if err := os.MkdirAll(path, 0755); err != nil {
			return fmt.Errorf("failed to create subdirectory %s: %w", path, err)
		}
	}

	return nil
}

// GetProgressChannel returns the progress channel for monitoring backup progress
func (bm *BackupManager) GetProgressChannel() <-chan BackupProgress {
	return bm.progressChan
}

// StopBackup signals the backup manager to stop the current backup operation
func (bm *BackupManager) StopBackup() {
	bm.mu.Lock()
	defer bm.mu.Unlock()
	
	if bm.isBackingUp {
		select {
		case bm.stopChan <- true:
		default:
		}
	}
}

// IsBackingUp returns whether a backup is currently in progress
func (bm *BackupManager) IsBackingUp() bool {
	bm.mu.RLock()
	defer bm.mu.RUnlock()
	return bm.isBackingUp
}

// setBackingUp sets the backing up state
func (bm *BackupManager) setBackingUp(backingUp bool) {
	bm.mu.Lock()
	defer bm.mu.Unlock()
	bm.isBackingUp = backingUp
}

// BackupFiles creates backups of the specified files before deletion
func (bm *BackupManager) BackupFiles(files []string, operation string) (*BackupSession, error) {
	if bm.IsBackingUp() {
		return nil, fmt.Errorf("backup already in progress")
	}

	bm.setBackingUp(true)
	defer bm.setBackingUp(false)

	sessionID := fmt.Sprintf("backup_%d", time.Now().Unix())
	session := &BackupSession{
		SessionID:    sessionID,
		StartTime:    time.Now(),
		Operation:    operation,
		TotalFiles:   len(files),
		Entries:      make([]BackupEntry, 0, len(files)),
		Status:       "in_progress",
	}

	// Create session directory
	sessionDir := filepath.Join(bm.backupDir, "files", sessionID)
	if err := os.MkdirAll(sessionDir, 0755); err != nil {
		session.Status = "failed"
		session.Error = fmt.Sprintf("failed to create session directory: %v", err)
		return session, fmt.Errorf("failed to create session directory: %w", err)
	}

	startTime := time.Now()
	
	for i, filePath := range files {
		// Check for stop signal
		select {
		case <-bm.stopChan:
			session.Status = "cancelled"
			session.EndTime = time.Now()
			return session, fmt.Errorf("backup cancelled by user")
		default:
		}

		entry := bm.backupSingleFile(filePath, sessionDir, operation)
		session.Entries = append(session.Entries, entry)

		if entry.Success {
			session.SuccessCount++
			session.BackupSize += entry.Size
		} else {
			session.FailureCount++
		}
		session.TotalSize += entry.Size

		// Send progress update
		progress := BackupProgress{
			SessionID:      sessionID,
			CurrentFile:    filePath,
			FilesProcessed: i + 1,
			TotalFiles:     len(files),
			Progress:       float64(i+1) / float64(len(files)) * 100,
			ElapsedTime:    time.Since(startTime),
			CurrentSize:    session.BackupSize,
			TotalSize:      session.TotalSize,
		}

		// Calculate estimated time
		if i > 0 {
			avgTimePerFile := time.Since(startTime) / time.Duration(i+1)
			remainingFiles := len(files) - (i + 1)
			progress.EstimatedTime = avgTimePerFile * time.Duration(remainingFiles)
		}

		select {
		case bm.progressChan <- progress:
		default:
			// Channel is full, skip this update
		}
	}

	session.EndTime = time.Now()
	session.Status = "completed"

	// Save session to manifest
	if err := bm.saveSessionToManifest(session); err != nil {
		session.Status = "failed"
		session.Error = fmt.Sprintf("failed to save session to manifest: %v", err)
		return session, fmt.Errorf("failed to save session to manifest: %w", err)
	}

	return session, nil
}

// backupSingleFile creates a backup of a single file
func (bm *BackupManager) backupSingleFile(originalPath, sessionDir, operation string) BackupEntry {
	entry := BackupEntry{
		OriginalPath: originalPath,
		BackupTime:   time.Now(),
		Operation:    operation,
		Metadata:     make(map[string]interface{}),
	}

	// Get file info
	info, err := os.Stat(originalPath)
	if err != nil {
		entry.Error = fmt.Sprintf("failed to get file info: %v", err)
		return entry
	}

	entry.Size = info.Size()
	entry.Metadata["permissions"] = info.Mode().String()
	entry.Metadata["mod_time"] = info.ModTime()
	entry.Metadata["is_dir"] = info.IsDir()

	// Generate backup path
	fileName := filepath.Base(originalPath)
	backupPath := filepath.Join(sessionDir, fileName)
	
	// Handle duplicate file names
	counter := 1
	for {
		if _, err := os.Stat(backupPath); os.IsNotExist(err) {
			break
		}
		ext := filepath.Ext(fileName)
		name := fileName[:len(fileName)-len(ext)]
		backupPath = filepath.Join(sessionDir, fmt.Sprintf("%s_%d%s", name, counter, ext))
		counter++
	}

	entry.BackupPath = backupPath

	// Copy file
	if err := bm.copyFile(originalPath, backupPath); err != nil {
		entry.Error = fmt.Sprintf("failed to copy file: %v", err)
		return entry
	}

	// Calculate checksum
	checksum, err := bm.calculateChecksum(backupPath)
	if err != nil {
		entry.Error = fmt.Sprintf("failed to calculate checksum: %v", err)
		return entry
	}

	entry.Checksum = checksum
	entry.Success = true

	return entry
}

// copyFile copies a file from source to destination
func (bm *BackupManager) copyFile(src, dst string) error {
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

// calculateChecksum calculates SHA256 checksum of a file
func (bm *BackupManager) calculateChecksum(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", fmt.Errorf("failed to calculate hash: %w", err)
	}

	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

// saveSessionToManifest saves a backup session to the manifest file
func (bm *BackupManager) saveSessionToManifest(session *BackupSession) error {
	manifest, err := bm.loadManifest()
	if err != nil {
		// Create new manifest if it doesn't exist
		manifest = &BackupManifest{
			Version:   "1.0",
			CreatedAt: time.Now(),
		}
	}

	manifest.Sessions = append(manifest.Sessions, *session)
	manifest.LastUpdated = time.Now()
	manifest.TotalSessions = len(manifest.Sessions)
	manifest.TotalFiles += session.TotalFiles
	manifest.TotalSize += session.TotalSize

	return bm.SaveManifest(manifest)
}

// loadManifest loads the backup manifest from disk
func (bm *BackupManager) loadManifest() (*BackupManifest, error) {
	data, err := os.ReadFile(bm.manifestFile)
	if err != nil {
		if os.IsNotExist(err) {
			return &BackupManifest{
				Version:   "1.0",
				CreatedAt: time.Now(),
				Sessions:  make([]BackupSession, 0),
			}, nil
		}
		return nil, fmt.Errorf("failed to read manifest file: %w", err)
	}

	var manifest BackupManifest
	if err := json.Unmarshal(data, &manifest); err != nil {
		return nil, fmt.Errorf("failed to parse manifest file: %w", err)
	}

	return &manifest, nil
}

// SaveManifest saves the backup manifest to disk
func (bm *BackupManager) SaveManifest(manifest *BackupManifest) error {
	data, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal manifest: %w", err)
	}

	if err := os.WriteFile(bm.manifestFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write manifest file: %w", err)
	}

	return nil
}

// GetManifest returns the current backup manifest
func (bm *BackupManager) GetManifest() (*BackupManifest, error) {
	return bm.loadManifest()
}

// GetSession returns a specific backup session by ID
func (bm *BackupManager) GetSession(sessionID string) (*BackupSession, error) {
	manifest, err := bm.loadManifest()
	if err != nil {
		return nil, err
	}

	for _, session := range manifest.Sessions {
		if session.SessionID == sessionID {
			return &session, nil
		}
	}

	return nil, fmt.Errorf("session %s not found", sessionID)
}

// ListSessions returns all backup sessions
func (bm *BackupManager) ListSessions() ([]BackupSession, error) {
	manifest, err := bm.loadManifest()
	if err != nil {
		return nil, err
	}

	return manifest.Sessions, nil
}

// VerifyBackupIntegrity verifies the integrity of a backup session
func (bm *BackupManager) VerifyBackupIntegrity(sessionID string) (bool, []string, error) {
	session, err := bm.GetSession(sessionID)
	if err != nil {
		return false, nil, err
	}

	var errors []string
	allValid := true

	for _, entry := range session.Entries {
		if !entry.Success {
			continue
		}

		// Check if backup file exists
		if _, err := os.Stat(entry.BackupPath); os.IsNotExist(err) {
			errors = append(errors, fmt.Sprintf("backup file missing: %s", entry.BackupPath))
			allValid = false
			continue
		}

		// Verify checksum
		currentChecksum, err := bm.calculateChecksum(entry.BackupPath)
		if err != nil {
			errors = append(errors, fmt.Sprintf("failed to calculate checksum for %s: %v", entry.BackupPath, err))
			allValid = false
			continue
		}

		if currentChecksum != entry.Checksum {
			errors = append(errors, fmt.Sprintf("checksum mismatch for %s: expected %s, got %s", 
				entry.BackupPath, entry.Checksum, currentChecksum))
			allValid = false
		}
	}

	return allValid, errors, nil
}

// CleanupOldBackups removes backup sessions older than the specified duration
func (bm *BackupManager) CleanupOldBackups(olderThan time.Duration) error {
	manifest, err := bm.loadManifest()
	if err != nil {
		return err
	}

	cutoffTime := time.Now().Add(-olderThan)
	var remainingSessions []BackupSession
	var sessionsToDelete []BackupSession

	for _, session := range manifest.Sessions {
		if session.StartTime.Before(cutoffTime) {
			sessionsToDelete = append(sessionsToDelete, session)
		} else {
			remainingSessions = append(remainingSessions, session)
		}
	}

	// Delete backup files for old sessions
	for _, session := range sessionsToDelete {
		sessionDir := filepath.Join(bm.backupDir, "files", session.SessionID)
		if err := os.RemoveAll(sessionDir); err != nil {
			return fmt.Errorf("failed to remove session directory %s: %w", sessionDir, err)
		}
	}

	// Update manifest
	manifest.Sessions = remainingSessions
	manifest.LastUpdated = time.Now()
	manifest.TotalSessions = len(remainingSessions)

	// Recalculate totals
	manifest.TotalFiles = 0
	manifest.TotalSize = 0
	for _, session := range remainingSessions {
		manifest.TotalFiles += session.TotalFiles
		manifest.TotalSize += session.TotalSize
	}

	return bm.SaveManifest(manifest)
}
