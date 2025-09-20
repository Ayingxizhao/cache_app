package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
	"cache_app/internal/ui"
)

// SettingsManager handles loading, saving, and managing application settings
type SettingsManager struct {
	settingsPath string
	settings     *Settings
}

var errorLogger *ui.AppLogger

func init() {
	logDir := "logs"
	logManager, err := ui.SetupDefaultLogging(logDir)
	if err != nil {
		// fallback: print to console
		fmt.Printf("[ERROR] Failed to set up error logger: %v\n", err)
		return
	}
	errLogger, ok := logManager.GetLogger("error")
	if ok {
		errorLogger = errLogger
	}
}

// NewSettingsManager creates a new settings manager with the default settings path
func NewSettingsManager() (*SettingsManager, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get user home directory: %w", err)
	}
	
	settingsDir := filepath.Join(homeDir, "CacheCleaner", "Settings")
	if err := os.MkdirAll(settingsDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create settings directory: %w", err)
	}
	
	settingsPath := filepath.Join(settingsDir, "settings.json")
	
	manager := &SettingsManager{
		settingsPath: settingsPath,
		settings:     nil,
	}
	
	// Load existing settings or create defaults
	if err := manager.LoadSettings(); err != nil {
		return nil, fmt.Errorf("failed to load settings: %w", err)
	}
	
	return manager, nil
}

// NewSettingsManagerWithPath creates a new settings manager with a custom settings path
func NewSettingsManagerWithPath(settingsPath string) (*SettingsManager, error) {
	settingsDir := filepath.Dir(settingsPath)
	if err := os.MkdirAll(settingsDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create settings directory: %w", err)
	}
	
	manager := &SettingsManager{
		settingsPath: settingsPath,
		settings:     nil,
	}
	
	// Load existing settings or create defaults
	if err := manager.LoadSettings(); err != nil {
		return nil, fmt.Errorf("failed to load settings: %w", err)
	}
	
	return manager, nil
}

// LoadSettings loads settings from the settings file
func (sm *SettingsManager) LoadSettings() error {
	// Check if settings file exists
	if _, err := os.Stat(sm.settingsPath); os.IsNotExist(err) {
		sm.settings = DefaultSettings()
		err := sm.SaveSettings()
		if err != nil && errorLogger != nil {
			errorLogger.Error("Failed to save default settings", err, nil)
		}
		return err
	}
	
	// Read settings file
	data, err := os.ReadFile(sm.settingsPath)
	if err != nil {
		if errorLogger != nil {
			errorLogger.Error("Failed to read settings file", err, map[string]interface{}{"path": sm.settingsPath})
		}
		return fmt.Errorf("failed to read settings file: %w", err)
	}
	
	// Parse JSON
	var settings Settings
	if err := json.Unmarshal(data, &settings); err != nil {
		if errorLogger != nil {
			errorLogger.Error("Failed to parse settings JSON", err, nil)
		}
		// If parsing fails, use defaults
		sm.settings = DefaultSettings()
		err := sm.SaveSettings()
		if err != nil && errorLogger != nil {
			errorLogger.Error("Failed to save default settings after parse error", err, nil)
		}
		return err
	}
	
	// Validate settings
	if errors := ValidateSettings(&settings); len(errors) > 0 {
		if errorLogger != nil {
			errorLogger.Error("Settings validation failed on load", fmt.Errorf("validation errors: %v", errors), map[string]interface{}{"validation_errors": errors})
		}
		// If validation fails, merge with defaults
		defaults := DefaultSettings()
		sm.settings = MergeSettings(&settings, defaults)
		err := sm.SaveSettings()
		if err != nil && errorLogger != nil {
			errorLogger.Error("Failed to save merged settings after validation error", err, nil)
		}
		return err
	}
	
	sm.settings = &settings
	return nil
}

// SaveSettings saves the current settings to the settings file
func (sm *SettingsManager) SaveSettings() error {
	if sm.settings == nil {
		err := fmt.Errorf("no settings to save")
		if errorLogger != nil {
			errorLogger.Error("No settings to save", err, nil)
		}
		return err
	}
	
	// Update last modified timestamp
	sm.settings.LastModified = time.Now()
	
	// Validate settings before saving
	if errors := ValidateSettings(sm.settings); len(errors) > 0 {
		err := fmt.Errorf("settings validation failed: %v", errors)
		if errorLogger != nil {
			errorLogger.Error("Settings validation failed", err, map[string]interface{}{"validation_errors": errors})
		}
		return err
	}
	
	// Marshal to JSON with indentation
	data, err := json.MarshalIndent(sm.settings, "", "  ")
	if err != nil {
		if errorLogger != nil {
			errorLogger.Error("Failed to marshal settings", err, nil)
		}
		return fmt.Errorf("failed to marshal settings: %w", err)
	}
	
	// Write to file atomically
	tempPath := sm.settingsPath + ".tmp"
	if err := os.WriteFile(tempPath, data, 0644); err != nil {
		if errorLogger != nil {
			errorLogger.Error("Failed to write temp settings file", err, map[string]interface{}{"path": tempPath})
		}
		return fmt.Errorf("failed to write settings file: %w", err)
	}
	
	if err := os.Rename(tempPath, sm.settingsPath); err != nil {
		if errorLogger != nil {
			errorLogger.Error("Failed to rename temp settings file", err, map[string]interface{}{"from": tempPath, "to": sm.settingsPath})
		}
		return fmt.Errorf("failed to rename settings file: %w", err)
	}
	
	return nil
}

// GetSettings returns the current settings
func (sm *SettingsManager) GetSettings() *Settings {
	if sm.settings == nil {
		return DefaultSettings()
	}
	return sm.settings
}

// UpdateSettings updates the settings with new values
func (sm *SettingsManager) UpdateSettings(newSettings *Settings) error {
	if newSettings == nil {
		return fmt.Errorf("new settings cannot be nil")
	}
	
	// Validate new settings
	if errors := ValidateSettings(newSettings); len(errors) > 0 {
		return fmt.Errorf("settings validation failed: %v", errors)
	}
	
	// Update settings
	sm.settings = newSettings
	
	// Save to file
	return sm.SaveSettings()
}

// UpdateBackupSettings updates only the backup settings
func (sm *SettingsManager) UpdateBackupSettings(backupSettings BackupSettings) error {
	if sm.settings == nil {
		sm.settings = DefaultSettings()
	}
	
	sm.settings.Backup = backupSettings
	return sm.SaveSettings()
}

// UpdateSafetySettings updates only the safety settings
func (sm *SettingsManager) UpdateSafetySettings(safetySettings SafetySettings) error {
	if sm.settings == nil {
		sm.settings = DefaultSettings()
	}
	
	sm.settings.Safety = safetySettings
	return sm.SaveSettings()
}

// UpdatePerformanceSettings updates only the performance settings
func (sm *SettingsManager) UpdatePerformanceSettings(performanceSettings PerformanceSettings) error {
	if sm.settings == nil {
		sm.settings = DefaultSettings()
	}
	
	sm.settings.Performance = performanceSettings
	return sm.SaveSettings()
}

// UpdatePrivacySettings updates only the privacy settings
func (sm *SettingsManager) UpdatePrivacySettings(privacySettings PrivacySettings) error {
	if sm.settings == nil {
		sm.settings = DefaultSettings()
	}
	
	sm.settings.Privacy = privacySettings
	return sm.SaveSettings()
}

// UpdateUISettings updates only the UI settings
func (sm *SettingsManager) UpdateUISettings(uiSettings UISettings) error {
	if sm.settings == nil {
		sm.settings = DefaultSettings()
	}
	
	sm.settings.UI = uiSettings
	return sm.SaveSettings()
}

// ResetToDefaults resets all settings to default values
func (sm *SettingsManager) ResetToDefaults() error {
	sm.settings = DefaultSettings()
	return sm.SaveSettings()
}

// GetSettingsPath returns the path to the settings file
func (sm *SettingsManager) GetSettingsPath() string {
	return sm.settingsPath
}

// BackupSettings creates a backup of the current settings
func (sm *SettingsManager) BackupSettings() error {
	if sm.settings == nil {
		return fmt.Errorf("no settings to backup")
	}
	
	backupPath := sm.settingsPath + ".backup." + time.Now().Format("20060102-150405")
	
	// Read current settings file
	data, err := os.ReadFile(sm.settingsPath)
	if err != nil {
		return fmt.Errorf("failed to read settings file: %w", err)
	}
	
	// Write to backup file
	return os.WriteFile(backupPath, data, 0644)
}

// RestoreSettings restores settings from a backup file
func (sm *SettingsManager) RestoreSettings(backupPath string) error {
	if _, err := os.Stat(backupPath); os.IsNotExist(err) {
		return fmt.Errorf("backup file does not exist: %s", backupPath)
	}
	
	// Read backup file
	data, err := os.ReadFile(backupPath)
	if err != nil {
		return fmt.Errorf("failed to read backup file: %w", err)
	}
	
	// Parse JSON
	var settings Settings
	if err := json.Unmarshal(data, &settings); err != nil {
		return fmt.Errorf("failed to parse backup file: %w", err)
	}
	
	// Validate settings
	if errors := ValidateSettings(&settings); len(errors) > 0 {
		return fmt.Errorf("backup settings validation failed: %v", errors)
	}
	
	// Update settings
	sm.settings = &settings
	
	// Save to current settings file
	return sm.SaveSettings()
}

// ExportSettings exports the current settings to a JSON file
func (sm *SettingsManager) ExportSettings(exportPath string) error {
	if sm.settings == nil {
		return fmt.Errorf("no settings to export")
	}
	
	data, err := json.MarshalIndent(sm.settings, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal settings: %w", err)
	}
	
	return os.WriteFile(exportPath, data, 0644)
}

// ImportSettings imports settings from a JSON file
func (sm *SettingsManager) ImportSettings(importPath string) error {
	if _, err := os.Stat(importPath); os.IsNotExist(err) {
		return fmt.Errorf("import file does not exist: %s", importPath)
	}
	
	// Read import file
	data, err := os.ReadFile(importPath)
	if err != nil {
		return fmt.Errorf("failed to read import file: %w", err)
	}
	
	// Parse JSON
	var settings Settings
	if err := json.Unmarshal(data, &settings); err != nil {
		return fmt.Errorf("failed to parse import file: %w", err)
	}
	
	// Validate settings
	if errors := ValidateSettings(&settings); len(errors) > 0 {
		return fmt.Errorf("import settings validation failed: %v", errors)
	}
	
	// Update settings
	sm.settings = &settings
	
	// Save to current settings file
	return sm.SaveSettings()
}

// GetSettingsJSON returns the current settings as JSON string
func (sm *SettingsManager) GetSettingsJSON() (string, error) {
	if sm.settings == nil {
		return "", fmt.Errorf("no settings available")
	}
	
	data, err := json.MarshalIndent(sm.settings, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal settings: %w", err)
	}
	
	return string(data), nil
}

// SetSettingsFromJSON sets settings from a JSON string
func (sm *SettingsManager) SetSettingsFromJSON(jsonData string) error {
	var settings Settings
	if err := json.Unmarshal([]byte(jsonData), &settings); err != nil {
		return fmt.Errorf("failed to parse JSON: %w", err)
	}
	
	// Validate settings
	if errors := ValidateSettings(&settings); len(errors) > 0 {
		return fmt.Errorf("settings validation failed: %v", errors)
	}
	
	// Update settings
	sm.settings = &settings
	
	// Save to file
	return sm.SaveSettings()
}

// GetSettingsInfo returns information about the settings file
func (sm *SettingsManager) GetSettingsInfo() map[string]interface{} {
	info := map[string]interface{}{
		"settings_path": sm.settingsPath,
		"file_exists":   false,
		"file_size":     int64(0),
		"last_modified": time.Time{},
		"version":       "",
	}
	
	if sm.settings != nil {
		info["version"] = sm.settings.Version
		info["last_modified"] = sm.settings.LastModified
	}
	
	if stat, err := os.Stat(sm.settingsPath); err == nil {
		info["file_exists"] = true
		info["file_size"] = stat.Size()
		info["last_modified"] = stat.ModTime()
	}
	
	return info
}
