package config

import (
	"time"
)

// Settings represents the complete application settings structure
type Settings struct {
	Version         string           `json:"version"`
	LastModified    time.Time        `json:"last_modified"`
	Backup          BackupSettings   `json:"backup"`
	Safety          SafetySettings   `json:"safety"`
	Performance     PerformanceSettings `json:"performance"`
	Privacy         PrivacySettings  `json:"privacy"`
	UI              UISettings       `json:"ui"`
}

// BackupSettings contains backup-related preferences
type BackupSettings struct {
	// Location preferences
	DefaultLocation     string `json:"default_location"`
	CustomLocation      string `json:"custom_location"`
	UseCustomLocation   bool   `json:"use_custom_location"`
	
	// Retention policy
	RetentionDays       int    `json:"retention_days"`
	MaxBackupSize       int64  `json:"max_backup_size_mb"` // in MB
	AutoCleanup         bool   `json:"auto_cleanup"`
	CleanupThreshold    int    `json:"cleanup_threshold_days"`
	
	// Backup behavior
	CompressBackups     bool   `json:"compress_backups"`
	VerifyIntegrity     bool   `json:"verify_integrity"`
	CreateManifest      bool   `json:"create_manifest"`
}

// SafetySettings contains safety-related preferences
type SafetySettings struct {
	// Default safety levels
	DefaultSafeLevel    string `json:"default_safe_level"`    // "Safe", "Caution", "Risky"
	RequireConfirmation bool   `json:"require_confirmation"`
	ShowSafetyWarnings  bool   `json:"show_safety_warnings"`
	
	// Confirmation dialogs
	ConfirmDeletion     bool   `json:"confirm_deletion"`
	ConfirmLargeFiles   bool   `json:"confirm_large_files"`
	ConfirmSystemFiles  bool   `json:"confirm_system_files"`
	
	// Safety thresholds
	LargeFileThreshold  int64  `json:"large_file_threshold_mb"` // in MB
	SafeAgeThreshold    int    `json:"safe_age_threshold_days"`
	CautionAgeThreshold int    `json:"caution_age_threshold_days"`
	
	// Protection settings
	ProtectSystemPaths  bool   `json:"protect_system_paths"`
	ProtectUserData     bool   `json:"protect_user_data"`
	ProtectDevFiles     bool   `json:"protect_dev_files"`
}

// PerformanceSettings contains performance-related preferences
type PerformanceSettings struct {
	// Scan settings
	ScanDepth           int    `json:"scan_depth"`
	MaxFileSize         int64  `json:"max_file_size_mb"` // in MB
	ConcurrentScans     int    `json:"concurrent_scans"`
	ScanTimeout         int    `json:"scan_timeout_seconds"`
	
	// Memory management
	MaxMemoryUsage      int64  `json:"max_memory_usage_mb"` // in MB
	EnableCaching       bool   `json:"enable_caching"`
	CacheSize           int64  `json:"cache_size_mb"` // in MB
	
	// UI performance
	UpdateInterval      int    `json:"update_interval_ms"`
	ShowProgress        bool   `json:"show_progress"`
	VerboseLogging      bool   `json:"verbose_logging"`
}

// PrivacySettings contains privacy-related preferences
type PrivacySettings struct {
	// Cloud AI features
	EnableCloudAI       bool   `json:"enable_cloud_ai"`
	ShareAnalytics      bool   `json:"share_analytics"`
	ShareCrashReports   bool   `json:"share_crash_reports"`
	
	// Data collection
	CollectUsageStats   bool   `json:"collect_usage_stats"`
	CollectErrorLogs     bool   `json:"collect_error_logs"`
	CollectPerformance   bool   `json:"collect_performance"`
	
	// Data retention
	RetainLogsDays      int    `json:"retain_logs_days"`
	RetainStatsDays     int    `json:"retain_stats_days"`
	AutoDeleteOldData   bool   `json:"auto_delete_old_data"`
}

// UISettings contains UI-related preferences
type UISettings struct {
	// Theme and appearance
	Theme               string `json:"theme"` // "light", "dark", "auto"
	Language            string `json:"language"`
	FontSize            int    `json:"font_size"`
	
	// Window settings
	WindowWidth         int    `json:"window_width"`
	WindowHeight        int    `json:"window_height"`
	RememberWindowSize  bool   `json:"remember_window_size"`
	
	// Notifications
	ShowNotifications   bool   `json:"show_notifications"`
	NotificationSound   bool   `json:"notification_sound"`
	NotificationDuration int   `json:"notification_duration_ms"`
	
	// Accessibility
	HighContrast        bool   `json:"high_contrast"`
	ReduceAnimations    bool   `json:"reduce_animations"`
	ScreenReader        bool   `json:"screen_reader"`
}

// DefaultSettings returns the default settings configuration
func DefaultSettings() *Settings {
	return &Settings{
		Version:      "1.0.0",
		LastModified: time.Now(),
		Backup: BackupSettings{
			DefaultLocation:     "",
			CustomLocation:      "",
			UseCustomLocation:   false,
			RetentionDays:       30,
			MaxBackupSize:       1024, // 1GB
			AutoCleanup:         true,
			CleanupThreshold:    7,
			CompressBackups:     true,
			VerifyIntegrity:     true,
			CreateManifest:      true,
		},
		Safety: SafetySettings{
			DefaultSafeLevel:    "Safe",
			RequireConfirmation: true,
			ShowSafetyWarnings:  true,
			ConfirmDeletion:     true,
			ConfirmLargeFiles:   true,
			ConfirmSystemFiles:  true,
			LargeFileThreshold:  100, // 100MB
			SafeAgeThreshold:    30,  // 30 days
			CautionAgeThreshold: 7,   // 7 days
			ProtectSystemPaths:  true,
			ProtectUserData:     true,
			ProtectDevFiles:     true,
		},
		Performance: PerformanceSettings{
			ScanDepth:           5,
			MaxFileSize:         500, // 500MB
			ConcurrentScans:     3,
			ScanTimeout:         300, // 5 minutes
			MaxMemoryUsage:      512, // 512MB
			EnableCaching:       true,
			CacheSize:           64,  // 64MB
			UpdateInterval:      1000, // 1 second
			ShowProgress:        true,
			VerboseLogging:      false,
		},
		Privacy: PrivacySettings{
			EnableCloudAI:       false,
			ShareAnalytics:     false,
			ShareCrashReports:  false,
			CollectUsageStats:  false,
			CollectErrorLogs:   true,
			CollectPerformance: false,
			RetainLogsDays:     7,
			RetainStatsDays:    30,
			AutoDeleteOldData:  true,
		},
		UI: UISettings{
			Theme:               "auto",
			Language:            "en",
			FontSize:            14,
			WindowWidth:         1024,
			WindowHeight:        768,
			RememberWindowSize:  true,
			ShowNotifications:   true,
			NotificationSound:   true,
			NotificationDuration: 3000, // 3 seconds
			HighContrast:        false,
			ReduceAnimations:    false,
			ScreenReader:        false,
		},
	}
}

// ValidateSettings validates the settings structure and returns any errors
func ValidateSettings(s *Settings) []string {
	var errors []string
	
	// Validate backup settings
	if s.Backup.RetentionDays < 1 || s.Backup.RetentionDays > 365 {
		errors = append(errors, "backup retention days must be between 1 and 365")
	}
	if s.Backup.MaxBackupSize < 100 || s.Backup.MaxBackupSize > 10240 {
		errors = append(errors, "max backup size must be between 100MB and 10GB")
	}
	if s.Backup.CleanupThreshold < 1 || s.Backup.CleanupThreshold > s.Backup.RetentionDays {
		errors = append(errors, "cleanup threshold must be between 1 and retention days")
	}
	
	// Validate safety settings
	if s.Safety.DefaultSafeLevel != "Safe" && s.Safety.DefaultSafeLevel != "Caution" && s.Safety.DefaultSafeLevel != "Risky" {
		errors = append(errors, "default safe level must be Safe, Caution, or Risky")
	}
	if s.Safety.LargeFileThreshold < 1 || s.Safety.LargeFileThreshold > 1024 {
		errors = append(errors, "large file threshold must be between 1MB and 1GB")
	}
	if s.Safety.SafeAgeThreshold < 1 || s.Safety.SafeAgeThreshold > 365 {
		errors = append(errors, "safe age threshold must be between 1 and 365 days")
	}
	if s.Safety.CautionAgeThreshold < 1 || s.Safety.CautionAgeThreshold > s.Safety.SafeAgeThreshold {
		errors = append(errors, "caution age threshold must be between 1 and safe age threshold")
	}
	
	// Validate performance settings
	if s.Performance.ScanDepth < 1 || s.Performance.ScanDepth > 20 {
		errors = append(errors, "scan depth must be between 1 and 20")
	}
	if s.Performance.MaxFileSize < 1 || s.Performance.MaxFileSize > 10240 {
		errors = append(errors, "max file size must be between 1MB and 10GB")
	}
	if s.Performance.ConcurrentScans < 1 || s.Performance.ConcurrentScans > 10 {
		errors = append(errors, "concurrent scans must be between 1 and 10")
	}
	if s.Performance.ScanTimeout < 30 || s.Performance.ScanTimeout > 3600 {
		errors = append(errors, "scan timeout must be between 30 seconds and 1 hour")
	}
	if s.Performance.MaxMemoryUsage < 64 || s.Performance.MaxMemoryUsage > 4096 {
		errors = append(errors, "max memory usage must be between 64MB and 4GB")
	}
	if s.Performance.UpdateInterval < 100 || s.Performance.UpdateInterval > 10000 {
		errors = append(errors, "update interval must be between 100ms and 10 seconds")
	}
	
	// Validate privacy settings
	if s.Privacy.RetainLogsDays < 1 || s.Privacy.RetainLogsDays > 365 {
		errors = append(errors, "retain logs days must be between 1 and 365")
	}
	if s.Privacy.RetainStatsDays < 1 || s.Privacy.RetainStatsDays > 365 {
		errors = append(errors, "retain stats days must be between 1 and 365")
	}
	
	// Validate UI settings
	if s.UI.Theme != "light" && s.UI.Theme != "dark" && s.UI.Theme != "auto" {
		errors = append(errors, "theme must be light, dark, or auto")
	}
	if s.UI.FontSize < 8 || s.UI.FontSize > 24 {
		errors = append(errors, "font size must be between 8 and 24")
	}
	if s.UI.WindowWidth < 800 || s.UI.WindowWidth > 3840 {
		errors = append(errors, "window width must be between 800 and 3840 pixels")
	}
	if s.UI.WindowHeight < 600 || s.UI.WindowHeight > 2160 {
		errors = append(errors, "window height must be between 600 and 2160 pixels")
	}
	if s.UI.NotificationDuration < 1000 || s.UI.NotificationDuration > 10000 {
		errors = append(errors, "notification duration must be between 1 and 10 seconds")
	}
	
	return errors
}

// MergeSettings merges user settings with defaults, keeping user values where valid
func MergeSettings(userSettings *Settings, defaults *Settings) *Settings {
	if userSettings == nil {
		return defaults
	}
	
	merged := *defaults
	
	// Merge backup settings
	if userSettings.Backup.DefaultLocation != "" {
		merged.Backup.DefaultLocation = userSettings.Backup.DefaultLocation
	}
	if userSettings.Backup.CustomLocation != "" {
		merged.Backup.CustomLocation = userSettings.Backup.CustomLocation
	}
	merged.Backup.UseCustomLocation = userSettings.Backup.UseCustomLocation
	if userSettings.Backup.RetentionDays > 0 {
		merged.Backup.RetentionDays = userSettings.Backup.RetentionDays
	}
	if userSettings.Backup.MaxBackupSize > 0 {
		merged.Backup.MaxBackupSize = userSettings.Backup.MaxBackupSize
	}
	merged.Backup.AutoCleanup = userSettings.Backup.AutoCleanup
	if userSettings.Backup.CleanupThreshold > 0 {
		merged.Backup.CleanupThreshold = userSettings.Backup.CleanupThreshold
	}
	merged.Backup.CompressBackups = userSettings.Backup.CompressBackups
	merged.Backup.VerifyIntegrity = userSettings.Backup.VerifyIntegrity
	merged.Backup.CreateManifest = userSettings.Backup.CreateManifest
	
	// Merge safety settings
	if userSettings.Safety.DefaultSafeLevel != "" {
		merged.Safety.DefaultSafeLevel = userSettings.Safety.DefaultSafeLevel
	}
	merged.Safety.RequireConfirmation = userSettings.Safety.RequireConfirmation
	merged.Safety.ShowSafetyWarnings = userSettings.Safety.ShowSafetyWarnings
	merged.Safety.ConfirmDeletion = userSettings.Safety.ConfirmDeletion
	merged.Safety.ConfirmLargeFiles = userSettings.Safety.ConfirmLargeFiles
	merged.Safety.ConfirmSystemFiles = userSettings.Safety.ConfirmSystemFiles
	if userSettings.Safety.LargeFileThreshold > 0 {
		merged.Safety.LargeFileThreshold = userSettings.Safety.LargeFileThreshold
	}
	if userSettings.Safety.SafeAgeThreshold > 0 {
		merged.Safety.SafeAgeThreshold = userSettings.Safety.SafeAgeThreshold
	}
	if userSettings.Safety.CautionAgeThreshold > 0 {
		merged.Safety.CautionAgeThreshold = userSettings.Safety.CautionAgeThreshold
	}
	merged.Safety.ProtectSystemPaths = userSettings.Safety.ProtectSystemPaths
	merged.Safety.ProtectUserData = userSettings.Safety.ProtectUserData
	merged.Safety.ProtectDevFiles = userSettings.Safety.ProtectDevFiles
	
	// Merge performance settings
	if userSettings.Performance.ScanDepth > 0 {
		merged.Performance.ScanDepth = userSettings.Performance.ScanDepth
	}
	if userSettings.Performance.MaxFileSize > 0 {
		merged.Performance.MaxFileSize = userSettings.Performance.MaxFileSize
	}
	if userSettings.Performance.ConcurrentScans > 0 {
		merged.Performance.ConcurrentScans = userSettings.Performance.ConcurrentScans
	}
	if userSettings.Performance.ScanTimeout > 0 {
		merged.Performance.ScanTimeout = userSettings.Performance.ScanTimeout
	}
	if userSettings.Performance.MaxMemoryUsage > 0 {
		merged.Performance.MaxMemoryUsage = userSettings.Performance.MaxMemoryUsage
	}
	merged.Performance.EnableCaching = userSettings.Performance.EnableCaching
	if userSettings.Performance.CacheSize > 0 {
		merged.Performance.CacheSize = userSettings.Performance.CacheSize
	}
	if userSettings.Performance.UpdateInterval > 0 {
		merged.Performance.UpdateInterval = userSettings.Performance.UpdateInterval
	}
	merged.Performance.ShowProgress = userSettings.Performance.ShowProgress
	merged.Performance.VerboseLogging = userSettings.Performance.VerboseLogging
	
	// Merge privacy settings
	merged.Privacy.EnableCloudAI = userSettings.Privacy.EnableCloudAI
	merged.Privacy.ShareAnalytics = userSettings.Privacy.ShareAnalytics
	merged.Privacy.ShareCrashReports = userSettings.Privacy.ShareCrashReports
	merged.Privacy.CollectUsageStats = userSettings.Privacy.CollectUsageStats
	merged.Privacy.CollectErrorLogs = userSettings.Privacy.CollectErrorLogs
	merged.Privacy.CollectPerformance = userSettings.Privacy.CollectPerformance
	if userSettings.Privacy.RetainLogsDays > 0 {
		merged.Privacy.RetainLogsDays = userSettings.Privacy.RetainLogsDays
	}
	if userSettings.Privacy.RetainStatsDays > 0 {
		merged.Privacy.RetainStatsDays = userSettings.Privacy.RetainStatsDays
	}
	merged.Privacy.AutoDeleteOldData = userSettings.Privacy.AutoDeleteOldData
	
	// Merge UI settings
	if userSettings.UI.Theme != "" {
		merged.UI.Theme = userSettings.UI.Theme
	}
	if userSettings.UI.Language != "" {
		merged.UI.Language = userSettings.UI.Language
	}
	if userSettings.UI.FontSize > 0 {
		merged.UI.FontSize = userSettings.UI.FontSize
	}
	if userSettings.UI.WindowWidth > 0 {
		merged.UI.WindowWidth = userSettings.UI.WindowWidth
	}
	if userSettings.UI.WindowHeight > 0 {
		merged.UI.WindowHeight = userSettings.UI.WindowHeight
	}
	merged.UI.RememberWindowSize = userSettings.UI.RememberWindowSize
	merged.UI.ShowNotifications = userSettings.UI.ShowNotifications
	merged.UI.NotificationSound = userSettings.UI.NotificationSound
	if userSettings.UI.NotificationDuration > 0 {
		merged.UI.NotificationDuration = userSettings.UI.NotificationDuration
	}
	merged.UI.HighContrast = userSettings.UI.HighContrast
	merged.UI.ReduceAnimations = userSettings.UI.ReduceAnimations
	merged.UI.ScreenReader = userSettings.UI.ScreenReader
	
	// Update metadata
	merged.Version = userSettings.Version
	merged.LastModified = time.Now()
	
	return &merged
}
