package deletion

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// DeletionLogger provides comprehensive logging for deletion operations
type DeletionLogger struct {
	logFile   string
	mu        sync.RWMutex
	logs      []DeletionLogEntry
	maxLogs   int
}

// DeletionLogEntry represents a single log entry
type DeletionLogEntry struct {
	Timestamp   time.Time              `json:"timestamp"`
	Level       string                 `json:"level"`
	Message     string                 `json:"message"`
	Operation   string                 `json:"operation,omitempty"`
	File        string                 `json:"file,omitempty"`
	Details     map[string]interface{} `json:"details,omitempty"`
	Error       string                 `json:"error,omitempty"`
}

// LogLevel constants
const (
	LogLevelInfo    = "INFO"
	LogLevelWarning = "WARNING"
	LogLevelError   = "ERROR"
	LogLevelDebug   = "DEBUG"
)

// NewDeletionLogger creates a new deletion logger
func NewDeletionLogger() *DeletionLogger {
	logDir := filepath.Join(".", "logs")
	os.MkdirAll(logDir, 0755)
	
	logFile := filepath.Join(logDir, "deletion.log")
	
	logger := &DeletionLogger{
		logFile: logFile,
		logs:    make([]DeletionLogEntry, 0),
		maxLogs: 1000, // Keep last 1000 log entries in memory
	}
	
	// Load existing logs
	logger.loadLogs()
	
	return logger
}

// LogInfo logs an info message
func (dl *DeletionLogger) LogInfo(message string, details map[string]interface{}) {
	dl.log(LogLevelInfo, message, "", "", details, nil)
}

// LogWarning logs a warning message
func (dl *DeletionLogger) LogWarning(message string, details map[string]interface{}) {
	dl.log(LogLevelWarning, message, "", "", details, nil)
}

// LogError logs an error message
func (dl *DeletionLogger) LogError(message string, err error, details map[string]interface{}) {
	dl.log(LogLevelError, message, "", "", details, err)
}

// LogDebug logs a debug message
func (dl *DeletionLogger) LogDebug(message string, details map[string]interface{}) {
	dl.log(LogLevelDebug, message, "", "", details, nil)
}

// LogOperation logs an operation-specific message
func (dl *DeletionLogger) LogOperation(level, message, operation, file string, details map[string]interface{}) {
	dl.log(level, message, operation, file, details, nil)
}

// log is the internal logging method
func (dl *DeletionLogger) log(level, message, operation, file string, details map[string]interface{}, err error) {
	dl.mu.Lock()
	defer dl.mu.Unlock()
	
	entry := DeletionLogEntry{
		Timestamp: time.Now(),
		Level:     level,
		Message:   message,
		Operation: operation,
		File:      file,
		Details:   details,
	}
	
	if err != nil {
		entry.Error = err.Error()
	}
	
	// Add to in-memory logs
	dl.logs = append(dl.logs, entry)
	
	// Trim logs if we exceed maxLogs
	if len(dl.logs) > dl.maxLogs {
		dl.logs = dl.logs[len(dl.logs)-dl.maxLogs:]
	}
	
	// Write to log file
	dl.writeToFile(entry)
	
	// Also write to standard log
	dl.writeToStandardLog(entry)
}

// writeToFile writes a log entry to the log file
func (dl *DeletionLogger) writeToFile(entry DeletionLogEntry) {
	file, err := os.OpenFile(dl.logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Printf("Failed to open log file: %v", err)
		return
	}
	defer file.Close()
	
	// Write JSON log entry
	jsonData, err := json.Marshal(entry)
	if err != nil {
		log.Printf("Failed to marshal log entry: %v", err)
		return
	}
	
	file.WriteString(string(jsonData) + "\n")
}

// writeToStandardLog writes a log entry to standard log
func (dl *DeletionLogger) writeToStandardLog(entry DeletionLogEntry) {
	timestamp := entry.Timestamp.Format("2006-01-02 15:04:05")
	prefix := fmt.Sprintf("[%s] [%s]", timestamp, entry.Level)
	
	if entry.Operation != "" {
		prefix += fmt.Sprintf(" [%s]", entry.Operation)
	}
	
	if entry.File != "" {
		prefix += fmt.Sprintf(" [%s]", entry.File)
	}
	
	message := fmt.Sprintf("%s %s", prefix, entry.Message)
	
	if entry.Error != "" {
		message += fmt.Sprintf(" (Error: %s)", entry.Error)
	}
	
	if entry.Details != nil && len(entry.Details) > 0 {
		detailsJSON, _ := json.Marshal(entry.Details)
		message += fmt.Sprintf(" (Details: %s)", string(detailsJSON))
	}
	
	switch entry.Level {
	case LogLevelError:
		log.Printf("ERROR: %s", message)
	case LogLevelWarning:
		log.Printf("WARNING: %s", message)
	case LogLevelDebug:
		log.Printf("DEBUG: %s", message)
	default:
		log.Printf("INFO: %s", message)
	}
}

// GetHistory returns the log history
func (dl *DeletionLogger) GetHistory() []DeletionLogEntry {
	dl.mu.RLock()
	defer dl.mu.RUnlock()
	
	// Return a copy of the logs
	history := make([]DeletionLogEntry, len(dl.logs))
	copy(history, dl.logs)
	
	return history
}

// GetHistoryByOperation returns logs filtered by operation
func (dl *DeletionLogger) GetHistoryByOperation(operation string) []DeletionLogEntry {
	dl.mu.RLock()
	defer dl.mu.RUnlock()
	
	var filtered []DeletionLogEntry
	for _, entry := range dl.logs {
		if entry.Operation == operation {
			filtered = append(filtered, entry)
		}
	}
	
	return filtered
}

// GetHistoryByLevel returns logs filtered by level
func (dl *DeletionLogger) GetHistoryByLevel(level string) []DeletionLogEntry {
	dl.mu.RLock()
	defer dl.mu.RUnlock()
	
	var filtered []DeletionLogEntry
	for _, entry := range dl.logs {
		if entry.Level == level {
			filtered = append(filtered, entry)
		}
	}
	
	return filtered
}

// GetRecentLogs returns logs from the last N hours
func (dl *DeletionLogger) GetRecentLogs(hours int) []DeletionLogEntry {
	dl.mu.RLock()
	defer dl.mu.RUnlock()
	
	cutoff := time.Now().Add(-time.Duration(hours) * time.Hour)
	var recent []DeletionLogEntry
	
	for _, entry := range dl.logs {
		if entry.Timestamp.After(cutoff) {
			recent = append(recent, entry)
		}
	}
	
	return recent
}

// ClearHistory clears the log history
func (dl *DeletionLogger) ClearHistory() {
	dl.mu.Lock()
	defer dl.mu.Unlock()
	
	dl.logs = make([]DeletionLogEntry, 0)
	
	// Clear log file
	os.Remove(dl.logFile)
}

// loadLogs loads existing logs from the log file
func (dl *DeletionLogger) loadLogs() {
	file, err := os.Open(dl.logFile)
	if err != nil {
		// Log file doesn't exist yet, that's okay
		return
	}
	defer file.Close()
	
	// Read and parse existing logs
	decoder := json.NewDecoder(file)
	for {
		var entry DeletionLogEntry
		if err := decoder.Decode(&entry); err != nil {
			// End of file or parse error
			break
		}
		dl.logs = append(dl.logs, entry)
	}
	
	// Trim to maxLogs if needed
	if len(dl.logs) > dl.maxLogs {
		dl.logs = dl.logs[len(dl.logs)-dl.maxLogs:]
	}
}

// GetLogStats returns statistics about the logs
func (dl *DeletionLogger) GetLogStats() map[string]interface{} {
	dl.mu.RLock()
	defer dl.mu.RUnlock()
	
	stats := map[string]interface{}{
		"total_logs":    len(dl.logs),
		"log_file":      dl.logFile,
		"max_logs":      dl.maxLogs,
	}
	
	if len(dl.logs) > 0 {
		stats["oldest_log"] = dl.logs[0].Timestamp
		stats["newest_log"] = dl.logs[len(dl.logs)-1].Timestamp
		
		// Count by level
		levelCounts := make(map[string]int)
		for _, entry := range dl.logs {
			levelCounts[entry.Level]++
		}
		stats["level_counts"] = levelCounts
		
		// Count by operation
		operationCounts := make(map[string]int)
		for _, entry := range dl.logs {
			if entry.Operation != "" {
				operationCounts[entry.Operation]++
			}
		}
		stats["operation_counts"] = operationCounts
	}
	
	return stats
}
