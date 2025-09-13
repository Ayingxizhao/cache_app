package safety

import (
	"fmt"
	"path/filepath"
	"strings"
	"time"
)

// SafetyLevel represents the safety classification level
type SafetyLevel int

const (
	Safe SafetyLevel = iota
	Caution
	Risky
)

// String returns the string representation of SafetyLevel
func (sl SafetyLevel) String() string {
	switch sl {
	case Safe:
		return "Safe"
	case Caution:
		return "Caution"
	case Risky:
		return "Risky"
	default:
		return "Unknown"
	}
}

// SafetyClassification represents the result of safety analysis for a cache file
type SafetyClassification struct {
	Level       SafetyLevel `json:"level"`
	Confidence  int         `json:"confidence"`  // 0-100 percentage
	Explanation string      `json:"explanation"` // Human-readable explanation
	Reasons     []string    `json:"reasons"`     // List of specific reasons for the classification
}

// FileMetadata represents the metadata needed for safety classification
type FileMetadata struct {
	Name         string
	Path         string
	Size         int64
	LastModified time.Time
	LastAccessed time.Time
	IsDir        bool
	Permissions  string
}

// SafetyClassifier handles the classification of cache files based on safety rules
type SafetyClassifier struct {
	// Configuration for classification rules
	config ClassificationConfig
}

// ClassificationConfig holds configuration for the classification rules
type ClassificationConfig struct {
	// Age thresholds
	SafeAgeThreshold    time.Duration // Files older than this are generally safer
	CautionAgeThreshold time.Duration // Files newer than this need more caution
	
	// Size thresholds
	LargeFileThreshold int64 // Files larger than this are flagged for attention
	
	// System-critical paths that should be marked as risky
	SystemCriticalPaths []string
	
	// Temporary directory patterns that are generally safe
	TempDirPatterns []string
	
	// Development cache patterns that need caution
	DevCachePatterns []string
}

// DefaultConfig returns a default configuration for the classifier
func DefaultConfig() ClassificationConfig {
	return ClassificationConfig{
		SafeAgeThreshold:    30 * 24 * time.Hour, // 30 days
		CautionAgeThreshold: 7 * 24 * time.Hour,  // 7 days
		LargeFileThreshold:  100 * 1024 * 1024,   // 100MB
		SystemCriticalPaths: []string{
			"/System/",
			"/usr/",
			"/var/log/",
			"/Library/Logs/",
			"/Applications/",
			"/bin/",
			"/sbin/",
		},
		TempDirPatterns: []string{
			"/tmp/",
			"/var/tmp/",
			"~/Library/Caches/",
			"/private/var/folders/",
			"temp",
			"tmp",
			"cache",
		},
		DevCachePatterns: []string{
			"node_modules",
			".git",
			"build/",
			"dist/",
			"target/",
			".gradle",
			".m2/",
		},
	}
}

// NewSafetyClassifier creates a new safety classifier with the given configuration
func NewSafetyClassifier(config ClassificationConfig) *SafetyClassifier {
	return &SafetyClassifier{
		config: config,
	}
}

// NewDefaultSafetyClassifier creates a new safety classifier with default configuration
func NewDefaultSafetyClassifier() *SafetyClassifier {
	return NewSafetyClassifier(DefaultConfig())
}

// ClassifyFile analyzes a file and returns its safety classification
func (sc *SafetyClassifier) ClassifyFile(file FileMetadata) SafetyClassification {
	var reasons []string
	var confidence int
	var level SafetyLevel

	// Start with base confidence
	confidence = 50 // Base confidence
	
	// Check file age
	age := time.Since(file.LastModified)
	if age > sc.config.SafeAgeThreshold {
		reasons = append(reasons, fmt.Sprintf("File is %d days old (safe threshold: %d days)", int(age.Hours()/24), int(sc.config.SafeAgeThreshold.Hours()/24)))
		confidence += 20
	} else if age < sc.config.CautionAgeThreshold {
		reasons = append(reasons, fmt.Sprintf("File is recent (%d days old, caution threshold: %d days)", int(age.Hours()/24), int(sc.config.CautionAgeThreshold.Hours()/24)))
		confidence -= 15
	}

	// Check file size
	if file.Size > sc.config.LargeFileThreshold {
		reasons = append(reasons, fmt.Sprintf("Large file size: %.2f MB (threshold: %.2f MB)", float64(file.Size)/(1024*1024), float64(sc.config.LargeFileThreshold)/(1024*1024)))
		confidence -= 10
	} else if file.Size < 1024 { // Less than 1KB
		reasons = append(reasons, "Very small file size, likely safe to delete")
		confidence += 5
	}

	// Check if it's a system-critical location
	if sc.isSystemCritical(file.Path) {
		reasons = append(reasons, "Located in system-critical directory")
		confidence -= 30
		level = Risky
	}

	// Check if it's a temporary directory
	if sc.isTempDirectory(file.Path) {
		reasons = append(reasons, "Located in temporary directory")
		confidence += 25
		if level != Risky {
			level = Safe
		}
	}

	// Check if it's a development cache
	if sc.isDevCache(file.Path, file.Name) {
		reasons = append(reasons, "Development cache detected")
		confidence -= 5
		if level != Risky {
			level = Caution
		}
	}

	// Check file permissions (read-only files might be more critical)
	if strings.Contains(file.Permissions, "r--") && !strings.Contains(file.Permissions, "rw") {
		reasons = append(reasons, "Read-only file, may be system-critical")
		confidence -= 5
	}

	// Determine final level if not already set
	if level == 0 { // Not set yet
		if confidence >= 70 {
			level = Safe
		} else if confidence >= 40 {
			level = Caution
		} else {
			level = Risky
		}
	}

	// Ensure confidence is within bounds
	if confidence > 100 {
		confidence = 100
	} else if confidence < 0 {
		confidence = 0
	}

	// Generate explanation
	explanation := sc.generateExplanation(level, confidence, reasons)

	return SafetyClassification{
		Level:       level,
		Confidence:  confidence,
		Explanation: explanation,
		Reasons:     reasons,
	}
}

// isSystemCritical checks if the file path is in a system-critical location
func (sc *SafetyClassifier) isSystemCritical(path string) bool {
	normalizedPath := strings.ToLower(filepath.Clean(path))
	
	for _, criticalPath := range sc.config.SystemCriticalPaths {
		if strings.Contains(normalizedPath, strings.ToLower(criticalPath)) {
			return true
		}
	}
	
	// Additional checks for macOS-specific system paths
	macOSSystemPaths := []string{
		"/library/logs/",
		"/system/library/",
		"/private/var/db/",
		"/private/var/run/",
	}
	
	for _, sysPath := range macOSSystemPaths {
		if strings.Contains(normalizedPath, sysPath) {
			return true
		}
	}
	
	return false
}

// isTempDirectory checks if the file path is in a temporary directory
func (sc *SafetyClassifier) isTempDirectory(path string) bool {
	normalizedPath := strings.ToLower(filepath.Clean(path))
	
	for _, tempPattern := range sc.config.TempDirPatterns {
		if strings.Contains(normalizedPath, strings.ToLower(tempPattern)) {
			return true
		}
	}
	
	return false
}

// isDevCache checks if the file is a development cache
func (sc *SafetyClassifier) isDevCache(path, name string) bool {
	normalizedPath := strings.ToLower(filepath.Clean(path))
	normalizedName := strings.ToLower(name)
	
	for _, devPattern := range sc.config.DevCachePatterns {
		if strings.Contains(normalizedPath, strings.ToLower(devPattern)) ||
		   strings.Contains(normalizedName, strings.ToLower(devPattern)) {
			return true
		}
	}
	
	return false
}

// generateExplanation creates a human-readable explanation for the classification
func (sc *SafetyClassifier) generateExplanation(level SafetyLevel, confidence int, reasons []string) string {
	var explanation string
	
	switch level {
	case Safe:
		explanation = fmt.Sprintf("This file is classified as SAFE to delete with %d%% confidence. ", confidence)
		if len(reasons) > 0 {
			explanation += "Key factors: " + strings.Join(reasons[:min(3, len(reasons))], "; ") + "."
		}
		explanation += " It appears to be a temporary or cache file that can be safely removed without affecting system functionality."
		
	case Caution:
		explanation = fmt.Sprintf("This file is classified as requiring CAUTION with %d%% confidence. ", confidence)
		if len(reasons) > 0 {
			explanation += "Key factors: " + strings.Join(reasons[:min(3, len(reasons))], "; ") + "."
		}
		explanation += " Review the file details before deletion as it may contain important data or be recently used."
		
	case Risky:
		explanation = fmt.Sprintf("This file is classified as RISKY to delete with %d%% confidence. ", confidence)
		if len(reasons) > 0 {
			explanation += "Key factors: " + strings.Join(reasons[:min(3, len(reasons))], "; ") + "."
		}
		explanation += " This file appears to be in a system-critical location or may contain important data. Deletion is not recommended."
	}
	
	return explanation
}

// min returns the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// ClassifyFiles classifies multiple files and returns their classifications
func (sc *SafetyClassifier) ClassifyFiles(files []FileMetadata) map[string]SafetyClassification {
	results := make(map[string]SafetyClassification)
	
	for _, file := range files {
		classification := sc.ClassifyFile(file)
		results[file.Path] = classification
	}
	
	return results
}

// GetClassificationSummary returns a summary of classifications for a set of files
func (sc *SafetyClassifier) GetClassificationSummary(classifications map[string]SafetyClassification) map[string]interface{} {
	safeCount := 0
	cautionCount := 0
	riskyCount := 0
	totalConfidence := 0
	
	for _, classification := range classifications {
		switch classification.Level {
		case Safe:
			safeCount++
		case Caution:
			cautionCount++
		case Risky:
			riskyCount++
		}
		totalConfidence += classification.Confidence
	}
	
	totalFiles := len(classifications)
	avgConfidence := 0
	if totalFiles > 0 {
		avgConfidence = totalConfidence / totalFiles
	}
	
	return map[string]interface{}{
		"total_files":      totalFiles,
		"safe_count":       safeCount,
		"caution_count":    cautionCount,
		"risky_count":      riskyCount,
		"average_confidence": avgConfidence,
		"safe_percentage":   float64(safeCount) / float64(totalFiles) * 100,
		"caution_percentage": float64(cautionCount) / float64(totalFiles) * 100,
		"risky_percentage": float64(riskyCount) / float64(totalFiles) * 100,
	}
}
