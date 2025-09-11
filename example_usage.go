package main

import (
	"encoding/json"
	"fmt"
	"log"
)

// ExampleCacheScannerUsage demonstrates how to use the cache scanner
func ExampleCacheScannerUsage() {
	fmt.Println("=== Cache Scanner Example Usage ===")
	
	// Create a new cache scanner
	scanner := NewCacheScanner()
	
	// Example 1: Scan a single cache location
	fmt.Println("\n1. Scanning single location...")
	location, err := scanner.ScanLocation("user_caches", "User Library Caches", "~/Library/Caches")
	if err != nil {
		log.Printf("Error scanning location: %v", err)
	} else {
		fmt.Printf("✓ Scanned: %s\n", location.Name)
		fmt.Printf("  Path: %s\n", location.Path)
		fmt.Printf("  Files: %d, Directories: %d\n", location.FileCount, location.DirCount)
		fmt.Printf("  Total size: %d bytes (%.2f MB)\n", location.TotalSize, float64(location.TotalSize)/(1024*1024))
		fmt.Printf("  Scan duration: %v\n", location.ScanDuration)
		
		if location.Error != "" {
			fmt.Printf("  Warning: %s\n", location.Error)
		}
	}
	
	// Example 2: Scan multiple locations concurrently
	fmt.Println("\n2. Scanning multiple locations...")
	locations := []struct {
		ID   string
		Name string
		Path string
	}{
		{"chrome", "Chrome Cache", "~/Library/Caches/Google/Chrome"},
		{"safari", "Safari Cache", "~/Library/Caches/com.apple.Safari"},
		{"spotify", "Spotify Cache", "~/Library/Caches/com.spotify.client"},
		{"vscode", "VS Code Cache", "~/Library/Caches/com.microsoft.VSCode"},
	}
	
	result, err := scanner.ScanMultipleLocations(locations)
	if err != nil {
		log.Printf("Error scanning multiple locations: %v", err)
	} else {
		fmt.Printf("✓ Scanned %d locations\n", result.TotalLocations)
		fmt.Printf("  Total files: %d\n", result.TotalFiles)
		fmt.Printf("  Total directories: %d\n", result.TotalDirs)
		fmt.Printf("  Total size: %d bytes (%.2f MB)\n", result.TotalSize, float64(result.TotalSize)/(1024*1024))
		fmt.Printf("  Total scan duration: %v\n", result.ScanDuration)
		
		// Print detailed results for each location
		fmt.Println("\n  Detailed results:")
		for _, loc := range result.Locations {
			fmt.Printf("    %s (%s):\n", loc.Name, loc.ID)
			fmt.Printf("      Files: %d, Size: %d bytes (%.2f MB)\n", 
				loc.FileCount, loc.TotalSize, float64(loc.TotalSize)/(1024*1024))
			if loc.Error != "" {
				fmt.Printf("      Error: %s\n", loc.Error)
			}
		}
		
		// Print any global errors
		if len(result.Errors) > 0 {
			fmt.Println("\n  Global errors:")
			for _, err := range result.Errors {
				fmt.Printf("    - %s\n", err)
			}
		}
	}
	
	// Example 3: JSON serialization
	fmt.Println("\n3. JSON serialization example...")
	if result != nil {
		jsonResult, err := result.ToJSON()
		if err != nil {
			log.Printf("Error serializing to JSON: %v", err)
		} else {
			fmt.Printf("✓ Serialized to JSON (%d characters)\n", len(jsonResult))
			
			// Pretty print a sample of the JSON
			var prettyResult map[string]interface{}
			if err := json.Unmarshal([]byte(jsonResult), &prettyResult); err == nil {
				prettyJSON, _ := json.MarshalIndent(prettyResult, "  ", "  ")
				fmt.Printf("  Sample JSON structure:\n%s\n", string(prettyJSON)[:500]+"...")
			}
		}
	}
	
	// Example 4: Progress monitoring
	fmt.Println("\n4. Progress monitoring example...")
	progressChan := scanner.GetProgressChannel()
	
	// Start a goroutine to monitor progress
	go func() {
		for progress := range progressChan {
			fmt.Printf("  Progress: %s - %.1f%% (%d/%d files) - %s\n", 
				progress.LocationName, progress.Progress, progress.FilesScanned, progress.TotalFiles, progress.CurrentPath)
		}
	}()
	
	// Scan a location with progress monitoring
	_, err = scanner.ScanLocation("progress_demo", "Progress Demo", "~/Library/Logs")
	if err != nil {
		log.Printf("Error in progress demo: %v", err)
	}
	
	fmt.Println("\n=== Example completed ===")
}

// ExampleAppIntegration demonstrates how to use the cache scanner through the App struct
func ExampleAppIntegration() {
	fmt.Println("=== App Integration Example ===")
	
	// Create a new app instance
	app := NewApp()
	
	// Example 1: Get cache locations from config
	fmt.Println("\n1. Loading cache locations from config...")
	locationsJSON, err := app.GetCacheLocationsFromConfig()
	if err != nil {
		log.Printf("Error loading config: %v", err)
	} else {
		fmt.Printf("✓ Loaded cache locations from config\n")
		
		// Parse and display some locations
		var locations []map[string]interface{}
		if err := json.Unmarshal([]byte(locationsJSON), &locations); err == nil {
			fmt.Printf("  Found %d cache locations:\n", len(locations))
			for i, loc := range locations {
				if i >= 5 { // Show only first 5
					fmt.Printf("  ... and %d more\n", len(locations)-5)
					break
				}
				fmt.Printf("    %s (%s): %s\n", 
					loc["name"], loc["type"], loc["path"])
			}
		}
	}
	
	// Example 2: Get system information
	fmt.Println("\n2. Getting system information...")
	systemInfo, err := app.GetSystemInfo()
	if err != nil {
		log.Printf("Error getting system info: %v", err)
	} else {
		fmt.Printf("✓ System info: %s\n", systemInfo)
	}
	
	// Example 3: Scan a specific location
	fmt.Println("\n3. Scanning a specific location...")
	scanResult, err := app.ScanCacheLocation("user_library_caches", "User Library Caches", "~/Library/Caches")
	if err != nil {
		log.Printf("Error scanning location: %v", err)
	} else {
		fmt.Printf("✓ Scan completed\n")
		
		// Parse and display results
		var location CacheLocation
		if err := json.Unmarshal([]byte(scanResult), &location); err == nil {
			fmt.Printf("  Files: %d, Size: %.2f MB, Duration: %v\n", 
				location.FileCount, float64(location.TotalSize)/(1024*1024), location.ScanDuration)
		}
	}
	
	// Example 4: Check if scanning is in progress
	fmt.Println("\n4. Checking scan status...")
	isScanning := app.IsScanning()
	fmt.Printf("  Currently scanning: %t\n", isScanning)
	
	fmt.Println("\n=== App integration example completed ===")
}

// ExampleErrorHandling demonstrates error handling patterns
func ExampleErrorHandling() {
	fmt.Println("=== Error Handling Example ===")
	
	scanner := NewCacheScanner()
	
	// Example 1: Non-existent directory
	fmt.Println("\n1. Handling non-existent directory...")
	location, err := scanner.ScanLocation("nonexistent", "Non-existent Directory", "/nonexistent/path")
	if err != nil {
		log.Printf("Error: %v", err)
	} else {
		fmt.Printf("✓ Handled gracefully: %s\n", location.Error)
	}
	
	// Example 2: Permission denied (if running as non-admin)
	fmt.Println("\n2. Handling permission errors...")
	location, err = scanner.ScanLocation("system_caches", "System Caches", "/System/Library/Caches")
	if err != nil {
		log.Printf("Error: %v", err)
	} else {
		if location.Error != "" {
			fmt.Printf("✓ Handled permission error: %s\n", location.Error)
		} else {
			fmt.Printf("✓ Successfully scanned system caches\n")
		}
	}
	
	// Example 3: Invalid JSON input
	fmt.Println("\n3. Handling invalid JSON...")
	app := NewApp()
	_, err = app.ScanMultipleCacheLocations("invalid json")
	if err != nil {
		fmt.Printf("✓ Handled invalid JSON: %v\n", err)
	}
	
	fmt.Println("\n=== Error handling example completed ===")
}

// RunExamples function to run examples (for testing purposes)
func RunExamples() {
	fmt.Println("Cache Scanner Examples")
	fmt.Println("=====================")
	
	// Run examples
	ExampleCacheScannerUsage()
	fmt.Println()
	ExampleAppIntegration()
	fmt.Println()
	ExampleErrorHandling()
	
	fmt.Println("\nAll examples completed!")
}
