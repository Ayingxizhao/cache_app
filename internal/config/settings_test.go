package config

import (
	"testing"
)

func TestDefaultSettings(t *testing.T) {
	settings := DefaultSettings()
	
	if settings.Version != "1.0.0" {
		t.Errorf("Expected version 1.0.0, got %s", settings.Version)
	}
	
	if settings.Backup.RetentionDays != 30 {
		t.Errorf("Expected retention days 30, got %d", settings.Backup.RetentionDays)
	}
	
	if settings.Safety.DefaultSafeLevel != "Safe" {
		t.Errorf("Expected default safe level 'Safe', got %s", settings.Safety.DefaultSafeLevel)
	}
	
	if settings.Performance.ScanDepth != 5 {
		t.Errorf("Expected scan depth 5, got %d", settings.Performance.ScanDepth)
	}
	
	if settings.Privacy.EnableCloudAI != false {
		t.Errorf("Expected cloud AI disabled, got %v", settings.Privacy.EnableCloudAI)
	}
	
	if settings.UI.Theme != "auto" {
		t.Errorf("Expected theme 'auto', got %s", settings.UI.Theme)
	}
}

func TestValidateSettings(t *testing.T) {
	settings := DefaultSettings()
	errors := ValidateSettings(settings)
	
	if len(errors) > 0 {
		t.Errorf("Default settings should be valid, but got errors: %v", errors)
	}
	
	// Test invalid settings
	invalidSettings := DefaultSettings()
	invalidSettings.Backup.RetentionDays = 0 // Invalid
	invalidSettings.Safety.LargeFileThreshold = 2000 // Invalid
	invalidSettings.Performance.ScanDepth = 25 // Invalid
	
	errors = ValidateSettings(invalidSettings)
	if len(errors) == 0 {
		t.Error("Invalid settings should produce validation errors")
	}
}

func TestMergeSettings(t *testing.T) {
	defaults := DefaultSettings()
	userSettings := &Settings{
		Backup: BackupSettings{
			RetentionDays: 60,
			AutoCleanup:   false,
		},
		Safety: SafetySettings{
			DefaultSafeLevel: "Caution",
		},
	}
	
	merged := MergeSettings(userSettings, defaults)
	
	if merged.Backup.RetentionDays != 60 {
		t.Errorf("Expected retention days 60, got %d", merged.Backup.RetentionDays)
	}
	
	if merged.Backup.AutoCleanup != false {
		t.Errorf("Expected auto cleanup false, got %v", merged.Backup.AutoCleanup)
	}
	
	if merged.Safety.DefaultSafeLevel != "Caution" {
		t.Errorf("Expected default safe level 'Caution', got %s", merged.Safety.DefaultSafeLevel)
	}
	
	// Check that other settings remain default
	if merged.Performance.ScanDepth != 5 {
		t.Errorf("Expected scan depth 5, got %d", merged.Performance.ScanDepth)
	}
}

func TestSettingsManager(t *testing.T) {
	// Create a temporary settings manager
	manager, err := NewSettingsManagerWithPath("/tmp/test-settings.json")
	if err != nil {
		t.Fatalf("Failed to create settings manager: %v", err)
	}
	
	// Test getting default settings
	settings := manager.GetSettings()
	if settings == nil {
		t.Error("Settings should not be nil")
	}
	
	// Test updating settings
	newSettings := DefaultSettings()
	newSettings.Backup.RetentionDays = 45
	
	err = manager.UpdateSettings(newSettings)
	if err != nil {
		t.Errorf("Failed to update settings: %v", err)
	}
	
	// Verify the update
	updatedSettings := manager.GetSettings()
	if updatedSettings.Backup.RetentionDays != 45 {
		t.Errorf("Expected retention days 45, got %d", updatedSettings.Backup.RetentionDays)
	}
	
	// Test reset to defaults
	err = manager.ResetToDefaults()
	if err != nil {
		t.Errorf("Failed to reset settings: %v", err)
	}
	
	resetSettings := manager.GetSettings()
	if resetSettings.Backup.RetentionDays != 30 {
		t.Errorf("Expected retention days 30 after reset, got %d", resetSettings.Backup.RetentionDays)
	}
}
