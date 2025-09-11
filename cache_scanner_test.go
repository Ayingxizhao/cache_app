package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// TestCacheScanner tests the basic functionality of the cache scanner
func TestCacheScanner(t *testing.T) {
	scanner := NewCacheScanner()
	
	// Test scanning a temporary directory
	tempDir := t.TempDir()
	
	// Create some test files
	testFiles := []string{
		"test1.txt",
		"test2.log",
		"subdir/test3.cache",
		"subdir/nested/test4.tmp",
	}
	
	for _, file := range testFiles {
		fullPath := filepath.Join(tempDir, file)
		dir := filepath.Dir(fullPath)
		
		if err := os.MkdirAll(dir, 0755); err != nil {
			t.Fatalf("Failed to create directory %s: %v", dir, err)
		}
		
		if err := os.WriteFile(fullPath, []byte("test content"), 0644); err != nil {
			t.Fatalf("Failed to create file %s: %v", fullPath, err)
		}
	}
	
	// Scan the directory
	location, err := scanner.ScanLocation("test", "Test Directory", tempDir)
	if err != nil {
		t.Fatalf("Failed to scan directory: %v", err)
	}
	
	// Verify results
	if location.FileCount != 4 {
		t.Errorf("Expected 4 files, got %d", location.FileCount)
	}
	
	if location.DirCount != 3 { // subdir, subdir/nested, and root directory
		t.Errorf("Expected 3 directories, got %d", location.DirCount)
	}
	
	if len(location.Files) != 7 { // 4 files + 3 directories
		t.Errorf("Expected 7 total entries, got %d", len(location.Files))
	}
	
	// Test JSON serialization
	jsonResult, err := location.ToJSON()
	if err != nil {
		t.Fatalf("Failed to serialize to JSON: %v", err)
	}
	
	var parsedLocation CacheLocation
	if err := json.Unmarshal([]byte(jsonResult), &parsedLocation); err != nil {
		t.Fatalf("Failed to parse JSON: %v", err)
	}
	
	if parsedLocation.FileCount != location.FileCount {
		t.Errorf("JSON serialization/deserialization failed")
	}
}

// TestCacheScannerWithPermissions tests permission error handling
func TestCacheScannerWithPermissions(t *testing.T) {
	scanner := NewCacheScanner()
	
	// Test with a non-existent directory
	location, err := scanner.ScanLocation("nonexistent", "Non-existent Directory", "/nonexistent/path")
	if err != nil {
		t.Fatalf("Expected no error for non-existent directory, got: %v", err)
	}
	
	if location.Error == "" {
		t.Error("Expected error message for non-existent directory")
	}
}

// TestMultipleLocations tests scanning multiple locations
func TestMultipleLocations(t *testing.T) {
	scanner := NewCacheScanner()
	
	// Create test directories
	tempDir1 := t.TempDir()
	tempDir2 := t.TempDir()
	
	// Create test files in both directories
	os.WriteFile(filepath.Join(tempDir1, "file1.txt"), []byte("content1"), 0644)
	os.WriteFile(filepath.Join(tempDir2, "file2.txt"), []byte("content2"), 0644)
	
	locations := []struct {
		ID   string
		Name string
		Path string
	}{
		{"test1", "Test Directory 1", tempDir1},
		{"test2", "Test Directory 2", tempDir2},
	}
	
	result, err := scanner.ScanMultipleLocations(locations)
	if err != nil {
		t.Fatalf("Failed to scan multiple locations: %v", err)
	}
	
	if result.TotalLocations != 2 {
		t.Errorf("Expected 2 locations, got %d", result.TotalLocations)
	}
	
	if result.TotalFiles != 2 {
		t.Errorf("Expected 2 total files, got %d", result.TotalFiles)
	}
}

// BenchmarkCacheScanner benchmarks the cache scanner performance
func BenchmarkCacheScanner(b *testing.B) {
	scanner := NewCacheScanner()
	
	// Create a test directory with many files
	tempDir := b.TempDir()
	
	// Create 1000 test files
	for i := 0; i < 1000; i++ {
		filename := fmt.Sprintf("test_file_%d.txt", i)
		filepath := filepath.Join(tempDir, filename)
		os.WriteFile(filepath, []byte("test content"), 0644)
	}
	
	b.ResetTimer()
	
	for i := 0; i < b.N; i++ {
		_, err := scanner.ScanLocation("benchmark", "Benchmark Directory", tempDir)
		if err != nil {
			b.Fatalf("Failed to scan directory: %v", err)
		}
	}
}

// Example usage of the cache scanner
func ExampleCacheScanner_ScanLocation() {
	// Create a new cache scanner
	scanner := NewCacheScanner()
	
	// Scan a single location
	location, err := scanner.ScanLocation("example", "Example Directory", "~/Library/Caches")
	if err != nil {
		log.Printf("Error scanning location: %v", err)
		return
	}
	
	// Print results
	fmt.Printf("Scanned %s\n", location.Name)
	fmt.Printf("Files: %d, Directories: %d\n", location.FileCount, location.DirCount)
	fmt.Printf("Total size: %d bytes\n", location.TotalSize)
	fmt.Printf("Scan duration: %v\n", location.ScanDuration)
	
	// Convert to JSON
	jsonResult, err := location.ToJSON()
	if err != nil {
		log.Printf("Error converting to JSON: %v", err)
		return
	}
	
	fmt.Printf("JSON result: %s\n", jsonResult)
}

// Example usage of scanning multiple locations
func ExampleCacheScanner_ScanMultipleLocations() {
	scanner := NewCacheScanner()
	
	locations := []struct {
		ID   string
		Name string
		Path string
	}{
		{"chrome", "Chrome Cache", "~/Library/Caches/Google/Chrome"},
		{"safari", "Safari Cache", "~/Library/Caches/com.apple.Safari"},
		{"spotify", "Spotify Cache", "~/Library/Caches/com.spotify.client"},
	}
	
	result, err := scanner.ScanMultipleLocations(locations)
	if err != nil {
		log.Printf("Error scanning multiple locations: %v", err)
		return
	}
	
	fmt.Printf("Scanned %d locations\n", result.TotalLocations)
	fmt.Printf("Total files: %d\n", result.TotalFiles)
	fmt.Printf("Total size: %d bytes\n", result.TotalSize)
	fmt.Printf("Total scan duration: %v\n", result.ScanDuration)
	
	// Print results for each location
	for _, location := range result.Locations {
		fmt.Printf("\n%s (%s):\n", location.Name, location.Path)
		fmt.Printf("  Files: %d, Size: %d bytes\n", location.FileCount, location.TotalSize)
		if location.Error != "" {
			fmt.Printf("  Error: %s\n", location.Error)
		}
	}
}

// TestProgressReporting tests the progress reporting functionality
func TestProgressReporting(t *testing.T) {
	scanner := NewCacheScanner()
	
	// Create a test directory with many files
	tempDir := t.TempDir()
	
	// Create 100 test files
	for i := 0; i < 100; i++ {
		filename := fmt.Sprintf("test_file_%d.txt", i)
		filepath := filepath.Join(tempDir, filename)
		os.WriteFile(filepath, []byte("test content"), 0644)
	}
	
	// Start progress monitoring in a goroutine
	progressChan := scanner.GetProgressChannel()
	progressUpdates := make([]ScanProgress, 0)
	
	go func() {
		for progress := range progressChan {
			progressUpdates = append(progressUpdates, progress)
		}
	}()
	
	// Scan the directory
	location, err := scanner.ScanLocation("progress_test", "Progress Test Directory", tempDir)
	if err != nil {
		t.Fatalf("Failed to scan directory: %v", err)
	}
	
	// Wait a bit for progress updates to be processed
	time.Sleep(100 * time.Millisecond)
	
	// Verify we received progress updates
	if len(progressUpdates) == 0 {
		t.Error("Expected progress updates, but received none")
	}
	
	// Verify the final progress update shows 100%
	lastProgress := progressUpdates[len(progressUpdates)-1]
	if lastProgress.Progress < 99.0 { // Allow for some floating point precision issues
		t.Errorf("Expected final progress to be ~100%%, got %f%%", lastProgress.Progress)
	}
	
	// Verify file count matches
	if location.FileCount != 100 {
		t.Errorf("Expected 100 files, got %d", location.FileCount)
	}
}
