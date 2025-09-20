package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"
	"time"
	
	"cache_app/internal/config"
	"cache_app/internal/ui"
	"cache_app/pkg/backup"
	"cache_app/pkg/deletion"
)

// EnhancedApp struct with error handling integration
type EnhancedApp struct {
	ctx              context.Context
	cacheScanner     *CacheScanner
	lastScanResult   *CacheLocation
	backupSystem     *backup.BackupSystem
	deletionService  *deletion.DeletionService
	progressManager  *deletion.ProgressManager
	confirmationService *deletion.ConfirmationService
	settingsManager  *config.SettingsManager
	
	// Enhanced error handling components
	errorHandler     *ui.ErrorHandler
	notificationManager *ui.NotificationManager
	logManager       *ui.LogManager
	errorCollector   *ui.ErrorCollector
	
	mu               sync.RWMutex
}

// NewEnhancedApp creates a new enhanced app with error handling
func NewEnhancedApp() *EnhancedApp {
	// Setup logging first
	logManager, err := ui.SetupDefaultLogging("./logs")
	if err != nil {
		log.Printf("Warning: Failed to setup logging: %v", err)
		// Create a basic console logger as fallback
		logManager = ui.NewLogManager()
		appLogger, _ := ui.CreateLoggerFromConfig(ui.DefaultLogConfig())
		logManager.AddLogger("app", appLogger)
	}
	
	appLogger, _ := logManager.GetLogger("app")
	
	// Initialize error handling components
	errorHandler := ui.NewErrorHandler(appLogger)
	notificationManager := ui.NewNotificationManager(appLogger)
	errorCollector := ui.NewErrorCollector()
	
	// Add error callback to collect errors
	errorHandler.AddCallback(func(err *ui.AppError) {
		errorCollector.AddError(err)
	})
	
	// Initialize backup system with error handling
	var backupSystem *backup.BackupSystem
	backupSystem, err = backup.NewBackupSystem()
	if err != nil {
		appErr := ui.BackupError("Failed to initialize backup system", err)
		errorHandler.HandleError(appErr, map[string]interface{}{
			"component": "backup_system",
			"operation": "initialization",
		})
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
	
	// Initialize settings manager with error handling
	var settingsManager *config.SettingsManager
	settingsManager, err = config.NewSettingsManager()
	if err != nil {
		appErr := ui.InternalError("Failed to initialize settings manager", err)
		errorHandler.HandleError(appErr, map[string]interface{}{
			"component": "settings_manager",
			"operation": "initialization",
		})
		settingsManager = nil
	}
	
	return &EnhancedApp{
		cacheScanner:        NewCacheScanner(),
		backupSystem:        backupSystem,
		deletionService:     deletionService,
		progressManager:     progressManager,
		confirmationService: confirmationService,
		settingsManager:     settingsManager,
		errorHandler:        errorHandler,
		notificationManager: notificationManager,
		logManager:          logManager,
		errorCollector:      errorCollector,
	}
}

// startup is called when the app starts with enhanced logging
func (a *EnhancedApp) startup(ctx context.Context) {
	a.ctx = ctx
	
	// Log startup with enhanced logging
	appLogger, _ := a.logManager.GetLogger("app")
	appLogger.Info("Enhanced Cache App started successfully", map[string]interface{}{
		"version": "1.0.0",
		"components": map[string]bool{
			"backup_system": a.backupSystem != nil,
			"deletion_service": a.deletionService != nil,
			"settings_manager": a.settingsManager != nil,
		},
	})
	
	// Show startup notification
	a.notificationManager.ShowInfoNotification(
		"Enhanced Cache App Started",
		"Application initialized with comprehensive error handling",
	)
}

// ScanCacheLocationEnhanced scans a single cache location with enhanced error handling
func (a *EnhancedApp) ScanCacheLocationEnhanced(locationID, locationName, path string) (string, error) {
	appLogger, _ := a.logManager.GetLogger("app")
	appLogger.Info("Starting enhanced cache location scan", map[string]interface{}{
		"location_id": locationID,
		"location_name": locationName,
		"path": path,
	})
	
	// Check if already scanning
	if a.cacheScanner.IsScanning() {
		err := ui.ValidationError("Scan already in progress")
		a.errorHandler.HandleError(err, map[string]interface{}{
			"operation": "scan_location",
			"location_id": locationID,
		})
		return "", err
	}
	
	// Show progress notification
	progressID := a.notificationManager.ShowProgressNotification(
		"Scanning Cache Location",
		fmt.Sprintf("Scanning %s...", locationName),
		0, // Will be updated when we know the total
	)
	
	// Set scanning state before starting
	a.cacheScanner.SetScanning(true)
	
	// Start scan in goroutine with error handling
	go func() {
		defer a.cacheScanner.SetScanning(false)
		
		// Wrap the scan operation with error handling
		err := a.errorHandler.SafeExecute(func() error {
			location, err := a.cacheScanner.ScanLocation(locationID, locationName, path)
			if err != nil {
				return ui.ScanError(fmt.Sprintf("Failed to scan location %s", locationName), err)
			}
			
			// Store the result
			a.mu.Lock()
			a.lastScanResult = location
			a.mu.Unlock()
			
			// Complete progress notification
			a.notificationManager.CompleteProgressNotification(
				progressID,
				fmt.Sprintf("Scan completed: %s", locationName),
			)
			
			// Show success notification
			a.notificationManager.ShowSuccessNotification(
				"Scan Completed",
				fmt.Sprintf("Found %d files (%d bytes) in %s", 
					location.FileCount, location.TotalSize, locationName),
			)
			
			appLogger.Info("Cache location scan completed", map[string]interface{}{
				"location_id": locationID,
				"location_name": locationName,
				"file_count": location.FileCount,
				"total_size": location.TotalSize,
				"scan_duration": location.ScanDuration.String(),
			})
			
			return nil
		}, map[string]interface{}{
			"operation": "scan_location",
			"location_id": locationID,
			"location_name": locationName,
			"path": path,
		})
		
		if err != nil {
			// Handle scan error
			appErr := a.errorHandler.HandleError(err, map[string]interface{}{
				"operation": "scan_location",
				"location_id": locationID,
				"location_name": locationName,
			})
			
			// Fail progress notification
			a.notificationManager.FailProgressNotification(
				progressID,
				fmt.Sprintf("Scan failed: %s", locationName),
			)
			
			// Show error notification
			a.notificationManager.ShowErrorNotification(
				"Scan Failed",
				appErr.UserMessage,
			)
		}
	}()
	
	// Return immediately with a status message
	return `{"status": "scan_started", "message": "Scan started in background", "progress_id": "` + progressID + `"}`, nil
}

// GetErrorSummary returns a summary of application errors
func (a *EnhancedApp) GetErrorSummary() (string, error) {
	summary := a.errorCollector.GetSummary()
	result, err := json.Marshal(summary)
	if err != nil {
		appErr := ui.InternalError("Failed to marshal error summary", err)
		a.errorHandler.HandleError(appErr, map[string]interface{}{
			"operation": "marshal_error_summary",
		})
		return "", appErr
	}
	
	return string(result), nil
}

// GetNotificationSummary returns a summary of notifications
func (a *EnhancedApp) GetNotificationSummary() (string, error) {
	summary := a.notificationManager.GetNotificationSummary()
	result, err := json.Marshal(summary)
	if err != nil {
		appErr := ui.InternalError("Failed to marshal notification summary", err)
		a.errorHandler.HandleError(appErr, map[string]interface{}{
			"operation": "marshal_notification_summary",
		})
		return "", appErr
	}
	
	return string(result), nil
}

// ShowNotificationEnhanced shows a notification with enhanced error handling
func (a *EnhancedApp) ShowNotificationEnhanced(notificationJSON string) (string, error) {
	var notification ui.Notification
	if err := json.Unmarshal([]byte(notificationJSON), &notification); err != nil {
		appErr := ui.ValidationError("Invalid notification JSON format")
		a.errorHandler.HandleError(appErr, map[string]interface{}{
			"operation": "show_notification",
			"input": notificationJSON,
		})
		return "", appErr
	}
	
	a.notificationManager.ShowNotification(&notification)
	
	result := map[string]interface{}{
		"status": "success",
		"message": "Notification shown successfully",
		"notification_id": notification.ID,
	}
	
	jsonResult, err := json.Marshal(result)
	if err != nil {
		appErr := ui.InternalError("Failed to marshal notification result", err)
		a.errorHandler.HandleError(appErr, map[string]interface{}{
			"operation": "marshal_notification_result",
		})
		return "", appErr
	}
	
	return string(jsonResult), nil
}

// ClearErrorsEnhanced clears all collected errors with logging
func (a *EnhancedApp) ClearErrorsEnhanced() (string, error) {
	a.errorCollector.Clear()
	
	appLogger, _ := a.logManager.GetLogger("app")
	appLogger.Info("Error collection cleared", map[string]interface{}{
		"operation": "clear_errors",
	})
	
	// Show success notification
	a.notificationManager.ShowSuccessNotification(
		"Errors Cleared",
		"All error records have been cleared",
	)
	
	result := map[string]interface{}{
		"status": "success",
		"message": "Errors cleared successfully",
	}
	
	jsonResult, err := json.Marshal(result)
	if err != nil {
		appErr := ui.InternalError("Failed to marshal clear result", err)
		a.errorHandler.HandleError(appErr, map[string]interface{}{
			"operation": "marshal_clear_result",
		})
		return "", appErr
	}
	
	return string(jsonResult), nil
}

// GetSystemInfoEnhanced returns enhanced system information
func (a *EnhancedApp) GetSystemInfoEnhanced() (string, error) {
	info := map[string]interface{}{
		"os":           "macOS",
		"scan_time":    time.Now().Format(time.RFC3339),
		"app_version":  "1.0.0",
		"go_version":   "1.23+",
		"error_count":  a.errorCollector.GetSummary().TotalErrors,
		"notification_count": a.notificationManager.GetNotificationSummary().TotalNotifications,
		"error_handling": "enhanced",
		"logging": "structured",
	}
	
	result, err := json.Marshal(info)
	if err != nil {
		appErr := ui.InternalError("Failed to marshal system info", err)
		a.errorHandler.HandleError(appErr, map[string]interface{}{
			"operation": "marshal_system_info",
		})
		return "", appErr
	}
	
	return string(result), nil
}

// Example of how to integrate error handling with existing methods
func (a *EnhancedApp) ExampleIntegration() {
	// Example: Enhanced file operation with error handling
	filePath := "/path/to/file"
	
	err := a.errorHandler.SafeExecute(func() error {
		// Simulate file operation
		_, err := os.Stat(filePath)
		if err != nil {
			return ui.IOError(fmt.Sprintf("Failed to access file: %s", filePath), err)
		}
		return nil
	}, map[string]interface{}{
		"operation": "file_access",
		"file_path": filePath,
	})
	
	if err != nil {
		// Error is already handled by SafeExecute
		appLogger, _ := a.logManager.GetLogger("app")
		appLogger.Error("File operation failed", err, map[string]interface{}{
			"file_path": filePath,
		})
	}
}

// This file demonstrates how to integrate the error handling system
// with your existing cache application. You can use these patterns
// to enhance your existing App struct and methods.
