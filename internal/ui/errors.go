package ui

import (
	"encoding/json"
	"fmt"
	"runtime"
	"sync"
	"time"
)

// ErrorType represents the type of error
type ErrorType string

const (
	ErrorTypeValidation   ErrorType = "validation"
	ErrorTypeIO           ErrorType = "io"
	ErrorTypePermission   ErrorType = "permission"
	ErrorTypeNetwork      ErrorType = "network"
	ErrorTypeTimeout      ErrorType = "timeout"
	ErrorTypeNotFound     ErrorType = "not_found"
	ErrorTypeConflict     ErrorType = "conflict"
	ErrorTypeInternal     ErrorType = "internal"
	ErrorTypeUser         ErrorType = "user"
	ErrorTypeSystem       ErrorType = "system"
	ErrorTypeBackup       ErrorType = "backup"
	ErrorTypeDeletion     ErrorType = "deletion"
	ErrorTypeScan         ErrorType = "scan"
	ErrorTypeSafety       ErrorType = "safety"
)

// ErrorSeverity represents the severity level of an error
type ErrorSeverity string

const (
	ErrorSeverityLow      ErrorSeverity = "low"
	ErrorSeverityMedium   ErrorSeverity = "medium"
	ErrorSeverityHigh     ErrorSeverity = "high"
	ErrorSeverityCritical ErrorSeverity = "critical"
)

// ErrorContext provides additional context about where an error occurred
type ErrorContext struct {
	Operation    string            `json:"operation"`
	Component    string            `json:"component"`
	UserAction   string            `json:"user_action,omitempty"`
	File         string            `json:"file,omitempty"`
	Line         int               `json:"line,omitempty"`
	Function     string            `json:"function,omitempty"`
	Metadata     map[string]string `json:"metadata,omitempty"`
	Timestamp    time.Time         `json:"timestamp"`
	StackTrace   string            `json:"stack_trace,omitempty"`
}

// AppError represents a structured application error
type AppError struct {
	Type        ErrorType     `json:"type"`
	Severity    ErrorSeverity `json:"severity"`
	Code        string        `json:"code"`
	Message     string        `json:"message"`
	Details     string        `json:"details,omitempty"`
	Context     ErrorContext  `json:"context"`
	Recoverable bool          `json:"recoverable"`
	Retryable   bool          `json:"retryable"`
	UserMessage string        `json:"user_message"`
	Suggestions []string      `json:"suggestions,omitempty"`
	OriginalErr error         `json:"-"`
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.OriginalErr != nil {
		return fmt.Sprintf("[%s] %s: %s (original: %v)", e.Type, e.Code, e.Message, e.OriginalErr)
	}
	return fmt.Sprintf("[%s] %s: %s", e.Type, e.Code, e.Message)
}

// ToJSON converts the error to JSON
func (e *AppError) ToJSON() (string, error) {
	data, err := json.Marshal(e)
	if err != nil {
		return "", fmt.Errorf("failed to marshal error to JSON: %w", err)
	}
	return string(data), nil
}

// ErrorBuilder provides a fluent interface for building errors
type ErrorBuilder struct {
	err *AppError
}

// NewErrorBuilder creates a new error builder
func NewErrorBuilder() *ErrorBuilder {
	return &ErrorBuilder{
		err: &AppError{
			Context: ErrorContext{
				Timestamp: time.Now(),
			},
			Recoverable: true,
			Retryable:   false,
		},
	}
}

// Type sets the error type
func (eb *ErrorBuilder) Type(errorType ErrorType) *ErrorBuilder {
	eb.err.Type = errorType
	return eb
}

// Severity sets the error severity
func (eb *ErrorBuilder) Severity(severity ErrorSeverity) *ErrorBuilder {
	eb.err.Severity = severity
	return eb
}

// Code sets the error code
func (eb *ErrorBuilder) Code(code string) *ErrorBuilder {
	eb.err.Code = code
	return eb
}

// Message sets the error message
func (eb *ErrorBuilder) Message(message string) *ErrorBuilder {
	eb.err.Message = message
	return eb
}

// Details sets additional error details
func (eb *ErrorBuilder) Details(details string) *ErrorBuilder {
	eb.err.Details = details
	return eb
}

// Operation sets the operation context
func (eb *ErrorBuilder) Operation(operation string) *ErrorBuilder {
	eb.err.Context.Operation = operation
	return eb
}

// Component sets the component context
func (eb *ErrorBuilder) Component(component string) *ErrorBuilder {
	eb.err.Context.Component = component
	return eb
}

// UserAction sets the user action context
func (eb *ErrorBuilder) UserAction(action string) *ErrorBuilder {
	eb.err.Context.UserAction = action
	return eb
}

// File sets the file context
func (eb *ErrorBuilder) File(file string) *ErrorBuilder {
	eb.err.Context.File = file
	return eb
}

// Metadata adds metadata to the error context
func (eb *ErrorBuilder) Metadata(key, value string) *ErrorBuilder {
	if eb.err.Context.Metadata == nil {
		eb.err.Context.Metadata = make(map[string]string)
	}
	eb.err.Context.Metadata[key] = value
	return eb
}

// Recoverable sets whether the error is recoverable
func (eb *ErrorBuilder) Recoverable(recoverable bool) *ErrorBuilder {
	eb.err.Recoverable = recoverable
	return eb
}

// Retryable sets whether the error is retryable
func (eb *ErrorBuilder) Retryable(retryable bool) *ErrorBuilder {
	eb.err.Retryable = retryable
	return eb
}

// UserMessage sets the user-friendly message
func (eb *ErrorBuilder) UserMessage(message string) *ErrorBuilder {
	eb.err.UserMessage = message
	return eb
}

// Suggestions adds suggestions for resolving the error
func (eb *ErrorBuilder) Suggestions(suggestions ...string) *ErrorBuilder {
	eb.err.Suggestions = append(eb.err.Suggestions, suggestions...)
	return eb
}

// OriginalError sets the original error
func (eb *ErrorBuilder) OriginalError(err error) *ErrorBuilder {
	eb.err.OriginalErr = err
	return eb
}

// Build constructs the final error
func (eb *ErrorBuilder) Build() *AppError {
	// Capture stack trace if not already set
	if eb.err.Context.StackTrace == "" {
		eb.err.Context.StackTrace = captureStackTrace()
	}
	
	// Set default user message if not provided
	if eb.err.UserMessage == "" {
		eb.err.UserMessage = eb.err.Message
	}
	
	return eb.err
}

// captureStackTrace captures the current stack trace
func captureStackTrace() string {
	buf := make([]byte, 1024)
	n := runtime.Stack(buf, false)
	return string(buf[:n])
}

// Predefined error builders for common error types

// ValidationError creates a validation error
func ValidationError(message string) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeValidation).
		Severity(ErrorSeverityMedium).
		Code("VALIDATION_ERROR").
		Message(message).
		UserMessage("Please check your input and try again").
		Suggestions("Verify the input format", "Check required fields").
		Build()
}

// IOError creates an I/O error
func IOError(message string, originalErr error) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeIO).
		Severity(ErrorSeverityHigh).
		Code("IO_ERROR").
		Message(message).
		OriginalError(originalErr).
		UserMessage("Unable to access file or directory").
		Suggestions("Check file permissions", "Verify file exists", "Ensure sufficient disk space").
		Retryable(true).
		Build()
}

// PermissionError creates a permission error
func PermissionError(message string, originalErr error) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypePermission).
		Severity(ErrorSeverityHigh).
		Code("PERMISSION_ERROR").
		Message(message).
		OriginalError(originalErr).
		UserMessage("Permission denied").
		Suggestions("Run as administrator", "Check file permissions", "Contact system administrator").
		Build()
}

// NotFoundError creates a not found error
func NotFoundError(resource string) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeNotFound).
		Severity(ErrorSeverityMedium).
		Code("NOT_FOUND_ERROR").
		Message(fmt.Sprintf("%s not found", resource)).
		UserMessage(fmt.Sprintf("The requested %s could not be found", resource)).
		Suggestions("Verify the resource exists", "Check the path", "Refresh the data").
		Build()
}

// ScanError creates a scan-related error
func ScanError(message string, originalErr error) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeScan).
		Severity(ErrorSeverityMedium).
		Code("SCAN_ERROR").
		Message(message).
		OriginalError(originalErr).
		UserMessage("Scan operation failed").
		Suggestions("Check directory permissions", "Verify paths exist", "Try scanning individual locations").
		Retryable(true).
		Build()
}

// BackupError creates a backup-related error
func BackupError(message string, originalErr error) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeBackup).
		Severity(ErrorSeverityHigh).
		Code("BACKUP_ERROR").
		Message(message).
		OriginalError(originalErr).
		UserMessage("Backup operation failed").
		Suggestions("Check disk space", "Verify backup location", "Try again later").
		Retryable(true).
		Build()
}

// DeletionError creates a deletion-related error
func DeletionError(message string, originalErr error) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeDeletion).
		Severity(ErrorSeverityCritical).
		Code("DELETION_ERROR").
		Message(message).
		OriginalError(originalErr).
		UserMessage("File deletion failed").
		Suggestions("Check file permissions", "Verify files are not in use", "Try running as administrator").
		Retryable(true).
		Build()
}

// SafetyError creates a safety-related error
func SafetyError(message string, originalErr error) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeSafety).
		Severity(ErrorSeverityHigh).
		Code("SAFETY_ERROR").
		Message(message).
		OriginalError(originalErr).
		UserMessage("Safety validation failed").
		Suggestions("Review file classifications", "Check safety settings", "Verify file permissions").
		Build()
}

// InternalError creates an internal error
func InternalError(message string, originalErr error) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeInternal).
		Severity(ErrorSeverityCritical).
		Code("INTERNAL_ERROR").
		Message(message).
		OriginalError(originalErr).
		UserMessage("An internal error occurred").
		Suggestions("Restart the application", "Check system resources", "Contact support").
		Recoverable(false).
		Build()
}

// TimeoutError creates a timeout error
func TimeoutError(operation string, timeout time.Duration) *AppError {
	return NewErrorBuilder().
		Type(ErrorTypeTimeout).
		Severity(ErrorSeverityMedium).
		Code("TIMEOUT_ERROR").
		Message(fmt.Sprintf("Operation '%s' timed out after %v", operation, timeout)).
		UserMessage("Operation took too long to complete").
		Suggestions("Try again", "Check system performance", "Increase timeout if possible").
		Retryable(true).
		Build()
}

// WrapError wraps an existing error with additional context
func WrapError(err error, errorType ErrorType, message string) *AppError {
	if err == nil {
		return nil
	}
	
	// If it's already an AppError, add context to it
	if appErr, ok := err.(*AppError); ok {
		if message != "" {
			appErr.Message = fmt.Sprintf("%s: %s", message, appErr.Message)
		}
		return appErr
	}
	
	// Create new AppError wrapping the original
	return NewErrorBuilder().
		Type(errorType).
		Severity(ErrorSeverityMedium).
		Code("WRAPPED_ERROR").
		Message(message).
		OriginalError(err).
		UserMessage("An error occurred").
		Retryable(true).
		Build()
}

// ErrorRecovery provides mechanisms for error recovery
type ErrorRecovery struct {
	MaxRetries    int
	RetryDelay    time.Duration
	BackoffFactor float64
}

// NewErrorRecovery creates a new error recovery instance
func NewErrorRecovery(maxRetries int, retryDelay time.Duration) *ErrorRecovery {
	return &ErrorRecovery{
		MaxRetries:    maxRetries,
		RetryDelay:    retryDelay,
		BackoffFactor: 2.0,
	}
}

// RetryWithBackoff executes a function with exponential backoff retry
func (er *ErrorRecovery) RetryWithBackoff(operation func() error) error {
	var lastErr error
	delay := er.RetryDelay
	
	for attempt := 0; attempt <= er.MaxRetries; attempt++ {
		if attempt > 0 {
			time.Sleep(delay)
			delay = time.Duration(float64(delay) * er.BackoffFactor)
		}
		
		err := operation()
		if err == nil {
			return nil
		}
		
		lastErr = err
		
		// Check if error is retryable
		if appErr, ok := err.(*AppError); ok && !appErr.Retryable {
			return err
		}
	}
	
	return WrapError(lastErr, ErrorTypeInternal, fmt.Sprintf("operation failed after %d retries", er.MaxRetries))
}

// ErrorHandler provides centralized error handling
type ErrorHandler struct {
	logger    ErrorLogger
	recovery  *ErrorRecovery
	callbacks []ErrorCallback
}

// ErrorCallback defines a function that handles errors
type ErrorCallback func(*AppError)

// ErrorLogger interface for error logging
type ErrorLogger interface {
	Error(msg string, err error, context map[string]interface{})
	Warn(msg string, context map[string]interface{})
	Info(msg string, context map[string]interface{})
	Debug(msg string, context map[string]interface{})
}

// NewErrorHandler creates a new error handler
func NewErrorHandler(logger ErrorLogger) *ErrorHandler {
	return &ErrorHandler{
		logger:   logger,
		recovery: NewErrorRecovery(3, time.Second),
		callbacks: make([]ErrorCallback, 0),
	}
}

// AddCallback adds an error callback
func (eh *ErrorHandler) AddCallback(callback ErrorCallback) {
	eh.callbacks = append(eh.callbacks, callback)
}

// HandleError processes an error through the error handling pipeline
func (eh *ErrorHandler) HandleError(err error, context map[string]interface{}) *AppError {
	var appErr *AppError
	
	if err == nil {
		return nil
	}
	
	// Convert to AppError if needed
	if appErr, ok := err.(*AppError); ok {
		appErr = appErr
	} else {
		appErr = WrapError(err, ErrorTypeInternal, "unhandled error")
	}
	
	// Add context metadata
	if appErr.Context.Metadata == nil {
		appErr.Context.Metadata = make(map[string]string)
	}
	for k, v := range context {
		appErr.Context.Metadata[k] = fmt.Sprintf("%v", v)
	}
	
	// Log the error
	eh.logger.Error(appErr.Message, appErr.OriginalErr, map[string]interface{}{
		"type":        appErr.Type,
		"severity":    appErr.Severity,
		"code":        appErr.Code,
		"operation":   appErr.Context.Operation,
		"component":   appErr.Context.Component,
		"recoverable": appErr.Recoverable,
		"retryable":   appErr.Retryable,
	})
	
	// Execute callbacks
	for _, callback := range eh.callbacks {
		callback(appErr)
	}
	
	return appErr
}

// SafeExecute executes a function with error handling
func (eh *ErrorHandler) SafeExecute(operation func() error, context map[string]interface{}) error {
	return eh.recovery.RetryWithBackoff(func() error {
		err := operation()
		if err != nil {
			return eh.HandleError(err, context)
		}
		return nil
	})
}

// ErrorSummary provides a summary of errors
type ErrorSummary struct {
	TotalErrors    int                    `json:"total_errors"`
	ErrorsByType   map[ErrorType]int      `json:"errors_by_type"`
	ErrorsBySeverity map[ErrorSeverity]int `json:"errors_by_severity"`
	RecentErrors   []*AppError           `json:"recent_errors"`
	LastError      *AppError              `json:"last_error,omitempty"`
}

// ErrorCollector collects and summarizes errors
type ErrorCollector struct {
	errors []*AppError
	mu     sync.RWMutex
}

// NewErrorCollector creates a new error collector
func NewErrorCollector() *ErrorCollector {
	return &ErrorCollector{
		errors: make([]*AppError, 0),
	}
}

// AddError adds an error to the collector
func (ec *ErrorCollector) AddError(err *AppError) {
	ec.mu.Lock()
	defer ec.mu.Unlock()
	
	ec.errors = append(ec.errors, err)
	
	// Keep only the last 100 errors to prevent memory issues
	if len(ec.errors) > 100 {
		ec.errors = ec.errors[len(ec.errors)-100:]
	}
}

// GetSummary returns an error summary
func (ec *ErrorCollector) GetSummary() *ErrorSummary {
	ec.mu.RLock()
	defer ec.mu.RUnlock()
	
	summary := &ErrorSummary{
		TotalErrors:      len(ec.errors),
		ErrorsByType:     make(map[ErrorType]int),
		ErrorsBySeverity: make(map[ErrorSeverity]int),
		RecentErrors:     make([]*AppError, 0),
	}
	
	// Count errors by type and severity
	for _, err := range ec.errors {
		summary.ErrorsByType[err.Type]++
		summary.ErrorsBySeverity[err.Severity]++
	}
	
	// Get recent errors (last 10)
	start := len(ec.errors) - 10
	if start < 0 {
		start = 0
	}
	summary.RecentErrors = ec.errors[start:]
	
	// Set last error
	if len(ec.errors) > 0 {
		summary.LastError = ec.errors[len(ec.errors)-1]
	}
	
	return summary
}

// Clear clears all collected errors
func (ec *ErrorCollector) Clear() {
	ec.mu.Lock()
	defer ec.mu.Unlock()
	ec.errors = ec.errors[:0]
}
