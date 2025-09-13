package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
	
	"cache_app/pkg/safety"
)

// CacheFile represents metadata for a single cache file
type CacheFile struct {
	Name              string                    `json:"name"`
	Path              string                    `json:"path"`
	Size              int64                     `json:"size"`
	LastModified      time.Time                 `json:"last_modified"`
	LastAccessed      time.Time                 `json:"last_accessed"`
	IsDir             bool                      `json:"is_dir"`
	Permissions       string                    `json:"permissions"`
	Error             string                    `json:"error,omitempty"`
	SafetyClassification *safety.SafetyClassification `json:"safety_classification,omitempty"`
}

// CacheLocation represents a cache directory with its files and metadata
type CacheLocation struct {
	ID           string      `json:"id"`
	Name         string      `json:"name"`
	Path         string      `json:"path"`
	TotalSize    int64       `json:"total_size"`
	FileCount    int         `json:"file_count"`
	DirCount     int         `json:"dir_count"`
	Files        []CacheFile `json:"files"`
	Error        string      `json:"error,omitempty"`
	ScanDuration time.Duration `json:"scan_duration"`
}

// ScanProgress represents progress information during scanning
type ScanProgress struct {
	LocationID    string  `json:"location_id"`
	LocationName  string  `json:"location_name"`
	CurrentPath   string  `json:"current_path"`
	FilesScanned  int     `json:"files_scanned"`
	TotalFiles    int     `json:"total_files"`
	Progress      float64 `json:"progress"`
	ElapsedTime   time.Duration `json:"elapsed_time"`
	EstimatedTime time.Duration `json:"estimated_time"`
}

// ScanResult represents the complete scan result
type ScanResult struct {
	TotalLocations int             `json:"total_locations"`
	TotalSize      int64           `json:"total_size"`
	TotalFiles     int             `json:"total_files"`
	TotalDirs      int             `json:"total_dirs"`
	ScanDuration   time.Duration   `json:"scan_duration"`
	Locations      []CacheLocation `json:"locations"`
	Errors         []string        `json:"errors"`
}

// CacheScanner handles scanning of cache directories
type CacheScanner struct {
	mu               sync.RWMutex
	progressChan     chan ScanProgress
	stopChan         chan bool
	isScanning       bool
	scanStartTime    time.Time
	safetyClassifier *safety.SafetyClassifier
}

// NewCacheScanner creates a new cache scanner instance
func NewCacheScanner() *CacheScanner {
	return &CacheScanner{
		progressChan:     make(chan ScanProgress, 100),
		stopChan:         make(chan bool, 1),
		safetyClassifier: safety.NewDefaultSafetyClassifier(),
	}
}

// GetProgressChannel returns the progress channel for monitoring scan progress
func (cs *CacheScanner) GetProgressChannel() <-chan ScanProgress {
	return cs.progressChan
}

// StopScan signals the scanner to stop the current scan
func (cs *CacheScanner) StopScan() {
	cs.mu.Lock()
	defer cs.mu.Unlock()
	
	if cs.isScanning {
		select {
		case cs.stopChan <- true:
		default:
		}
	}
}

// IsScanning returns whether a scan is currently in progress
func (cs *CacheScanner) IsScanning() bool {
	cs.mu.RLock()
	defer cs.mu.RUnlock()
	return cs.isScanning
}

// SetScanning sets the scanning state
func (cs *CacheScanner) SetScanning(scanning bool) {
	cs.mu.Lock()
	defer cs.mu.Unlock()
	cs.isScanning = scanning
}

// ScanLocation scans a single cache location
func (cs *CacheScanner) ScanLocation(locationID, locationName, path string) (*CacheLocation, error) {
	startTime := time.Now()
	
	// Expand tilde in path
	expandedPath, err := expandTilde(path)
	if err != nil {
		return nil, fmt.Errorf("failed to expand path %s: %w", path, err)
	}
	
	// Check if path exists
	if _, err := os.Stat(expandedPath); os.IsNotExist(err) {
		return &CacheLocation{
			ID:           locationID,
			Name:         locationName,
			Path:         path,
			Error:        fmt.Sprintf("Path does not exist: %s", expandedPath),
			ScanDuration: time.Since(startTime),
		}, nil
	}
	
	location := &CacheLocation{
		ID:           locationID,
		Name:         locationName,
		Path:         path,
		Files:        make([]CacheFile, 0),
		ScanDuration: time.Since(startTime),
	}
	
	// Count total files first for progress tracking
	totalFiles, err := cs.countFiles(expandedPath)
	if err != nil {
		location.Error = fmt.Sprintf("Failed to count files: %v", err)
		return location, nil
	}
	
	filesScanned := 0
	
	// Walk through the directory
	err = filepath.WalkDir(expandedPath, func(path string, d fs.DirEntry, err error) error {
		// Check for stop signal
		select {
		case <-cs.stopChan:
			return fmt.Errorf("scan stopped by user")
		default:
		}
		
		if err != nil {
			// Log permission errors but continue scanning
			if os.IsPermission(err) {
				log.Printf("Permission denied accessing %s: %v", path, err)
				location.Files = append(location.Files, CacheFile{
					Path:  path,
					Error: fmt.Sprintf("Permission denied: %v", err),
				})
				return nil // Continue scanning
			}
			return err
		}
		
		// Get file info
		info, err := d.Info()
		if err != nil {
			log.Printf("Failed to get file info for %s: %v", path, err)
			location.Files = append(location.Files, CacheFile{
				Path:  path,
				Error: fmt.Sprintf("Failed to get file info: %v", err),
			})
			return nil
		}
		
		// Create cache file entry
		cacheFile := CacheFile{
			Name:         d.Name(),
			Path:         path,
			Size:         info.Size(),
			LastModified: info.ModTime(),
			LastAccessed: getLastAccessTime(info),
			IsDir:        d.IsDir(),
			Permissions:  info.Mode().String(),
		}
		
		// Add safety classification for files (not directories)
		if !d.IsDir() {
			fileMetadata := safety.FileMetadata{
				Name:         d.Name(),
				Path:         path,
				Size:         info.Size(),
				LastModified: info.ModTime(),
				LastAccessed: getLastAccessTime(info),
				IsDir:        d.IsDir(),
				Permissions:  info.Mode().String(),
			}
			classification := cs.safetyClassifier.ClassifyFile(fileMetadata)
			cacheFile.SafetyClassification = &classification
		}
		
		// Add to location
		location.Files = append(location.Files, cacheFile)
		
		// Update counters
		if d.IsDir() {
			location.DirCount++
		} else {
			location.FileCount++
			location.TotalSize += info.Size()
		}
		
		filesScanned++
		
		// Send progress update
		progress := ScanProgress{
			LocationID:   locationID,
			LocationName: locationName,
			CurrentPath:  path,
			FilesScanned: filesScanned,
			TotalFiles:   totalFiles,
			Progress:     float64(filesScanned) / float64(totalFiles) * 100,
			ElapsedTime:  time.Since(startTime),
		}
		
		// Calculate estimated time
		if filesScanned > 0 {
			avgTimePerFile := time.Since(startTime) / time.Duration(filesScanned)
			remainingFiles := totalFiles - filesScanned
			progress.EstimatedTime = avgTimePerFile * time.Duration(remainingFiles)
		}
		
		select {
		case cs.progressChan <- progress:
		default:
			// Channel is full, skip this update
		}
		
		return nil
	})
	
	location.ScanDuration = time.Since(startTime)
	
	if err != nil {
		location.Error = err.Error()
	}
	
	return location, nil
}

// ScanMultipleLocations scans multiple cache locations concurrently
func (cs *CacheScanner) ScanMultipleLocations(locations []struct {
	ID   string
	Name string
	Path string
}) (*ScanResult, error) {
	cs.mu.Lock()
	if cs.isScanning {
		cs.mu.Unlock()
		return nil, fmt.Errorf("scan already in progress")
	}
	cs.isScanning = true
	cs.scanStartTime = time.Now()
	cs.mu.Unlock()
	
	defer func() {
		cs.mu.Lock()
		cs.isScanning = false
		cs.mu.Unlock()
	}()
	
	result := &ScanResult{
		TotalLocations: len(locations),
		Locations:      make([]CacheLocation, 0, len(locations)),
		Errors:         make([]string, 0),
	}
	
	// Use a wait group for concurrent scanning
	var wg sync.WaitGroup
	var mu sync.Mutex
	
	for _, loc := range locations {
		wg.Add(1)
		go func(locationID, locationName, path string) {
			defer wg.Done()
			
			location, err := cs.ScanLocation(locationID, locationName, path)
			if err != nil {
				mu.Lock()
				result.Errors = append(result.Errors, fmt.Sprintf("Error scanning %s: %v", locationName, err))
				mu.Unlock()
				return
			}
			
			mu.Lock()
			result.Locations = append(result.Locations, *location)
			result.TotalSize += location.TotalSize
			result.TotalFiles += location.FileCount
			result.TotalDirs += location.DirCount
			mu.Unlock()
		}(loc.ID, loc.Name, loc.Path)
	}
	
	wg.Wait()
	result.ScanDuration = time.Since(cs.scanStartTime)
	
	return result, nil
}

// countFiles counts the total number of files in a directory tree
func (cs *CacheScanner) countFiles(rootPath string) (int, error) {
	count := 0
	err := filepath.WalkDir(rootPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			// Skip permission errors for counting
			if os.IsPermission(err) {
				return nil
			}
			return err
		}
		count++
		return nil
	})
	return count, err
}

// expandTilde expands ~ to the user's home directory
func expandTilde(path string) (string, error) {
	if len(path) == 0 || path[0] != '~' {
		return path, nil
	}
	
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	
	if len(path) == 1 {
		return homeDir, nil
	}
	
	return filepath.Join(homeDir, path[1:]), nil
}

// getLastAccessTime extracts the last access time from file info
func getLastAccessTime(info os.FileInfo) time.Time {
	// On macOS, we can use Sys() to get more detailed file info
	if sys := info.Sys(); sys != nil {
		// This is a simplified version - in practice, you might need
		// to use syscall.Stat_t for more accurate access time
		return info.ModTime() // Fallback to modification time
	}
	return info.ModTime()
}

// ToJSON converts a struct to JSON string
func (cf *CacheFile) ToJSON() (string, error) {
	data, err := json.Marshal(cf)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// ToJSON converts a struct to JSON string
func (cl *CacheLocation) ToJSON() (string, error) {
	data, err := json.Marshal(cl)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// ToJSON converts a struct to JSON string
func (sr *ScanResult) ToJSON() (string, error) {
	data, err := json.Marshal(sr)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// GetSafetyClassificationSummary returns a summary of safety classifications for a cache location
func (cl *CacheLocation) GetSafetyClassificationSummary() map[string]interface{} {
	var files []safety.FileMetadata
	classifications := make(map[string]safety.SafetyClassification)
	
	for _, file := range cl.Files {
		if !file.IsDir && file.SafetyClassification != nil {
			fileMetadata := safety.FileMetadata{
				Name:         file.Name,
				Path:         file.Path,
				Size:         file.Size,
				LastModified: file.LastModified,
				LastAccessed: file.LastAccessed,
				IsDir:        file.IsDir,
				Permissions:  file.Permissions,
			}
			files = append(files, fileMetadata)
			classifications[file.Path] = *file.SafetyClassification
		}
	}
	
	if len(classifications) == 0 {
		return map[string]interface{}{
			"total_files":      0,
			"safe_count":       0,
			"caution_count":    0,
			"risky_count":      0,
			"average_confidence": 0,
			"safe_percentage":    0,
			"caution_percentage": 0,
			"risky_percentage":   0,
		}
	}
	
	// Create a temporary classifier to get summary
	classifier := safety.NewDefaultSafetyClassifier()
	return classifier.GetClassificationSummary(classifications)
}
