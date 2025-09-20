package ui

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

// LogLevel represents the logging level
type LogLevel int

const (
	LogLevelDebug LogLevel = iota
	LogLevelInfo
	LogLevelWarn
	LogLevelError
	LogLevelFatal
)

// String returns the string representation of the log level
func (ll LogLevel) String() string {
	switch ll {
	case LogLevelDebug:
		return "DEBUG"
	case LogLevelInfo:
		return "INFO"
	case LogLevelWarn:
		return "WARN"
	case LogLevelError:
		return "ERROR"
	case LogLevelFatal:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

// ParseLogLevel parses a string to LogLevel
func ParseLogLevel(level string) LogLevel {
	switch strings.ToUpper(level) {
	case "DEBUG":
		return LogLevelDebug
	case "INFO":
		return LogLevelInfo
	case "WARN", "WARNING":
		return LogLevelWarn
	case "ERROR":
		return LogLevelError
	case "FATAL":
		return LogLevelFatal
	default:
		return LogLevelInfo
	}
}

// LogEntry represents a single log entry
type LogEntry struct {
	Timestamp time.Time              `json:"timestamp"`
	Level     LogLevel               `json:"level"`
	Message   string                 `json:"message"`
	Context   map[string]interface{} `json:"context,omitempty"`
	Error     error                  `json:"error,omitempty"`
	File      string                 `json:"file,omitempty"`
	Line      int                    `json:"line,omitempty"`
	Function  string                 `json:"function,omitempty"`
	TraceID   string                 `json:"trace_id,omitempty"`
	UserID    string                 `json:"user_id,omitempty"`
	SessionID string                 `json:"session_id,omitempty"`
}

// ToJSON converts the log entry to JSON
func (le *LogEntry) ToJSON() (string, error) {
	data, err := json.Marshal(le)
	if err != nil {
		return "", fmt.Errorf("failed to marshal log entry to JSON: %w", err)
	}
	return string(data), nil
}

// LogFormatter defines the interface for log formatters
type LogFormatter interface {
	Format(entry *LogEntry) string
}

// JSONFormatter formats log entries as JSON
type JSONFormatter struct{}

// Format formats a log entry as JSON
func (jf *JSONFormatter) Format(entry *LogEntry) string {
	jsonStr, err := entry.ToJSON()
	if err != nil {
		return fmt.Sprintf(`{"timestamp":"%s","level":"%s","message":"%s","error":"failed to format log entry"}`, 
			entry.Timestamp.Format(time.RFC3339), entry.Level.String(), entry.Message)
	}
	return jsonStr
}

// TextFormatter formats log entries as human-readable text
type TextFormatter struct {
	ShowCaller bool
}

// Format formats a log entry as text
func (tf *TextFormatter) Format(entry *LogEntry) string {
	var parts []string
	
	// Timestamp
	parts = append(parts, entry.Timestamp.Format("2006-01-02 15:04:05"))
	
	// Level
	parts = append(parts, fmt.Sprintf("[%s]", entry.Level.String()))
	
	// Caller info
	if tf.ShowCaller && entry.File != "" {
		parts = append(parts, fmt.Sprintf("[%s:%d]", filepath.Base(entry.File), entry.Line))
	}
	
	// Message
	parts = append(parts, entry.Message)
	
	// Context
	if len(entry.Context) > 0 {
		contextStr := fmt.Sprintf("%v", entry.Context)
		parts = append(parts, fmt.Sprintf("context=%s", contextStr))
	}
	
	// Error
	if entry.Error != nil {
		parts = append(parts, fmt.Sprintf("error=%v", entry.Error))
	}
	
	return strings.Join(parts, " ")
}

// LogWriter defines the interface for log writers
type LogWriter interface {
	Write(entry *LogEntry) error
	Close() error
}

// FileWriter writes logs to a file
type FileWriter struct {
	file   *os.File
	mu     sync.Mutex
	path   string
	maxSize int64
}

// NewFileWriter creates a new file writer
func NewFileWriter(path string, maxSize int64) (*FileWriter, error) {
	// Create directory if it doesn't exist
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create log directory: %w", err)
	}
	
	file, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to open log file: %w", err)
	}
	
	return &FileWriter{
		file:    file,
		path:    path,
		maxSize: maxSize,
	}, nil
}

// Write writes a log entry to the file
func (fw *FileWriter) Write(entry *LogEntry) error {
	fw.mu.Lock()
	defer fw.mu.Unlock()
	
	// Check file size and rotate if necessary
	if fw.maxSize > 0 {
		if stat, err := fw.file.Stat(); err == nil && stat.Size() > fw.maxSize {
			fw.file.Close()
			fw.rotateFile()
		}
	}
	
	jsonStr, err := entry.ToJSON()
	if err != nil {
		return err
	}
	_, err = fw.file.WriteString(jsonStr + "\n")
	return err
}

// Close closes the file writer
func (fw *FileWriter) Close() error {
	fw.mu.Lock()
	defer fw.mu.Unlock()
	return fw.file.Close()
}

// rotateFile rotates the log file
func (fw *FileWriter) rotateFile() error {
	// Close current file
	fw.file.Close()
	
	// Rename current file to backup
	backupPath := fw.path + "." + time.Now().Format("20060102-150405")
	if err := os.Rename(fw.path, backupPath); err != nil {
		return err
	}
	
	// Open new file
	file, err := os.OpenFile(fw.path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	
	fw.file = file
	return nil
}

// ConsoleWriter writes logs to the console
type ConsoleWriter struct {
	writer io.Writer
}

// NewConsoleWriter creates a new console writer
func NewConsoleWriter() *ConsoleWriter {
	return &ConsoleWriter{
		writer: os.Stdout,
	}
}

// Write writes a log entry to the console
func (cw *ConsoleWriter) Write(entry *LogEntry) error {
	jsonStr, err := entry.ToJSON()
	if err != nil {
		return err
	}
	_, err = fmt.Fprintln(cw.writer, jsonStr)
	return err
}

// Close closes the console writer (no-op)
func (cw *ConsoleWriter) Close() error {
	return nil
}

// MultiWriter writes logs to multiple writers
type MultiWriter struct {
	writers []LogWriter
}

// NewMultiWriter creates a new multi-writer
func NewMultiWriter(writers ...LogWriter) *MultiWriter {
	return &MultiWriter{
		writers: writers,
	}
}

// Write writes a log entry to all writers
func (mw *MultiWriter) Write(entry *LogEntry) error {
	for _, writer := range mw.writers {
		if err := writer.Write(entry); err != nil {
			// Log the error but continue with other writers
			fmt.Printf("Failed to write to log writer: %v\n", err)
		}
	}
	return nil
}

// Close closes all writers
func (mw *MultiWriter) Close() error {
	for _, writer := range mw.writers {
		if err := writer.Close(); err != nil {
			fmt.Printf("Failed to close log writer: %v\n", err)
		}
	}
	return nil
}

// AppLogger provides structured logging functionality
type AppLogger struct {
	level     LogLevel
	formatter LogFormatter
	writer    LogWriter
	mu        sync.RWMutex
	context   map[string]interface{}
}

// NewLogger creates a new logger
func NewLogger(level LogLevel, formatter LogFormatter, writer LogWriter) *AppLogger {
	return &AppLogger{
		level:     level,
		formatter: formatter,
		writer:    writer,
		context:   make(map[string]interface{}),
	}
}

// SetLevel sets the logging level
func (l *AppLogger) SetLevel(level LogLevel) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.level = level
}

// SetFormatter sets the log formatter
func (l *AppLogger) SetFormatter(formatter LogFormatter) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.formatter = formatter
}

// SetWriter sets the log writer
func (l *AppLogger) SetWriter(writer LogWriter) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.writer = writer
}

// WithContext returns a new logger with additional context
func (l *AppLogger) WithContext(context map[string]interface{}) *AppLogger {
	l.mu.RLock()
	defer l.mu.RUnlock()
	
	newContext := make(map[string]interface{})
	for k, v := range l.context {
		newContext[k] = v
	}
	for k, v := range context {
		newContext[k] = v
	}
	
	return &AppLogger{
		level:     l.level,
		formatter: l.formatter,
		writer:    l.writer,
		context:   newContext,
	}
}

// WithField returns a new logger with an additional field
func (l *AppLogger) WithField(key string, value interface{}) *AppLogger {
	return l.WithContext(map[string]interface{}{key: value})
}

// WithFields returns a new logger with additional fields
func (l *AppLogger) WithFields(fields map[string]interface{}) *AppLogger {
	return l.WithContext(fields)
}

// log writes a log entry
func (l *AppLogger) log(level LogLevel, msg string, err error, context map[string]interface{}) {
	l.mu.RLock()
	defer l.mu.RUnlock()
	
	// Check if we should log this level
	if level < l.level {
		return
	}
	
	// Merge context
	mergedContext := make(map[string]interface{})
	for k, v := range l.context {
		mergedContext[k] = v
	}
	for k, v := range context {
		mergedContext[k] = v
	}
	
	// Get caller info
	_, file, line, ok := runtime.Caller(3)
	if !ok {
		file = "unknown"
		line = 0
	}
	
	// Create log entry
	entry := &LogEntry{
		Timestamp: time.Now(),
		Level:     level,
		Message:   msg,
		Context:   mergedContext,
		Error:     err,
		File:      file,
		Line:      line,
	}
	
	// Write to writer
	if l.writer != nil {
		l.writer.Write(entry)
	}
}

// Debug logs a debug message
func (l *AppLogger) Debug(msg string, context map[string]interface{}) {
	l.log(LogLevelDebug, msg, nil, context)
}

// Info logs an info message
func (l *AppLogger) Info(msg string, context map[string]interface{}) {
	l.log(LogLevelInfo, msg, nil, context)
}

// Warn logs a warning message
func (l *AppLogger) Warn(msg string, context map[string]interface{}) {
	l.log(LogLevelWarn, msg, nil, context)
}

// Error logs an error message
func (l *AppLogger) Error(msg string, err error, context map[string]interface{}) {
	l.log(LogLevelError, msg, err, context)
}

// Fatal logs a fatal message and exits
func (l *AppLogger) Fatal(msg string, err error, context map[string]interface{}) {
	l.log(LogLevelFatal, msg, err, context)
	os.Exit(1)
}

// LogManager manages multiple loggers
type LogManager struct {
	loggers map[string]*AppLogger
	mu      sync.RWMutex
}

// NewLogManager creates a new log manager
func NewLogManager() *LogManager {
	return &LogManager{
		loggers: make(map[string]*AppLogger),
	}
}

// AddLogger adds a logger with a name
func (lm *LogManager) AddLogger(name string, logger *AppLogger) {
	lm.mu.Lock()
	defer lm.mu.Unlock()
	lm.loggers[name] = logger
}

// GetLogger returns a logger by name
func (lm *LogManager) GetLogger(name string) (*AppLogger, bool) {
	lm.mu.RLock()
	defer lm.mu.RUnlock()
	logger, exists := lm.loggers[name]
	return logger, exists
}

// GetDefaultLogger returns the default logger
func (lm *LogManager) GetDefaultLogger() *AppLogger {
	if logger, exists := lm.GetLogger("default"); exists {
		return logger
	}
	
	// Create default logger
	defaultLogger := NewLogger(
		LogLevelInfo,
		&TextFormatter{ShowCaller: true},
		NewConsoleWriter(),
	)
	
	lm.AddLogger("default", defaultLogger)
	return defaultLogger
}

// Close closes all loggers
func (lm *LogManager) Close() {
	lm.mu.Lock()
	defer lm.mu.Unlock()
	
	for _, logger := range lm.loggers {
		if logger.writer != nil {
			logger.writer.Close()
		}
	}
}

// LogConfig represents logging configuration
type LogConfig struct {
	Level      LogLevel `json:"level"`
	Format     string   `json:"format"` // "json" or "text"
	Output     string   `json:"output"` // "console", "file", or "both"
	FilePath   string   `json:"file_path,omitempty"`
	MaxSize    int64    `json:"max_size,omitempty"`
	ShowCaller bool     `json:"show_caller"`
}

// DefaultLogConfig returns the default logging configuration
func DefaultLogConfig() *LogConfig {
	return &LogConfig{
		Level:      LogLevelInfo,
		Format:     "text",
		Output:     "console",
		ShowCaller: true,
	}
}

// CreateLoggerFromConfig creates a logger from configuration
func CreateLoggerFromConfig(config *LogConfig) (*AppLogger, error) {
	// Create formatter
	var formatter LogFormatter
	switch config.Format {
	case "json":
		formatter = &JSONFormatter{}
	case "text":
		formatter = &TextFormatter{ShowCaller: config.ShowCaller}
	default:
		formatter = &TextFormatter{ShowCaller: config.ShowCaller}
	}
	
	// Create writer
	var writer LogWriter
	switch config.Output {
	case "console":
		writer = NewConsoleWriter()
	case "file":
		if config.FilePath == "" {
			return nil, fmt.Errorf("file path required for file output")
		}
		fileWriter, err := NewFileWriter(config.FilePath, config.MaxSize)
		if err != nil {
			return nil, err
		}
		writer = fileWriter
	case "both":
		writers := []LogWriter{NewConsoleWriter()}
		if config.FilePath != "" {
			fileWriter, err := NewFileWriter(config.FilePath, config.MaxSize)
			if err != nil {
				return nil, err
			}
			writers = append(writers, fileWriter)
		}
		writer = NewMultiWriter(writers...)
	default:
		writer = NewConsoleWriter()
	}
	
	return NewLogger(config.Level, formatter, writer), nil
}

// Logging utilities

// SetupDefaultLogging sets up default logging for the application
func SetupDefaultLogging(logDir string) (*LogManager, error) {
	// Create log directory
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create log directory: %w", err)
	}
	
	// Create log manager
	lm := NewLogManager()
	
	// Create application logger
	appLogPath := filepath.Join(logDir, "app.log")
	appLogger, err := CreateLoggerFromConfig(&LogConfig{
		Level:      LogLevelInfo,
		Format:     "json",
		Output:     "both",
		FilePath:   appLogPath,
		MaxSize:    10 * 1024 * 1024, // 10MB
		ShowCaller: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create app logger: %w", err)
	}
	lm.AddLogger("app", appLogger)
	
	// Create error logger
	errorLogPath := filepath.Join(logDir, "error.log")
	errorLogger, err := CreateLoggerFromConfig(&LogConfig{
		Level:      LogLevelError,
		Format:     "json",
		Output:     "both",
		FilePath:   errorLogPath,
		MaxSize:    5 * 1024 * 1024, // 5MB
		ShowCaller: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create error logger: %w", err)
	}
	lm.AddLogger("error", errorLogger)
	
	// Create debug logger
	debugLogPath := filepath.Join(logDir, "debug.log")
	debugLogger, err := CreateLoggerFromConfig(&LogConfig{
		Level:      LogLevelDebug,
		Format:     "json",
		Output:     "file",
		FilePath:   debugLogPath,
		MaxSize:    20 * 1024 * 1024, // 20MB
		ShowCaller: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create debug logger: %w", err)
	}
	lm.AddLogger("debug", debugLogger)
	
	return lm, nil
}

// LogMiddleware provides logging middleware for HTTP handlers
type LogMiddleware struct {
	logger *AppLogger
}

// NewLogMiddleware creates a new log middleware
func NewLogMiddleware(logger *AppLogger) *LogMiddleware {
	return &LogMiddleware{
		logger: logger,
	}
}

// LogRequest logs HTTP request details
func (lm *LogMiddleware) LogRequest(method, path, userAgent string, statusCode int, duration time.Duration) {
	lm.logger.Info("HTTP Request", map[string]interface{}{
		"method":      method,
		"path":        path,
		"user_agent":  userAgent,
		"status_code": statusCode,
		"duration_ms": duration.Milliseconds(),
	})
}

// LogError logs application errors
func (lm *LogMiddleware) LogError(operation string, err error, context map[string]interface{}) {
	lm.logger.Error(fmt.Sprintf("Error in %s", operation), err, context)
}

// LogPerformance logs performance metrics
func (lm *LogMiddleware) LogPerformance(operation string, duration time.Duration, metrics map[string]interface{}) {
	context := map[string]interface{}{
		"operation":    operation,
		"duration_ms":  duration.Milliseconds(),
	}
	for k, v := range metrics {
		context[k] = v
	}
	lm.logger.Info("Performance Metric", context)
}
