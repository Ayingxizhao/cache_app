# Error Handling and User Feedback System

This document describes the comprehensive error handling and user feedback system implemented for the Cache App.

## Overview

The error handling system provides:
- **Unified error handling** with structured error types and severity levels
- **User notification system** with toast notifications and progress indicators
- **Loading states** for all long-running operations
- **Error recovery mechanisms** with retry and fallback options
- **Comprehensive logging** with structured log entries
- **Error boundaries** for JavaScript error handling

## Architecture

### Backend Components (`internal/ui/`)

#### 1. Error Handling (`errors.go`)
- **AppError**: Structured error type with context, severity, and recovery options
- **ErrorBuilder**: Fluent interface for building errors
- **ErrorHandler**: Centralized error processing and logging
- **ErrorRecovery**: Retry mechanisms with exponential backoff
- **ErrorCollector**: Error aggregation and summary

#### 2. Notifications (`notifications.go`)
- **NotificationManager**: Manages user notifications
- **Notification**: Structured notification with actions and progress
- **NotificationBuilder**: Fluent interface for building notifications

#### 3. Logging (`logging.go`)
- **Logger**: Structured logging with multiple levels
- **LogManager**: Manages multiple loggers
- **LogFormatter**: JSON and text formatters
- **LogWriter**: File and console writers

### Frontend Components (`web/src/components/`)

#### 1. Notification System (`notifications.js`)
- Toast notifications with different types (success, info, warning, error)
- Progress notifications with real-time updates
- Action buttons and callbacks
- Auto-dismiss and persistent options

#### 2. Loading System (`loading.js`)
- Loading overlays with progress bars
- Inline loading states
- Button loading states
- Skeleton loading animations

#### 3. Error Boundary (`error-boundary.js`)
- JavaScript error catching and handling
- Error recovery mechanisms
- Inline error display
- Function wrapping for error handling

#### 4. Error Integration (`error-integration.js`)
- Integration with Wails app methods
- Automatic error handling for API calls
- Progress tracking for long operations
- Error recovery suggestions

## Usage Examples

### Backend Error Handling

```go
// Create a structured error
err := ui.NewErrorBuilder().
    Type(ui.ErrorTypeValidation).
    Severity(ui.ErrorSeverityMedium).
    Code("INVALID_INPUT").
    Message("Invalid file path provided").
    UserMessage("Please check the file path and try again").
    Suggestions("Verify the path exists", "Check file permissions").
    Build()

// Handle error with context
appErr := errorHandler.HandleError(err, map[string]interface{}{
    "operation": "scan_location",
    "location_id": locationID,
    "user_input": path,
})
```

### Frontend Notifications

```javascript
// Show success notification
showSuccess('Operation Complete', 'Files backed up successfully');

// Show error notification with actions
showError('Backup Failed', 'Unable to create backup', {
    actions: [
        { id: 'retry', label: 'Try Again', style: 'primary' },
        { id: 'dismiss', label: 'Dismiss', style: 'secondary' }
    ]
});

// Show progress notification
const progressId = showProgress('Backing Up Files', 'Creating backup...', 100);
updateProgress(progressId, 50, 'Halfway done...');
completeProgress(progressId, 'Backup completed!');
```

### Loading States

```javascript
// Show loading overlay
const loadingId = showLoading({
    title: 'Processing Files',
    message: 'Please wait...',
    cancellable: true
});

// Update loading progress
updateProgress(loadingId, 75, 'Almost done...');

// Hide loading
hideLoading(loadingId);

// Button loading state
setButtonLoading(buttonElement, true); // Show loading
setButtonLoading(buttonElement, false); // Hide loading
```

### Error Boundaries

```javascript
// Wrap functions with error handling
const safeFunction = wrapFunction(riskyFunction, {
    operation: 'data_processing',
    component: 'cache_scanner'
});

// Wrap async functions
const safeAsyncFunction = wrapAsyncFunction(asyncRiskyFunction, {
    operation: 'file_upload',
    component: 'backup_system'
});

// Show inline error
showInlineError(containerElement, error, {
    message: 'Failed to load data',
    showDetails: true
});
```

## Error Types

### Backend Error Types
- `validation`: Input validation errors
- `io`: File system and I/O errors
- `permission`: Permission denied errors
- `network`: Network connectivity errors
- `timeout`: Operation timeout errors
- `not_found`: Resource not found errors
- `conflict`: Resource conflict errors
- `internal`: Internal application errors
- `user`: User action errors
- `system`: System-level errors
- `backup`: Backup operation errors
- `deletion`: File deletion errors
- `scan`: Cache scanning errors
- `safety`: Safety validation errors

### Error Severity Levels
- `low`: Minor issues, non-critical
- `medium`: Moderate issues, may affect functionality
- `high`: Serious issues, affects core functionality
- `critical`: Critical issues, may cause data loss

## Notification Types

### Notification Types
- `success`: Successful operations
- `info`: Informational messages
- `warning`: Warning messages
- `error`: Error messages
- `progress`: Progress indicators

### Notification Priority
- `low`: Low priority notifications
- `medium`: Medium priority notifications
- `high`: High priority notifications
- `urgent`: Urgent notifications

## Logging Levels

### Log Levels
- `debug`: Detailed debugging information
- `info`: General information
- `warn`: Warning messages
- `error`: Error messages
- `fatal`: Fatal errors (causes application exit)

### Log Outputs
- `console`: Console output
- `file`: File output with rotation
- `both`: Both console and file output

## Configuration

### Logging Configuration

```go
config := &ui.LogConfig{
    Level:      ui.LogLevelInfo,
    Format:     "json",
    Output:     "both",
    FilePath:   "./logs/app.log",
    MaxSize:    10 * 1024 * 1024, // 10MB
    ShowCaller: true,
}
```

### Error Recovery Configuration

```go
recovery := ui.NewErrorRecovery(3, time.Second) // 3 retries, 1s delay
```

## Integration with Cache Operations

The error handling system is integrated with all cache operations:

### Scan Operations
- Progress tracking during cache scanning
- Error handling for permission issues
- Recovery suggestions for failed scans

### Backup Operations
- Progress indicators for backup creation
- Error handling for disk space issues
- Recovery options for failed backups

### Deletion Operations
- Confirmation dialogs with error context
- Progress tracking for safe deletion
- Recovery mechanisms for deletion failures

### Restore Operations
- Progress indicators for file restoration
- Error handling for restore conflicts
- Recovery options for failed restores

## Best Practices

### Error Handling
1. **Always provide user-friendly messages** alongside technical details
2. **Include recovery suggestions** when possible
3. **Log errors with sufficient context** for debugging
4. **Use appropriate error types and severity levels**
5. **Implement retry mechanisms** for transient errors

### Notifications
1. **Use appropriate notification types** for different scenarios
2. **Provide clear, actionable messages**
3. **Include action buttons** for user interaction
4. **Set appropriate durations** for auto-dismiss
5. **Use persistent notifications** for critical errors

### Loading States
1. **Show loading indicators** for operations > 1 second
2. **Provide progress updates** for long operations
3. **Allow cancellation** when appropriate
4. **Use skeleton loading** for content loading
5. **Provide estimated completion times** when possible

### Logging
1. **Use structured logging** with consistent fields
2. **Include relevant context** in log entries
3. **Set appropriate log levels** for different scenarios
4. **Implement log rotation** to prevent disk space issues
5. **Use different loggers** for different components

## Testing

### Error Handling Tests
- Test error creation and formatting
- Test error recovery mechanisms
- Test error aggregation and summary
- Test error logging and persistence

### Notification Tests
- Test notification display and dismissal
- Test notification actions and callbacks
- Test notification persistence and auto-dismiss
- Test notification priority and ordering

### Loading Tests
- Test loading state display and hiding
- Test progress updates and completion
- Test loading cancellation
- Test loading state persistence

### Integration Tests
- Test error handling in cache operations
- Test notification integration with operations
- Test loading state integration
- Test error recovery in real scenarios

## Monitoring and Analytics

### Error Metrics
- Error count by type and severity
- Error frequency and trends
- Recovery success rates
- User interaction with error dialogs

### Performance Metrics
- Operation completion times
- Loading state durations
- Notification display times
- Error handling overhead

### User Experience Metrics
- Notification interaction rates
- Error recovery success rates
- User satisfaction with error messages
- Time to resolution for errors

## Troubleshooting

### Common Issues

#### Notifications Not Showing
- Check if notification system is initialized
- Verify notification container exists in DOM
- Check for CSS conflicts
- Verify notification permissions

#### Loading States Not Updating
- Check if loading manager is initialized
- Verify progress tracking is working
- Check for JavaScript errors
- Verify DOM element references

#### Errors Not Being Caught
- Check if error boundary is set up
- Verify error handlers are registered
- Check for async error handling
- Verify error logging is working

#### Logs Not Being Written
- Check log directory permissions
- Verify log configuration
- Check disk space availability
- Verify log rotation settings

### Debug Mode

Enable debug mode for detailed error information:

```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Enable error boundary debug mode
errorBoundary.options.logErrors = true;
errorBoundary.options.showErrorUI = true;
```

## Future Enhancements

### Planned Features
- **Error analytics dashboard** for monitoring error trends
- **Automated error reporting** to external services
- **User feedback collection** for error messages
- **Error prediction** based on patterns
- **Automated recovery** for common errors

### Performance Improvements
- **Lazy loading** of error handling components
- **Error caching** for repeated errors
- **Batch error processing** for high-volume scenarios
- **Optimized logging** with async writes

### User Experience Improvements
- **Customizable notification styles**
- **Accessibility improvements** for error dialogs
- **Multi-language support** for error messages
- **Contextual help** integration with errors

## Conclusion

The error handling and user feedback system provides a comprehensive solution for managing errors and providing user feedback throughout the Cache App. It ensures a smooth user experience while providing developers with the tools needed to diagnose and resolve issues effectively.

The system is designed to be:
- **Robust**: Handles all types of errors gracefully
- **User-friendly**: Provides clear feedback and recovery options
- **Developer-friendly**: Offers detailed logging and debugging information
- **Extensible**: Easy to add new error types and handling mechanisms
- **Maintainable**: Well-structured code with clear separation of concerns

For more information, see the demo page at `web/src/error-handling-demo.html` and the integration examples in `web/src/components/error-integration.js`.
