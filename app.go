package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
	
	"cache_app/pkg/safety"
)

// App struct
type App struct {
	ctx          context.Context
	cacheScanner *CacheScanner
	lastScanResult *CacheLocation
	mu           sync.RWMutex
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		cacheScanner: NewCacheScanner(),
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
