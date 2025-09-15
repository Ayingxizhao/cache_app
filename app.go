package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"
	
	"cache_app/pkg/safety"
	"cache_app/pkg/backup"
	"cache_app/pkg/deletion"
)

// App struct
type App struct {
	ctx              context.Context
	cacheScanner     *CacheScanner
	lastScanResult   *CacheLocation
	backupSystem     *backup.BackupSystem
	deletionService  *deletion.DeletionService
	progressManager  *deletion.ProgressManager
	confirmationService *deletion.ConfirmationService
	mu               sync.RWMutex
}

// NewApp creates a new App application struct
func NewApp() *App {
	backupSystem, err := backup.NewBackupSystem()
	if err != nil {
		log.Printf("Warning: Failed to initialize backup system: %v", err)
		backupSystem = nil
	}
	
	var deletionService *deletion.DeletionService
	var progressManager *deletion.ProgressManager
	var confirmationService *deletion.ConfirmationService
	
	if backupSystem != nil {
		deletionService = deletion.NewDeletionService(backupSystem)
		progressManager = deletion.NewProgressManager()
		confirmationService = deletion.NewConfirmationService()
	}
	
	return &App{
		cacheScanner:        NewCacheScanner(),
		backupSystem:        backupSystem,
		deletionService:     deletionService,
		progressManager:     progressManager,
		confirmationService: confirmationService,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	log.Println("Cache App started successfully")
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ScanCacheLocation scans a single cache location asynchronously and returns immediately
func (a *App) ScanCacheLocation(locationID, locationName, path string) (string, error) {
	log.Printf("Starting scan of location: %s (%s)", locationName, path)
	
	// Check if already scanning
	if a.cacheScanner.IsScanning() {
		return "", fmt.Errorf("scan already in progress")
	}
	
	// Set scanning state before starting
	a.cacheScanner.SetScanning(true)
	
	// Start scan in goroutine
	go func() {
		defer a.cacheScanner.SetScanning(false)
		
		location, err := a.cacheScanner.ScanLocation(locationID, locationName, path)
		if err != nil {
			log.Printf("Error scanning location %s: %v", locationName, err)
			return
		}
		
		// Store the result
		a.mu.Lock()
		a.lastScanResult = location
		a.mu.Unlock()
		
		log.Printf("Completed scan of location: %s (files: %d, size: %d bytes)", 
			locationName, location.FileCount, location.TotalSize)
	}()
	
	// Return immediately with a status message
	return `{"status": "scan_started", "message": "Scan started in background"}`, nil
}

// ScanMultipleCacheLocations scans multiple cache locations concurrently
func (a *App) ScanMultipleCacheLocations(locationsJSON string) (string, error) {
	var locations []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Path string `json:"path"`
	}
	
	if err := json.Unmarshal([]byte(locationsJSON), &locations); err != nil {
		log.Printf("Error parsing locations JSON: %v", err)
		return "", fmt.Errorf("invalid locations JSON: %w", err)
	}
	
	log.Printf("Starting scan of %d locations", len(locations))
	
	// Convert to the expected type
	scanLocations := make([]struct {
		ID   string
		Name string
		Path string
	}, len(locations))
	
	for i, loc := range locations {
		scanLocations[i] = struct {
			ID   string
			Name string
			Path string
		}{ID: loc.ID, Name: loc.Name, Path: loc.Path}
	}
	
	result, err := a.cacheScanner.ScanMultipleLocations(scanLocations)
	if err != nil {
		log.Printf("Error scanning multiple locations: %v", err)
		return "", err
	}
	
	resultJSON, err := result.ToJSON()
	if err != nil {
		log.Printf("Error serializing scan result: %v", err)
		return "", err
	}
	
	log.Printf("Completed scan of %d locations (total files: %d, total size: %d bytes)", 
		len(locations), result.TotalFiles, result.TotalSize)
	
	return resultJSON, nil
}

// GetScanProgress returns the current scan progress
func (a *App) GetScanProgress() (string, error) {
	if !a.cacheScanner.IsScanning() {
		return "", fmt.Errorf("no scan in progress")
	}
	
	// This is a simplified version - in a real implementation,
	// you might want to store the last progress update
	return `{"status": "scanning"}`, nil
}

// GetLastScanResult returns the result of the last completed scan
func (a *App) GetLastScanResult() (string, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	
	if a.lastScanResult == nil {
		return `{"status": "no_result", "message": "No scan result available"}`, nil
	}
	
	result, err := a.lastScanResult.ToJSON()
	if err != nil {
		return "", fmt.Errorf("failed to serialize scan result: %w", err)
	}
	
	return result, nil
}

// StopScan stops the current scan operation
func (a *App) StopScan() error {
	if !a.cacheScanner.IsScanning() {
		return fmt.Errorf("no scan in progress")
	}
	
	a.cacheScanner.StopScan()
	log.Println("Scan stop requested")
	return nil
}

// IsScanning returns whether a scan is currently in progress
func (a *App) IsScanning() bool {
	return a.cacheScanner.IsScanning()
}

// GetCacheLocationsFromConfig loads cache locations from the JSON config file
func (a *App) GetCacheLocationsFromConfig() (string, error) {
	configPath := filepath.Join(".", "cache_locations.json")
	
	data, err := os.ReadFile(configPath)
	if err != nil {
		log.Printf("Error reading config file: %v", err)
		return "", fmt.Errorf("failed to read config file: %w", err)
	}
	
	// Parse the JSON to extract scanable locations
	var config struct {
		SystemCaches     []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Path string `json:"path"`
		} `json:"system_caches"`
		UserCaches       []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Path string `json:"path"`
		} `json:"user_caches"`
		ApplicationCaches []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Path string `json:"path"`
		} `json:"application_caches"`
	}
	
	if err := json.Unmarshal(data, &config); err != nil {
		log.Printf("Error parsing config JSON: %v", err)
		return "", fmt.Errorf("failed to parse config file: %w", err)
	}
	
	// Combine all locations into a single list
	var allLocations []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Path string `json:"path"`
		Type string `json:"type"`
	}
	
	for _, loc := range config.SystemCaches {
		allLocations = append(allLocations, struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Path string `json:"path"`
			Type string `json:"type"`
		}{ID: loc.ID, Name: loc.Name, Path: loc.Path, Type: "system"})
	}
	
	for _, loc := range config.UserCaches {
		allLocations = append(allLocations, struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Path string `json:"path"`
			Type string `json:"type"`
		}{ID: loc.ID, Name: loc.Name, Path: loc.Path, Type: "user"})
	}
	
	for _, loc := range config.ApplicationCaches {
		allLocations = append(allLocations, struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Path string `json:"path"`
			Type string `json:"type"`
		}{ID: loc.ID, Name: loc.Name, Path: loc.Path, Type: "application"})
	}
	
	result, err := json.Marshal(allLocations)
	if err != nil {
		log.Printf("Error marshaling locations: %v", err)
		return "", fmt.Errorf("failed to marshal locations: %w", err)
	}
	
	return string(result), nil
}

// GetCacheLocationInfo returns detailed information about a specific cache location
func (a *App) GetCacheLocationInfo(locationID string) (string, error) {
	configPath := filepath.Join(".", "cache_locations.json")
	
	data, err := os.ReadFile(configPath)
	if err != nil {
		return "", fmt.Errorf("failed to read config file: %w", err)
	}
	
	// Parse the entire config to find the specific location
	var config map[string]interface{}
	if err := json.Unmarshal(data, &config); err != nil {
		return "", fmt.Errorf("failed to parse config file: %w", err)
	}
	
	// Search through all location arrays for the matching ID
	locationArrays := []string{"system_caches", "user_caches", "application_caches", "special_locations"}
	
	for _, arrayName := range locationArrays {
		if locations, ok := config[arrayName].([]interface{}); ok {
			for _, loc := range locations {
				if locationMap, ok := loc.(map[string]interface{}); ok {
					if id, exists := locationMap["id"]; exists && id == locationID {
						result, err := json.Marshal(locationMap)
						if err != nil {
							return "", fmt.Errorf("failed to marshal location info: %w", err)
						}
						return string(result), nil
					}
				}
			}
		}
	}
	
	return "", fmt.Errorf("location with ID %s not found", locationID)
}

// GetSystemInfo returns basic system information
func (a *App) GetSystemInfo() (string, error) {
	info := map[string]interface{}{
		"os":           "macOS",
		"scan_time":    time.Now().Format(time.RFC3339),
		"app_version":  "1.0.0",
		"go_version":   "1.23+",
	}
	
	result, err := json.Marshal(info)
	if err != nil {
		return "", fmt.Errorf("failed to marshal system info: %w", err)
	}
	
	return string(result), nil
}

// GetSafetyClassificationSummary returns safety classification summary for a specific location
func (a *App) GetSafetyClassificationSummary(locationID string) (string, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	
	if a.lastScanResult == nil {
		return "", fmt.Errorf("no scan result available")
	}
	
	if a.lastScanResult.ID != locationID {
		return "", fmt.Errorf("location ID %s does not match last scan result", locationID)
	}
	
	summary := a.lastScanResult.GetSafetyClassificationSummary()
	result, err := json.Marshal(summary)
	if err != nil {
		return "", fmt.Errorf("failed to marshal safety classification summary: %w", err)
	}
	
	return string(result), nil
}

// ClassifyFileSafety classifies the safety of a specific file
func (a *App) ClassifyFileSafety(filePath string) (string, error) {
	// Get file info
	info, err := os.Stat(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to get file info for %s: %w", filePath, err)
	}
	
	// Create file metadata
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
	
	result, err := json.Marshal(classification)
	if err != nil {
		return "", fmt.Errorf("failed to marshal classification result: %w", err)
	}
	
	return string(result), nil
}

// GetSafetyClassificationRules returns the current safety classification rules
func (a *App) GetSafetyClassificationRules() (string, error) {
	config := safety.DefaultConfig()
	
	rules := map[string]interface{}{
		"safe_age_threshold_days":    int(config.SafeAgeThreshold.Hours() / 24),
		"caution_age_threshold_days": int(config.CautionAgeThreshold.Hours() / 24),
		"large_file_threshold_mb":    config.LargeFileThreshold / (1024 * 1024),
		"system_critical_paths":      config.SystemCriticalPaths,
		"temp_dir_patterns":          config.TempDirPatterns,
		"dev_cache_patterns":         config.DevCachePatterns,
	}
	
	result, err := json.Marshal(rules)
	if err != nil {
		return "", fmt.Errorf("failed to marshal classification rules: %w", err)
	}
	
	return string(result), nil
}

// GetFilesBySafetyLevel returns files filtered by safety level from the last scan
func (a *App) GetFilesBySafetyLevel(locationID, safetyLevel string) (string, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	
	if a.lastScanResult == nil {
		return "", fmt.Errorf("no scan result available")
	}
	
	if a.lastScanResult.ID != locationID {
		return "", fmt.Errorf("location ID %s does not match last scan result", locationID)
	}
	
	var filteredFiles []CacheFile
	var targetLevel safety.SafetyLevel
	
	switch safetyLevel {
	case "Safe":
		targetLevel = safety.Safe
	case "Caution":
		targetLevel = safety.Caution
	case "Risky":
		targetLevel = safety.Risky
	default:
		return "", fmt.Errorf("invalid safety level: %s. Must be Safe, Caution, or Risky", safetyLevel)
	}
	
	for _, file := range a.lastScanResult.Files {
		if !file.IsDir && file.SafetyClassification != nil && file.SafetyClassification.Level == targetLevel {
			filteredFiles = append(filteredFiles, file)
		}
	}
	
	result := map[string]interface{}{
		"location_id":     locationID,
		"safety_level":    safetyLevel,
		"files":           filteredFiles,
		"total_files":     len(filteredFiles),
	}
	
	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal filtered files result: %w", err)
	}
	
	return string(jsonResult), nil
}

// BackupFiles creates backups of the specified files
func (a *App) BackupFiles(filesJSON string, operation string) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	var files []string
	if err := json.Unmarshal([]byte(filesJSON), &files); err != nil {
		return "", fmt.Errorf("invalid files JSON: %w", err)
	}

	log.Printf("Starting backup of %d files for operation: %s", len(files), operation)

	session, err := a.backupSystem.BackupFiles(files, operation)
	if err != nil {
		log.Printf("Error creating backup: %v", err)
		return "", err
	}

	result, err := json.Marshal(session)
	if err != nil {
		return "", fmt.Errorf("failed to marshal backup session: %w", err)
	}

	log.Printf("Completed backup session %s: %d files backed up", session.SessionID, session.SuccessCount)
	return string(result), nil
}

// DeleteFilesWithBackup safely deletes files after creating backups
func (a *App) DeleteFilesWithBackup(filesJSON string, operation string) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	var files []string
	if err := json.Unmarshal([]byte(filesJSON), &files); err != nil {
		return "", fmt.Errorf("invalid files JSON: %w", err)
	}

	log.Printf("Starting safe deletion of %d files for operation: %s", len(files), operation)

	result, err := a.backupSystem.DeleteFilesWithBackup(files, operation)
	if err != nil {
		log.Printf("Error during safe deletion: %v", err)
		return "", err
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal deletion result: %w", err)
	}

	log.Printf("Completed safe deletion: %d files deleted, backup session: %s", result.DeletedCount, result.BackupSessionID)
	return string(jsonResult), nil
}

// RestoreSession restores all files from a backup session
func (a *App) RestoreSession(sessionID string, overwrite bool) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	log.Printf("Starting restore of session: %s", sessionID)

	result, err := a.backupSystem.RestoreSession(sessionID, overwrite)
	if err != nil {
		log.Printf("Error during restore: %v", err)
		return "", err
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal restore result: %w", err)
	}

	log.Printf("Completed restore: %d files restored", result.SuccessCount)
	return string(jsonResult), nil
}

// RestoreFiles restores specific files from a backup session
func (a *App) RestoreFiles(sessionID string, filesJSON string, overwrite bool) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	var files []string
	if err := json.Unmarshal([]byte(filesJSON), &files); err != nil {
		return "", fmt.Errorf("invalid files JSON: %w", err)
	}

	log.Printf("Starting selective restore of %d files from session: %s", len(files), sessionID)

	result, err := a.backupSystem.RestoreFiles(sessionID, files, overwrite)
	if err != nil {
		log.Printf("Error during selective restore: %v", err)
		return "", err
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal restore result: %w", err)
	}

	log.Printf("Completed selective restore: %d files restored", result.SuccessCount)
	return string(jsonResult), nil
}

// GetBackupManifest returns the current backup manifest
func (a *App) GetBackupManifest() (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	manifest, err := a.backupSystem.GetManifest()
	if err != nil {
		return "", fmt.Errorf("failed to get backup manifest: %w", err)
	}

	result, err := json.Marshal(manifest)
	if err != nil {
		return "", fmt.Errorf("failed to marshal manifest: %w", err)
	}

	return string(result), nil
}

// GetBackupSession returns a specific backup session by ID
func (a *App) GetBackupSession(sessionID string) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	session, err := a.backupSystem.GetSession(sessionID)
	if err != nil {
		return "", fmt.Errorf("failed to get backup session: %w", err)
	}

	result, err := json.Marshal(session)
	if err != nil {
		return "", fmt.Errorf("failed to marshal session: %w", err)
	}

	return string(result), nil
}

// ListBackupSessions returns all backup sessions
func (a *App) ListBackupSessions() (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	sessions, err := a.backupSystem.ListSessions()
	if err != nil {
		return "", fmt.Errorf("failed to list backup sessions: %w", err)
	}

	result, err := json.Marshal(sessions)
	if err != nil {
		return "", fmt.Errorf("failed to marshal sessions: %w", err)
	}

	return string(result), nil
}

// VerifyBackupIntegrity verifies the integrity of a backup session
func (a *App) VerifyBackupIntegrity(sessionID string) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	isValid, errors, err := a.backupSystem.VerifyBackupIntegrity(sessionID)
	if err != nil {
		return "", fmt.Errorf("failed to verify backup integrity: %w", err)
	}

	result := map[string]interface{}{
		"session_id": sessionID,
		"is_valid":   isValid,
		"errors":     errors,
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal verification result: %w", err)
	}

	return string(jsonResult), nil
}

// CleanupOldBackups removes backup sessions older than the specified duration (in days)
func (a *App) CleanupOldBackups(olderThanDays int) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	olderThan := time.Duration(olderThanDays) * 24 * time.Hour
	err := a.backupSystem.CleanupOldBackups(olderThan)
	if err != nil {
		return "", fmt.Errorf("failed to cleanup old backups: %w", err)
	}

	result := map[string]interface{}{
		"status":        "completed",
		"older_than":    olderThanDays,
		"cleanup_time":  time.Now(),
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal cleanup result: %w", err)
	}

	log.Printf("Cleaned up backups older than %d days", olderThanDays)
	return string(jsonResult), nil
}

// GetBackupSystemStatus returns the current status of the backup system
func (a *App) GetBackupSystemStatus() (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	status := a.backupSystem.GetSystemStatus()
	result, err := json.Marshal(status)
	if err != nil {
		return "", fmt.Errorf("failed to marshal system status: %w", err)
	}

	return string(result), nil
}

// StopAllBackupOperations stops all running backup operations
func (a *App) StopAllBackupOperations() error {
	if a.backupSystem == nil {
		return fmt.Errorf("backup system not available")
	}

	a.backupSystem.StopAllOperations()
	log.Println("Stopped all backup operations")
	return nil
}

// DeleteFilesWithConfirmation safely deletes files with mandatory backup and user confirmation
func (a *App) DeleteFilesWithConfirmation(filesJSON string, operation string, forceDelete bool, dryRun bool) (string, error) {
	if a.deletionService == nil {
		return "", fmt.Errorf("deletion service not available")
	}

	var files []string
	if err := json.Unmarshal([]byte(filesJSON), &files); err != nil {
		return "", fmt.Errorf("invalid files JSON: %w", err)
	}

	log.Printf("Starting deletion with confirmation: %d files, operation: %s, force: %v, dry_run: %v", 
		len(files), operation, forceDelete, dryRun)

	// Create deletion request
	request := &deletion.DeletionRequest{
		Files:       files,
		Operation:   operation,
		ForceDelete: forceDelete,
		DryRun:      dryRun,
	}

	// Validate deletion request
	safetyResult, err := a.deletionService.ValidateDeletionRequest(request)
	if err != nil {
		return "", fmt.Errorf("validation failed: %w", err)
	}

	// Create confirmation dialog
	dialog := a.confirmationService.CreateConfirmationDialog(operation, files, safetyResult.TotalSize, safetyResult, map[string]interface{}{
		"force_delete": forceDelete,
		"dry_run":      dryRun,
	})

	// Return confirmation dialog for user review
	dialogJSON, err := json.Marshal(dialog)
	if err != nil {
		return "", fmt.Errorf("failed to marshal confirmation dialog: %w", err)
	}

	return string(dialogJSON), nil
}

// ConfirmDeletion confirms a deletion operation and proceeds with deletion
func (a *App) ConfirmDeletion(dialogJSON string, filesJSON string, confirmed bool, forceDelete bool, dryRun bool) (string, error) {
	if a.deletionService == nil {
		return "", fmt.Errorf("deletion service not available")
	}

	if !confirmed {
		return "", fmt.Errorf("deletion not confirmed by user")
	}

	var dialog deletion.ConfirmationDialog
	if err := json.Unmarshal([]byte(dialogJSON), &dialog); err != nil {
		return "", fmt.Errorf("invalid dialog JSON: %w", err)
	}

	// Create deletion request - we need to get the original files from the request
	// For now, we'll use the files from the original request
	var files []string
	if err := json.Unmarshal([]byte(filesJSON), &files); err != nil {
		return "", fmt.Errorf("invalid files JSON: %w", err)
	}
	
	request := &deletion.DeletionRequest{
		Files:       files,
		Operation:   dialog.Operation,
		ForceDelete: forceDelete,
		DryRun:      dryRun,
	}

	// Create progress tracker
	operationID := fmt.Sprintf("deletion_%d", time.Now().Unix())
	tracker := a.progressManager.NewProgressTracker(operationID)

	// Start deletion in goroutine
	go func() {
		defer a.progressManager.RemoveTracker(operationID)
		
		tracker.SetStatus("starting", "Starting deletion operation...")
		
		result, err := a.deletionService.DeleteFilesWithBackup(request)
		if err != nil {
			tracker.Fail(fmt.Sprintf("Deletion failed: %v", err))
			return
		}

		if result.Status == "completed" {
			tracker.Complete(fmt.Sprintf("Deletion completed: %d files deleted", result.DeletedCount))
		} else {
			tracker.Fail(fmt.Sprintf("Deletion failed: %s", result.Error))
		}
	}()

	// Return operation ID for progress tracking
	return fmt.Sprintf(`{"operation_id": "%s", "status": "started"}`, operationID), nil
}

// GetDeletionProgress returns the progress of a deletion operation
func (a *App) GetDeletionProgress(operationID string) (string, error) {
	if a.progressManager == nil {
		return "", fmt.Errorf("progress manager not available")
	}

	tracker, err := a.progressManager.GetTracker(operationID)
	if err != nil {
		return "", err
	}

	progressJSON, err := tracker.GetProgressJSON()
	if err != nil {
		return "", fmt.Errorf("failed to marshal progress: %w", err)
	}

	return progressJSON, nil
}

// StopDeletion stops a running deletion operation
func (a *App) StopDeletion(operationID string) error {
	if a.deletionService == nil {
		return fmt.Errorf("deletion service not available")
	}

	// Stop the deletion service
	a.deletionService.StopDeletion()

	// Update progress tracker
	if tracker, err := a.progressManager.GetTracker(operationID); err == nil {
		tracker.Cancel("Deletion stopped by user")
	}

	return nil
}

// RestoreFromBackup restores files from a backup session
func (a *App) RestoreFromBackup(sessionID string, overwrite bool) (string, error) {
	if a.deletionService == nil {
		return "", fmt.Errorf("deletion service not available")
	}

	log.Printf("Starting restore from backup session: %s", sessionID)

	result, err := a.deletionService.RestoreFromBackup(sessionID, overwrite)
	if err != nil {
		log.Printf("Error during restore: %v", err)
		return "", err
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal restore result: %w", err)
	}

	log.Printf("Completed restore: %d files restored", result.SuccessCount)
	return string(jsonResult), nil
}

// GetDeletionHistory returns the history of deletion operations
func (a *App) GetDeletionHistory() (string, error) {
	if a.deletionService == nil {
		return "", fmt.Errorf("deletion service not available")
	}

	history, err := a.deletionService.GetDeletionHistory()
	if err != nil {
		return "", fmt.Errorf("failed to get deletion history: %w", err)
	}

	result, err := json.Marshal(history)
	if err != nil {
		return "", fmt.Errorf("failed to marshal deletion history: %w", err)
	}

	return string(result), nil
}

// GetAvailableBackups returns all available backup sessions for restore
func (a *App) GetAvailableBackups() (string, error) {
	if a.deletionService == nil {
		return "", fmt.Errorf("deletion service not available")
	}

	sessions, err := a.deletionService.GetBackupSessions()
	if err != nil {
		return "", fmt.Errorf("failed to get backup sessions: %w", err)
	}

	result, err := json.Marshal(sessions)
	if err != nil {
		return "", fmt.Errorf("failed to marshal backup sessions: %w", err)
	}

	return string(result), nil
}

// ValidateFilesForDeletion validates files before deletion
func (a *App) ValidateFilesForDeletion(filesJSON string, operation string) (string, error) {
	if a.deletionService == nil {
		return "", fmt.Errorf("deletion service not available")
	}

	var files []string
	if err := json.Unmarshal([]byte(filesJSON), &files); err != nil {
		return "", fmt.Errorf("invalid files JSON: %w", err)
	}

	request := &deletion.DeletionRequest{
		Files:     files,
		Operation: operation,
		DryRun:    true, // This is just validation
	}

	safetyResult, err := a.deletionService.ValidateDeletionRequest(request)
	if err != nil {
		return "", fmt.Errorf("validation failed: %w", err)
	}

	result, err := json.Marshal(safetyResult)
	if err != nil {
		return "", fmt.Errorf("failed to marshal safety result: %w", err)
	}

	return string(result), nil
}

// GetDeletionSystemStatus returns the current status of the deletion system
func (a *App) GetDeletionSystemStatus() (string, error) {
	if a.deletionService == nil {
		return "", fmt.Errorf("deletion service not available")
	}

	status := map[string]interface{}{
		"deletion_service_available": a.deletionService != nil,
		"progress_manager_available": a.progressManager != nil,
		"confirmation_service_available": a.confirmationService != nil,
		"is_deleting": a.deletionService.IsDeleting(),
	}

	if a.progressManager != nil {
		status["progress_stats"] = a.progressManager.GetManagerStats()
	}

	if a.confirmationService != nil {
		status["confirmation_stats"] = a.confirmationService.GetDialogStats()
	}

	result, err := json.Marshal(status)
	if err != nil {
		return "", fmt.Errorf("failed to marshal system status: %w", err)
	}

	return string(result), nil
}

// Backup Management Interface Methods

// GetBackupBrowserData returns comprehensive backup browser data
func (a *App) GetBackupBrowserData() (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	// Get all sessions
	sessions, err := a.backupSystem.ListSessions()
	if err != nil {
		return "", fmt.Errorf("failed to list backup sessions: %w", err)
	}

	// Get system status
	systemStatus := a.backupSystem.GetSystemStatus()

	// Calculate summary statistics
	var totalSessions, totalFiles, totalSize int
	var oldestSession, newestSession time.Time
	
	if len(sessions) > 0 {
		totalSessions = len(sessions)
		oldestSession = sessions[0].StartTime
		newestSession = sessions[0].StartTime
		
		for _, session := range sessions {
			totalFiles += session.TotalFiles
			totalSize += int(session.TotalSize)
			
			if session.StartTime.Before(oldestSession) {
				oldestSession = session.StartTime
			}
			if session.StartTime.After(newestSession) {
				newestSession = session.StartTime
			}
		}
	}

	browserData := map[string]interface{}{
		"sessions": sessions,
		"summary": map[string]interface{}{
			"total_sessions": totalSessions,
			"total_files":    totalFiles,
			"total_size":     totalSize,
			"oldest_session": oldestSession,
			"newest_session": newestSession,
		},
		"system_status": systemStatus,
	}

	result, err := json.Marshal(browserData)
	if err != nil {
		return "", fmt.Errorf("failed to marshal backup browser data: %w", err)
	}

	return string(result), nil
}

// GetBackupSessionDetails returns detailed information about a specific backup session
func (a *App) GetBackupSessionDetails(sessionID string) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	session, err := a.backupSystem.GetSession(sessionID)
	if err != nil {
		return "", fmt.Errorf("failed to get backup session: %w", err)
	}

	// Verify integrity
	isValid, errors, err := a.backupSystem.VerifyBackupIntegrity(sessionID)
	if err != nil {
		log.Printf("Warning: Failed to verify backup integrity: %v", err)
		isValid = false
		errors = []string{"Integrity check failed"}
	}

	// Get restoreable files
	restoreableFiles, err := a.backupSystem.GetRestorer().GetRestoreableFiles(sessionID)
	if err != nil {
		log.Printf("Warning: Failed to get restoreable files: %v", err)
		restoreableFiles = []string{}
	}

	details := map[string]interface{}{
		"session":          session,
		"integrity_valid":  isValid,
		"integrity_errors": errors,
		"restoreable_files": restoreableFiles,
		"can_restore":      len(restoreableFiles) > 0,
	}

	result, err := json.Marshal(details)
	if err != nil {
		return "", fmt.Errorf("failed to marshal session details: %w", err)
	}

	return string(result), nil
}

// PreviewRestoreOperation shows what would be restored without actually restoring
func (a *App) PreviewRestoreOperation(sessionID string, filesJSON string) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	var filePaths []string
	if filesJSON != "" {
		if err := json.Unmarshal([]byte(filesJSON), &filePaths); err != nil {
			return "", fmt.Errorf("invalid files JSON: %w", err)
		}
	}

	var preview *backup.RestoreResult
	var err error

	if len(filePaths) > 0 {
		// Preview selective restore
		preview, err = a.backupSystem.GetRestorer().PreviewRestore(sessionID)
		if err != nil {
			return "", fmt.Errorf("failed to preview restore: %w", err)
		}
	} else {
		// Preview full restore
		preview, err = a.backupSystem.GetRestorer().PreviewRestore(sessionID)
		if err != nil {
			return "", fmt.Errorf("failed to preview restore: %w", err)
		}
	}

	result, err := json.Marshal(preview)
	if err != nil {
		return "", fmt.Errorf("failed to marshal preview result: %w", err)
	}

	return string(result), nil
}

// RestoreFromBackupWithOptions restores files with various options
func (a *App) RestoreFromBackupWithOptions(sessionID string, filesJSON string, overwrite bool, createBackup bool) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	var filePaths []string
	if filesJSON != "" {
		if err := json.Unmarshal([]byte(filesJSON), &filePaths); err != nil {
			return "", fmt.Errorf("invalid files JSON: %w", err)
		}
	}

	var result *backup.RestoreResult
	var err error

	if len(filePaths) > 0 {
		// Selective restore
		log.Printf("Starting selective restore of %d files from session: %s", len(filePaths), sessionID)
		result, err = a.backupSystem.RestoreFiles(sessionID, filePaths, overwrite)
	} else {
		// Full restore
		log.Printf("Starting full restore from session: %s", sessionID)
		result, err = a.backupSystem.RestoreSession(sessionID, overwrite)
	}

	if err != nil {
		log.Printf("Error during restore: %v", err)
		return "", err
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal restore result: %w", err)
	}

	log.Printf("Completed restore: %d files restored", result.SuccessCount)
	return string(jsonResult), nil
}

// DeleteBackupSession deletes a specific backup session
func (a *App) DeleteBackupSession(sessionID string) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	// Get session details first
	session, err := a.backupSystem.GetSession(sessionID)
	if err != nil {
		return "", fmt.Errorf("failed to get backup session: %w", err)
	}

	// Delete the session directory - we need to construct the path manually
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("failed to get home directory: %w", err)
	}
	backupDir := filepath.Join(homeDir, "CacheCleaner", "Backups")
	sessionDir := filepath.Join(backupDir, "files", sessionID)
	if err := os.RemoveAll(sessionDir); err != nil {
		return "", fmt.Errorf("failed to remove session directory: %w", err)
	}

	// Remove from manifest
	manifest, err := a.backupSystem.GetManifest()
	if err != nil {
		return "", fmt.Errorf("failed to get manifest: %w", err)
	}

	var updatedSessions []backup.BackupSession
	for _, s := range manifest.Sessions {
		if s.SessionID != sessionID {
			updatedSessions = append(updatedSessions, s)
		}
	}

	manifest.Sessions = updatedSessions
	manifest.TotalSessions = len(updatedSessions)
	manifest.LastUpdated = time.Now()

	// Recalculate totals
	manifest.TotalFiles = 0
	manifest.TotalSize = 0
	for _, s := range updatedSessions {
		manifest.TotalFiles += s.TotalFiles
		manifest.TotalSize += s.TotalSize
	}

	// Save updated manifest - we need to create a new manager instance to access saveManifest
	manager, err := backup.NewBackupManager()
	if err != nil {
		return "", fmt.Errorf("failed to create backup manager: %w", err)
	}
	if err := manager.saveManifest(manifest); err != nil {
		return "", fmt.Errorf("failed to update manifest: %w", err)
	}

	result := map[string]interface{}{
		"status":     "success",
		"session_id": sessionID,
		"deleted_at": time.Now(),
		"session_info": map[string]interface{}{
			"operation":    session.Operation,
			"total_files": session.TotalFiles,
			"total_size":  session.TotalSize,
			"created_at":  session.StartTime,
		},
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal deletion result: %w", err)
	}

	log.Printf("Deleted backup session: %s", sessionID)
	return string(jsonResult), nil
}

// CleanupBackupsByAge removes backup sessions older than specified days
func (a *App) CleanupBackupsByAge(olderThanDays int) (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	olderThan := time.Duration(olderThanDays) * 24 * time.Hour
	
	// Get sessions before cleanup
	sessionsBefore, err := a.backupSystem.ListSessions()
	if err != nil {
		return "", fmt.Errorf("failed to list sessions before cleanup: %w", err)
	}

	err = a.backupSystem.CleanupOldBackups(olderThan)
	if err != nil {
		return "", fmt.Errorf("failed to cleanup old backups: %w", err)
	}

	// Get sessions after cleanup
	sessionsAfter, err := a.backupSystem.ListSessions()
	if err != nil {
		return "", fmt.Errorf("failed to list sessions after cleanup: %w", err)
	}

	deletedCount := len(sessionsBefore) - len(sessionsAfter)

	result := map[string]interface{}{
		"status":           "completed",
		"older_than_days": olderThanDays,
		"cleanup_time":     time.Now(),
		"sessions_before":  len(sessionsBefore),
		"sessions_after":   len(sessionsAfter),
		"deleted_count":    deletedCount,
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal cleanup result: %w", err)
	}

	log.Printf("Cleaned up %d backup sessions older than %d days", deletedCount, olderThanDays)
	return string(jsonResult), nil
}

// GetBackupProgress returns the current backup progress
func (a *App) GetBackupProgress() (string, error) {
	if a.backupSystem == nil {
		return "", fmt.Errorf("backup system not available")
	}

	status := a.backupSystem.GetSystemStatus()
	
	// Check if any operations are running
	isRunning := status["backup_manager_running"].(bool) || 
		status["restore_manager_running"].(bool) || 
		status["deleter_running"].(bool)

	progress := map[string]interface{}{
		"is_running": isRunning,
		"status":     status,
	}

	result, err := json.Marshal(progress)
	if err != nil {
		return "", fmt.Errorf("failed to marshal progress: %w", err)
	}

	return string(result), nil
}

// RevealInFinder opens macOS Finder and reveals the specified file or folder
func (a *App) RevealInFinder(filePath string) (string, error) {
	// Expand tilde in path if present
	expandedPath, err := expandTilde(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to expand path %s: %w", filePath, err)
	}
	
	// Check if the file/folder exists
	if _, err := os.Stat(expandedPath); os.IsNotExist(err) {
		return "", fmt.Errorf("file or folder does not exist: %s", expandedPath)
	}
	
	// Use macOS 'open' command to reveal the file in Finder
	// The -R flag reveals the file in Finder
	cmd := exec.Command("open", "-R", expandedPath)
	
	// Run the command
	err = cmd.Run()
	if err != nil {
		log.Printf("Failed to reveal %s in Finder: %v", expandedPath, err)
		return "", fmt.Errorf("failed to reveal file in Finder: %w", err)
	}
	
	log.Printf("Successfully revealed %s in Finder", expandedPath)
	
	result := map[string]interface{}{
		"status": "success",
		"message": fmt.Sprintf("Revealed %s in Finder", expandedPath),
		"path": expandedPath,
	}
	
	jsonResult, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal result: %w", err)
	}
	
	return string(jsonResult), nil
}
