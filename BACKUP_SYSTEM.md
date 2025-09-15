# Cache App Backup System

## Overview

The Cache App now includes a comprehensive backup system that safely handles file deletion operations by creating backups before removing files. This system provides data protection, integrity verification, and restoration capabilities.

## Features

### ✅ Core Functionality
- **Safe File Deletion**: Files are backed up before deletion
- **Backup Integrity**: SHA256 checksums verify backup integrity
- **Restoration Capability**: Full and selective file restoration
- **Progress Reporting**: Real-time progress updates for all operations
- **Metadata Tracking**: Complete audit trail of all operations

### ✅ Directory Structure
```
~/CacheCleaner/Backups/
├── manifest.json          # Central backup manifest
├── files/                 # Backup file storage
│   └── backup_<timestamp>/
│       ├── file1.txt
│       ├── file2.log
│       └── ...
├── metadata/              # Backup metadata
└── logs/                  # Operation logs
```

### ✅ Data Protection
- **Checksum Verification**: SHA256 hashes ensure file integrity
- **Conflict Resolution**: Handles duplicate file names automatically
- **Permission Preservation**: Maintains original file permissions
- **Atomic Operations**: Operations are atomic (all succeed or all fail)

## API Reference

### Main App Methods

#### Backup Operations
```go
// Create backups of files
BackupFiles(filesJSON string, operation string) (string, error)

// Safely delete files with backup
DeleteFilesWithBackup(filesJSON string, operation string) (string, error)

// Delete files without backup (use with caution)
DeleteFilesWithoutBackup(filesJSON string, operation string) (string, error)
```

#### Restoration Operations
```go
// Restore all files from a backup session
RestoreSession(sessionID string, overwrite bool) (string, error)

// Restore specific files from a backup session
RestoreFiles(sessionID string, filesJSON string, overwrite bool) (string, error)
```

#### Management Operations
```go
// Get backup manifest
GetBackupManifest() (string, error)

// Get specific backup session
GetBackupSession(sessionID string) (string, error)

// List all backup sessions
ListBackupSessions() (string, error)

// Verify backup integrity
VerifyBackupIntegrity(sessionID string) (string, error)

// Cleanup old backups (older than N days)
CleanupOldBackups(olderThanDays int) (string, error)

// Get system status
GetBackupSystemStatus() (string, error)

// Stop all operations
StopAllBackupOperations() error
```

## Usage Examples

### 1. Basic Backup and Deletion

```javascript
// Frontend JavaScript example
const files = [
    "/Users/user/Library/Caches/com.example.app/file1.cache",
    "/Users/user/Library/Caches/com.example.app/file2.cache"
];

// Create backup
const backupResult = await window.go.main.App.BackupFiles(
    JSON.stringify(files), 
    "cache_cleanup"
);

// Safely delete files
const deletionResult = await window.go.main.App.DeleteFilesWithBackup(
    JSON.stringify(files), 
    "cache_cleanup"
);

console.log("Backup session:", deletionResult.backup_session_id);
console.log("Files deleted:", deletionResult.deleted_count);
```

### 2. Restore Files

```javascript
// Restore all files from a session
const restoreResult = await window.go.main.App.RestoreSession(
    "backup_1703123456", 
    true  // overwrite existing files
);

// Restore specific files
const selectiveRestore = await window.go.main.App.RestoreFiles(
    "backup_1703123456",
    JSON.stringify(["/path/to/specific/file.cache"]),
    true
);
```

### 3. Monitor Progress

```javascript
// The backup system provides progress channels for real-time updates
// Progress includes:
// - Files processed / total files
// - Current file being processed
// - Elapsed time and estimated completion time
// - Data size processed
```

### 4. Verify Integrity

```javascript
// Verify backup integrity
const integrityResult = await window.go.main.App.VerifyBackupIntegrity(
    "backup_1703123456"
);

if (integrityResult.is_valid) {
    console.log("✓ Backup integrity verified");
} else {
    console.log("✗ Integrity issues found:", integrityResult.errors);
}
```

### 5. Cleanup Old Backups

```javascript
// Remove backups older than 30 days
const cleanupResult = await window.go.main.App.CleanupOldBackups(30);
console.log("Cleanup completed:", cleanupResult.status);
```

## Data Structures

### BackupSession
```json
{
    "session_id": "backup_1703123456",
    "start_time": "2023-12-21T10:30:00Z",
    "end_time": "2023-12-21T10:30:15Z",
    "operation": "cache_cleanup",
    "total_files": 5,
    "success_count": 5,
    "failure_count": 0,
    "total_size": 1048576,
    "backup_size": 1048576,
    "status": "completed"
}
```

### BackupEntry
```json
{
    "original_path": "/path/to/original/file.txt",
    "backup_path": "/Users/user/CacheCleaner/Backups/files/backup_1703123456/file.txt",
    "size": 1024,
    "checksum": "a1b2c3d4e5f6...",
    "backup_time": "2023-12-21T10:30:05Z",
    "operation": "cache_cleanup",
    "success": true,
    "metadata": {
        "permissions": "-rw-r--r--",
        "mod_time": "2023-12-21T10:25:00Z",
        "is_dir": false
    }
}
```

### DeletionResult
```json
{
    "operation": "cache_cleanup",
    "start_time": "2023-12-21T10:30:00Z",
    "end_time": "2023-12-21T10:30:20Z",
    "total_files": 5,
    "backed_up_count": 5,
    "deleted_count": 5,
    "failed_count": 0,
    "total_size": 1048576,
    "backed_up_size": 1048576,
    "deleted_size": 1048576,
    "backup_session_id": "backup_1703123456",
    "status": "completed"
}
```

## Error Handling

The backup system provides comprehensive error handling:

- **File Access Errors**: Permission denied, file not found
- **Disk Space Issues**: Insufficient space for backups
- **Integrity Failures**: Checksum mismatches
- **Operation Cancellation**: User-initiated stops
- **Concurrent Operations**: Prevention of overlapping operations

## Performance Considerations

### Large File Handling
- Uses `io.Copy` for efficient file operations
- Progress reporting for long-running operations
- Configurable buffer sizes for large files

### Memory Usage
- Streams files instead of loading into memory
- Minimal memory footprint for metadata
- Efficient JSON serialization

### Disk Space Management
- Automatic cleanup of old backups
- Configurable retention policies
- Space usage monitoring

## Security Features

### Data Protection
- SHA256 checksums for integrity verification
- Atomic operations prevent partial states
- Comprehensive audit logging

### Access Control
- Respects original file permissions
- Secure backup directory creation
- No sensitive data in logs

## Integration with Cache Scanner

The backup system integrates seamlessly with the existing cache scanner:

1. **Scan Phase**: Cache scanner identifies files to clean
2. **Safety Classification**: Files are classified by safety level
3. **Backup Phase**: Files are backed up before deletion
4. **Deletion Phase**: Files are safely removed
5. **Verification**: Backup integrity is verified

## Best Practices

### 1. Always Use Safe Deletion
```javascript
// ✅ Good: Safe deletion with backup
await DeleteFilesWithBackup(files, "cache_cleanup");

// ❌ Avoid: Direct deletion without backup
await DeleteFilesWithoutBackup(files, "cache_cleanup");
```

### 2. Verify Backups Regularly
```javascript
// Verify backup integrity after operations
const isValid = await VerifyBackupIntegrity(sessionId);
if (!isValid) {
    // Handle integrity issues
}
```

### 3. Cleanup Old Backups
```javascript
// Set up regular cleanup (e.g., weekly)
await CleanupOldBackups(30); // Keep backups for 30 days
```

### 4. Monitor Progress
```javascript
// Use progress channels for user feedback
// Show progress bars and estimated completion times
```

## Troubleshooting

### Common Issues

1. **Backup Directory Creation Failed**
   - Check home directory permissions
   - Ensure sufficient disk space

2. **File Permission Errors**
   - Run with appropriate permissions
   - Check file ownership

3. **Integrity Verification Failures**
   - Re-run backup operation
   - Check for disk corruption

4. **Restoration Failures**
   - Verify backup session exists
   - Check destination permissions

### Debug Information

Enable debug logging by checking the application logs for detailed operation information:

```bash
# View application logs
tail -f /path/to/cache_app.log
```

## Future Enhancements

Potential improvements for future versions:

- **Compression**: Compress backup files to save space
- **Encryption**: Encrypt sensitive backup data
- **Cloud Storage**: Support for cloud backup destinations
- **Scheduling**: Automated backup and cleanup schedules
- **Metrics**: Detailed performance and usage metrics
