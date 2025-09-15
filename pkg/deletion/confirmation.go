package deletion

import (
	"fmt"
	"strings"
	"time"
)

// ConfirmationDialog represents a confirmation dialog for deletion operations
type ConfirmationDialog struct {
	Title       string                 `json:"title"`
	Message     string                 `json:"message"`
	Details     []string               `json:"details"`
	Warnings    []string               `json:"warnings"`
	FileCount   int                    `json:"file_count"`
	TotalSize   int64                  `json:"total_size"`
	Operation   string                 `json:"operation"`
	Metadata    map[string]interface{} `json:"metadata"`
	Timestamp   time.Time              `json:"timestamp"`
	ExpiresAt   time.Time              `json:"expires_at"`
}

// ConfirmationResult represents the result of a confirmation dialog
type ConfirmationResult struct {
	Confirmed    bool                   `json:"confirmed"`
	ForceDelete  bool                   `json:"force_delete"`
	DryRun       bool                   `json:"dry_run"`
	Reason       string                 `json:"reason,omitempty"`
	Timestamp    time.Time              `json:"timestamp"`
	UserID       string                 `json:"user_id,omitempty"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// ConfirmationService handles user confirmation dialogs for deletion operations
type ConfirmationService struct {
	dialogs map[string]*ConfirmationDialog
}

// NewConfirmationService creates a new confirmation service
func NewConfirmationService() *ConfirmationService {
	return &ConfirmationService{
		dialogs: make(map[string]*ConfirmationDialog),
	}
}

// CreateConfirmationDialog creates a confirmation dialog for a deletion operation
func (cs *ConfirmationService) CreateConfirmationDialog(
	operation string,
	files []string,
	totalSize int64,
	safetyResult *SafetyCheckResult,
	metadata map[string]interface{},
) *ConfirmationDialog {
	
	dialog := &ConfirmationDialog{
		Title:     cs.generateTitle(operation, len(files)),
		Message:   cs.generateMessage(operation, len(files), totalSize),
		Details:   cs.generateDetails(files, totalSize),
		Warnings:  safetyResult.Warnings,
		FileCount: len(files),
		TotalSize: totalSize,
		Operation: operation,
		Metadata:  metadata,
		Timestamp: time.Now(),
		ExpiresAt: time.Now().Add(5 * time.Minute), // Dialog expires in 5 minutes
	}
	
	// Add safety-specific warnings
	if len(safetyResult.RiskyFiles) > 0 {
		dialog.Warnings = append(dialog.Warnings, 
			fmt.Sprintf("⚠️ %d risky files detected that may cause system issues", len(safetyResult.RiskyFiles)))
	}
	
	if len(safetyResult.BlockedFiles) > 0 {
		dialog.Warnings = append(dialog.Warnings, 
			fmt.Sprintf("🚫 %d files blocked due to safety concerns", len(safetyResult.BlockedFiles)))
	}
	
	return dialog
}

// generateTitle generates a title for the confirmation dialog
func (cs *ConfirmationService) generateTitle(operation string, fileCount int) string {
	switch operation {
	case "cache_cleanup":
		return fmt.Sprintf("Clean Cache Files (%d files)", fileCount)
	case "manual_deletion":
		return fmt.Sprintf("Delete Selected Files (%d files)", fileCount)
	case "bulk_deletion":
		return fmt.Sprintf("Bulk Delete Files (%d files)", fileCount)
	case "system_cleanup":
		return fmt.Sprintf("System Cleanup (%d files)", fileCount)
	default:
		return fmt.Sprintf("Delete Files (%d files)", fileCount)
	}
}

// generateMessage generates the main message for the confirmation dialog
func (cs *ConfirmationService) generateMessage(operation string, fileCount int, totalSize int64) string {
	sizeStr := formatBytes(totalSize)
	
	baseMessage := fmt.Sprintf("You are about to delete %d files (%s).", fileCount, sizeStr)
	
	switch operation {
	case "cache_cleanup":
		return baseMessage + " This will clean up cache files to free up disk space. A backup will be created before deletion."
	case "manual_deletion":
		return baseMessage + " These files were manually selected for deletion. A backup will be created before deletion."
	case "bulk_deletion":
		return baseMessage + " This is a bulk deletion operation. A backup will be created before deletion."
	case "system_cleanup":
		return baseMessage + " This will clean up system files. A backup will be created before deletion."
	default:
		return baseMessage + " A backup will be created before deletion."
	}
}

// generateDetails generates detailed information for the confirmation dialog
func (cs *ConfirmationService) generateDetails(files []string, totalSize int64) []string {
	details := []string{
		fmt.Sprintf("Total files: %d", len(files)),
		fmt.Sprintf("Total size: %s", formatBytes(totalSize)),
		"",
		"Safety measures:",
		"• A backup will be created before deletion",
		"• Files can be restored from backup if needed",
		"• System critical files are protected",
		"",
		"Files to be deleted:",
	}
	
	// Add first 10 files as examples
	maxFiles := 10
	if len(files) > maxFiles {
		for i := 0; i < maxFiles; i++ {
			details = append(details, fmt.Sprintf("• %s", files[i]))
		}
		details = append(details, fmt.Sprintf("• ... and %d more files", len(files)-maxFiles))
	} else {
		for _, file := range files {
			details = append(details, fmt.Sprintf("• %s", file))
		}
	}
	
	return details
}

// CreateHighRiskConfirmationDialog creates a high-risk confirmation dialog
func (cs *ConfirmationService) CreateHighRiskConfirmationDialog(
	operation string,
	files []string,
	totalSize int64,
	riskyFiles []string,
	blockedFiles []string,
	metadata map[string]interface{},
) *ConfirmationDialog {
	
	dialog := cs.CreateConfirmationDialog(operation, files, totalSize, &SafetyCheckResult{
		RiskyFiles:   riskyFiles,
		BlockedFiles: blockedFiles,
		Warnings:     []string{},
	}, metadata)
	
	// Override title and message for high-risk operations
	dialog.Title = fmt.Sprintf("⚠️ HIGH RISK: %s (%d files)", strings.Title(operation), len(files))
	dialog.Message = fmt.Sprintf("WARNING: You are about to delete %d files (%s) that have been flagged as potentially risky or system-critical.", 
		len(files), formatBytes(totalSize))
	
	// Add high-risk warnings
	dialog.Warnings = append([]string{
		"🚨 HIGH RISK OPERATION",
		"⚠️ Some files may be system-critical or important",
		"🔒 This operation requires explicit confirmation",
		"💾 Backup will be created but restoration may not be possible",
	}, dialog.Warnings...)
	
	return dialog
}

// ValidateConfirmation validates a confirmation result
func (cs *ConfirmationService) ValidateConfirmation(
	dialogID string,
	result *ConfirmationResult,
) error {
	
	// Check if dialog exists
	dialog, exists := cs.dialogs[dialogID]
	if !exists {
		return fmt.Errorf("confirmation dialog not found")
	}
	
	// Check if dialog has expired
	if time.Now().After(dialog.ExpiresAt) {
		return fmt.Errorf("confirmation dialog has expired")
	}
	
	// Validate confirmation
	if !result.Confirmed {
		return fmt.Errorf("operation not confirmed")
	}
	
	// Additional validation for high-risk operations
	if len(dialog.Warnings) > 3 { // High-risk dialog
		if !result.ForceDelete {
			return fmt.Errorf("high-risk operation requires force delete confirmation")
		}
	}
	
	return nil
}

// StoreDialog stores a confirmation dialog
func (cs *ConfirmationService) StoreDialog(dialogID string, dialog *ConfirmationDialog) {
	cs.dialogs[dialogID] = dialog
}

// GetDialog retrieves a confirmation dialog
func (cs *ConfirmationService) GetDialog(dialogID string) (*ConfirmationDialog, error) {
	dialog, exists := cs.dialogs[dialogID]
	if !exists {
		return nil, fmt.Errorf("confirmation dialog not found")
	}
	
	// Check if expired
	if time.Now().After(dialog.ExpiresAt) {
		delete(cs.dialogs, dialogID)
		return nil, fmt.Errorf("confirmation dialog has expired")
	}
	
	return dialog, nil
}

// CleanupExpiredDialogs removes expired dialogs
func (cs *ConfirmationService) CleanupExpiredDialogs() {
	now := time.Now()
	for dialogID, dialog := range cs.dialogs {
		if now.After(dialog.ExpiresAt) {
			delete(cs.dialogs, dialogID)
		}
	}
}

// GetDialogStats returns statistics about confirmation dialogs
func (cs *ConfirmationService) GetDialogStats() map[string]interface{} {
	now := time.Now()
	active := 0
	expired := 0
	
	for _, dialog := range cs.dialogs {
		if now.After(dialog.ExpiresAt) {
			expired++
		} else {
			active++
		}
	}
	
	return map[string]interface{}{
		"total_dialogs": len(cs.dialogs),
		"active_dialogs": active,
		"expired_dialogs": expired,
	}
}

// formatBytes formats bytes into human-readable format
func formatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}
