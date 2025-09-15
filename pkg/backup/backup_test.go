package backup

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestBackupSystem(t *testing.T) {
	// Create temporary test files
	testDir := t.TempDir()
	testFiles := []string{
		filepath.Join(testDir, "test1.txt"),
		filepath.Join(testDir, "test2.log"),
		filepath.Join(testDir, "subdir", "test3.dat"),
	}

	// Create test files
	for _, file := range testFiles {
		dir := filepath.Dir(file)
		if err := os.MkdirAll(dir, 0755); err != nil {
			t.Fatalf("Failed to create test directory: %v", err)
		}

		content := "Test content for " + filepath.Base(file)
		if err := os.WriteFile(file, []byte(content), 0644); err != nil {
			t.Fatalf("Failed to create test file %s: %v", file, err)
		}
	}

	// Create backup system
	backupSystem, err := NewBackupSystem()
	if err != nil {
		t.Fatalf("Failed to create backup system: %v", err)
	}

	// Test 1: Create backup
	t.Run("CreateBackup", func(t *testing.T) {
		session, err := backupSystem.BackupFiles(testFiles, "test_backup")
		if err != nil {
			t.Fatalf("Backup failed: %v", err)
		}

		if session.SessionID == "" {
			t.Error("Session ID should not be empty")
		}

		if session.SuccessCount != len(testFiles) {
			t.Errorf("Expected %d successful backups, got %d", len(testFiles), session.SuccessCount)
		}

		if session.Status != "completed" {
			t.Errorf("Expected status 'completed', got '%s'", session.Status)
		}
	})

	// Test 2: Safe deletion with backup
	t.Run("SafeDeletion", func(t *testing.T) {
		deletionResult, err := backupSystem.DeleteFilesWithBackup(testFiles, "test_deletion")
		if err != nil {
			t.Fatalf("Safe deletion failed: %v", err)
		}

		if deletionResult.BackupSessionID == "" {
			t.Error("Backup session ID should not be empty")
		}

		if deletionResult.DeletedCount != len(testFiles) {
			t.Errorf("Expected %d deleted files, got %d", len(testFiles), deletionResult.DeletedCount)
		}

		// Verify files were actually deleted
		for _, file := range testFiles {
			if _, err := os.Stat(file); err == nil {
				t.Errorf("File %s should have been deleted", file)
			}
		}
	})

	// Test 3: Restore files
	t.Run("RestoreFiles", func(t *testing.T) {
		// Get the last session
		sessions, err := backupSystem.ListSessions()
		if err != nil {
			t.Fatalf("Failed to list sessions: %v", err)
		}

		if len(sessions) == 0 {
			t.Fatal("No backup sessions found")
		}

		// Find the backup session (not deletion session)
		var backupSession *BackupSession
		for _, session := range sessions {
			if session.Operation == "test_backup" {
				backupSession = &session
				break
			}
		}

		if backupSession == nil {
			t.Fatal("Backup session not found")
		}

		// Restore files
		restoreResult, err := backupSystem.RestoreSession(backupSession.SessionID, true)
		if err != nil {
			t.Fatalf("Restore failed: %v", err)
		}

		if restoreResult.SuccessCount != len(testFiles) {
			t.Errorf("Expected %d restored files, got %d", len(testFiles), restoreResult.SuccessCount)
		}

		// Verify files were restored
		for _, file := range testFiles {
			if _, err := os.Stat(file); os.IsNotExist(err) {
				t.Errorf("File %s should have been restored", file)
			}
		}
	})

	// Test 4: Verify backup integrity
	t.Run("VerifyIntegrity", func(t *testing.T) {
		sessions, err := backupSystem.ListSessions()
		if err != nil {
			t.Fatalf("Failed to list sessions: %v", err)
		}

		if len(sessions) == 0 {
			t.Fatal("No backup sessions found")
		}

		// Test integrity verification on the first session
		isValid, errors, err := backupSystem.VerifyBackupIntegrity(sessions[0].SessionID)
		if err != nil {
			t.Fatalf("Integrity verification failed: %v", err)
		}

		if !isValid {
			t.Errorf("Backup integrity verification failed: %v", errors)
		}
	})

	// Test 5: System status
	t.Run("SystemStatus", func(t *testing.T) {
		status := backupSystem.GetSystemStatus()
		
		if status["total_sessions"].(int) == 0 {
			t.Error("Total sessions should be greater than 0")
		}

		if status["total_files"].(int) == 0 {
			t.Error("Total files should be greater than 0")
		}

		if status["total_size"].(int64) == 0 {
			t.Error("Total size should be greater than 0")
		}
	})
}

func TestBackupManager(t *testing.T) {
	// Test backup manager creation
	manager, err := NewBackupManager()
	if err != nil {
		t.Fatalf("Failed to create backup manager: %v", err)
	}

	// Test manifest creation
	manifest, err := manager.GetManifest()
	if err != nil {
		t.Fatalf("Failed to get manifest: %v", err)
	}

	if manifest.Version == "" {
		t.Error("Manifest version should not be empty")
	}

	if manifest.CreatedAt.IsZero() {
		t.Error("Manifest created time should not be zero")
	}
}

func TestRestoreManager(t *testing.T) {
	// Create backup manager first
	manager, err := NewBackupManager()
	if err != nil {
		t.Fatalf("Failed to create backup manager: %v", err)
	}

	// Create restore manager
	restorer := NewRestoreManager(manager)

	// Test that restore manager is not running initially
	if restorer.IsRestoring() {
		t.Error("Restore manager should not be running initially")
	}

	// Test stopping restore (should not panic)
	restorer.StopRestore()
}

func TestSafeDeleter(t *testing.T) {
	// Create backup manager first
	manager, err := NewBackupManager()
	if err != nil {
		t.Fatalf("Failed to create backup manager: %v", err)
	}

	// Create safe deleter
	deleter := NewSafeDeleter(manager)

	// Test that deleter is not running initially
	if deleter.IsDeleting() {
		t.Error("Safe deleter should not be running initially")
	}

	// Test stopping deletion (should not panic)
	deleter.StopDeletion()
}

func TestCleanupOldBackups(t *testing.T) {
	// Create backup system
	backupSystem, err := NewBackupSystem()
	if err != nil {
		t.Fatalf("Failed to create backup system: %v", err)
	}

	// Test cleanup with very old duration (should not error)
	err = backupSystem.CleanupOldBackups(1 * time.Hour)
	if err != nil {
		t.Errorf("Cleanup should not error: %v", err)
	}
}
