package backup

import (
	"fmt"
	"log"
	"time"
)

// ExampleUsage demonstrates how to use the backup system
func ExampleUsage() {
	// Create a new backup system
	backupSystem, err := NewBackupSystem()
	if err != nil {
		log.Fatalf("Failed to create backup system: %v", err)
	}

	// Example files to backup and delete
	files := []string{
		"/tmp/cache_file1.txt",
		"/tmp/cache_file2.log",
		"/tmp/cache_dir/",
	}

	fmt.Println("=== Backup System Example ===")

	// 1. Create backups
	fmt.Println("1. Creating backups...")
	session, err := backupSystem.BackupFiles(files, "example_backup")
	if err != nil {
		log.Printf("Backup failed: %v", err)
		return
	}

	fmt.Printf("Backup session created: %s\n", session.SessionID)
	fmt.Printf("Files backed up: %d/%d\n", session.SuccessCount, session.TotalFiles)
	fmt.Printf("Backup size: %d bytes\n", session.BackupSize)

	// 2. Safely delete files with backup
	fmt.Println("\n2. Safely deleting files...")
	deletionResult, err := backupSystem.DeleteFilesWithBackup(files, "example_deletion")
	if err != nil {
		log.Printf("Safe deletion failed: %v", err)
		return
	}

	fmt.Printf("Files deleted: %d/%d\n", deletionResult.DeletedCount, deletionResult.TotalFiles)
	fmt.Printf("Backup session ID: %s\n", deletionResult.BackupSessionID)

	// 3. List backup sessions
	fmt.Println("\n3. Listing backup sessions...")
	sessions, err := backupSystem.ListSessions()
	if err != nil {
		log.Printf("Failed to list sessions: %v", err)
		return
	}

	fmt.Printf("Total backup sessions: %d\n", len(sessions))
	for _, session := range sessions {
		fmt.Printf("- Session %s: %s (%d files, %d bytes)\n", 
			session.SessionID, session.Operation, session.TotalFiles, session.TotalSize)
	}

	// 4. Verify backup integrity
	fmt.Println("\n4. Verifying backup integrity...")
	isValid, errors, err := backupSystem.VerifyBackupIntegrity(session.SessionID)
	if err != nil {
		log.Printf("Integrity verification failed: %v", err)
		return
	}

	if isValid {
		fmt.Println("✓ Backup integrity verified successfully")
	} else {
		fmt.Println("✗ Backup integrity issues found:")
		for _, err := range errors {
			fmt.Printf("  - %s\n", err)
		}
	}

	// 5. Restore files
	fmt.Println("\n5. Restoring files...")
	restoreResult, err := backupSystem.RestoreSession(session.SessionID, true)
	if err != nil {
		log.Printf("Restore failed: %v", err)
		return
	}

	fmt.Printf("Files restored: %d/%d\n", restoreResult.SuccessCount, restoreResult.TotalFiles)
	fmt.Printf("Restored size: %d bytes\n", restoreResult.RestoredSize)

	// 6. Get system status
	fmt.Println("\n6. System status:")
	status := backupSystem.GetSystemStatus()
	fmt.Printf("- Backup manager running: %v\n", status["backup_manager_running"])
	fmt.Printf("- Total sessions: %v\n", status["total_sessions"])
	fmt.Printf("- Total files: %v\n", status["total_files"])
	fmt.Printf("- Total size: %v bytes\n", status["total_size"])
	fmt.Printf("- Backup directory: %v\n", status["backup_directory"])

	// 7. Cleanup old backups (older than 7 days)
	fmt.Println("\n7. Cleaning up old backups...")
	err = backupSystem.CleanupOldBackups(7 * 24 * time.Hour)
	if err != nil {
		log.Printf("Cleanup failed: %v", err)
	} else {
		fmt.Println("✓ Old backups cleaned up successfully")
	}

	fmt.Println("\n=== Example completed ===")
}

// ExampleProgressMonitoring demonstrates how to monitor backup progress
func ExampleProgressMonitoring() {
	backupSystem, err := NewBackupSystem()
	if err != nil {
		log.Fatalf("Failed to create backup system: %v", err)
	}

	files := []string{
		"/tmp/large_file1.dat",
		"/tmp/large_file2.dat",
		"/tmp/large_file3.dat",
	}

	fmt.Println("=== Progress Monitoring Example ===")

	// Start monitoring progress in a goroutine
	go func() {
		for progress := range backupSystem.GetBackupProgressChannel() {
			fmt.Printf("Backup Progress: %.1f%% (%d/%d files) - %s\n", 
				progress.Progress, progress.FilesProcessed, progress.TotalFiles, progress.CurrentFile)
		}
	}()

	// Start monitoring deletion progress in a goroutine
	go func() {
		for progress := range backupSystem.GetDeletionProgressChannel() {
			fmt.Printf("Deletion Progress: %.1f%% (%d/%d files) - %s\n", 
				progress.Progress, progress.FilesProcessed, progress.TotalFiles, progress.CurrentFile)
		}
	}()

	// Perform backup and deletion
	session, err := backupSystem.BackupFiles(files, "progress_example")
	if err != nil {
		log.Printf("Backup failed: %v", err)
		return
	}

	deletionResult, err := backupSystem.DeleteFilesWithBackup(files, "progress_example")
	if err != nil {
		log.Printf("Deletion failed: %v", err)
		return
	}

	fmt.Printf("Completed: %d files backed up, %d files deleted\n", 
		session.SuccessCount, deletionResult.DeletedCount)
}
