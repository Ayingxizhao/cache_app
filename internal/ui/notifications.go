package ui

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeSuccess NotificationType = "success"
	NotificationTypeInfo    NotificationType = "info"
	NotificationTypeWarning NotificationType = "warning"
	NotificationTypeError   NotificationType = "error"
	NotificationTypeProgress NotificationType = "progress"
)

// NotificationPriority represents the priority of a notification
type NotificationPriority string

const (
	NotificationPriorityLow    NotificationPriority = "low"
	NotificationPriorityMedium NotificationPriority = "medium"
	NotificationPriorityHigh   NotificationPriority = "high"
	NotificationPriorityUrgent NotificationPriority = "urgent"
)

// Notification represents a user notification
type Notification struct {
	ID          string                `json:"id"`
	Type        NotificationType      `json:"type"`
	Priority    NotificationPriority  `json:"priority"`
	Title       string                `json:"title"`
	Message     string                `json:"message"`
	Details     string                `json:"details,omitempty"`
	Timestamp   time.Time             `json:"timestamp"`
	Duration    time.Duration         `json:"duration"`
	Persistent  bool                  `json:"persistent"`
	Actions     []NotificationAction  `json:"actions,omitempty"`
	Progress    *NotificationProgress `json:"progress,omitempty"`
	Metadata    map[string]string     `json:"metadata,omitempty"`
	Read        bool                  `json:"read"`
	Dismissed   bool                  `json:"dismissed"`
}

// NotificationAction represents an action that can be taken on a notification
type NotificationAction struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Style    string `json:"style"` // "primary", "secondary", "danger", "success"
	Callback string `json:"callback,omitempty"`
}

// NotificationProgress represents progress information for a notification
type NotificationProgress struct {
	Current   int    `json:"current"`
	Total     int    `json:"total"`
	Percent   float64 `json:"percent"`
	Status    string  `json:"status"`
	Estimated time.Duration `json:"estimated,omitempty"`
}

// NotificationManager manages user notifications
type NotificationManager struct {
	notifications map[string]*Notification
	subscribers   []NotificationSubscriber
	mu            sync.RWMutex
	logger        ErrorLogger
}

// NotificationSubscriber defines the interface for notification subscribers
type NotificationSubscriber interface {
	OnNotification(notification *Notification)
	OnNotificationUpdate(notification *Notification)
	OnNotificationDismissed(notificationID string)
}

// NewNotificationManager creates a new notification manager
func NewNotificationManager(logger ErrorLogger) *NotificationManager {
	return &NotificationManager{
		notifications: make(map[string]*Notification),
		subscribers:   make([]NotificationSubscriber, 0),
		logger:        logger,
	}
}

// Subscribe adds a notification subscriber
func (nm *NotificationManager) Subscribe(subscriber NotificationSubscriber) {
	nm.mu.Lock()
	defer nm.mu.Unlock()
	nm.subscribers = append(nm.subscribers, subscriber)
}

// Unsubscribe removes a notification subscriber
func (nm *NotificationManager) Unsubscribe(subscriber NotificationSubscriber) {
	nm.mu.Lock()
	defer nm.mu.Unlock()
	
	for i, sub := range nm.subscribers {
		if sub == subscriber {
			nm.subscribers = append(nm.subscribers[:i], nm.subscribers[i+1:]...)
			break
		}
	}
}

// ShowNotification displays a notification to the user
func (nm *NotificationManager) ShowNotification(notification *Notification) {
	nm.mu.Lock()
	defer nm.mu.Unlock()
	
	// Generate ID if not provided
	if notification.ID == "" {
		notification.ID = fmt.Sprintf("notif_%d", time.Now().UnixNano())
	}
	
	// Set timestamp if not provided
	if notification.Timestamp.IsZero() {
		notification.Timestamp = time.Now()
	}
	
	// Set default duration if not provided
	if notification.Duration == 0 {
		switch notification.Type {
		case NotificationTypeSuccess:
			notification.Duration = 3 * time.Second
		case NotificationTypeInfo:
			notification.Duration = 5 * time.Second
		case NotificationTypeWarning:
			notification.Duration = 7 * time.Second
		case NotificationTypeError:
			notification.Duration = 10 * time.Second
		case NotificationTypeProgress:
			notification.Duration = 0 // Persistent until completed
			notification.Persistent = true
		}
	}
	
	// Store notification
	nm.notifications[notification.ID] = notification
	
	// Log notification
	nm.logger.Info("Notification shown", map[string]interface{}{
		"id":       notification.ID,
		"type":     notification.Type,
		"priority": notification.Priority,
		"title":    notification.Title,
	})
	
	// Notify subscribers
	for _, subscriber := range nm.subscribers {
		go subscriber.OnNotification(notification)
	}
	
	// Auto-dismiss if not persistent
	if !notification.Persistent && notification.Duration > 0 {
		go nm.autoDismiss(notification.ID, notification.Duration)
	}
}

// UpdateNotification updates an existing notification
func (nm *NotificationManager) UpdateNotification(notificationID string, updates map[string]interface{}) error {
	nm.mu.Lock()
	defer nm.mu.Unlock()
	
	notification, exists := nm.notifications[notificationID]
	if !exists {
		return fmt.Errorf("notification %s not found", notificationID)
	}
	
	// Apply updates
	for key, value := range updates {
		switch key {
		case "title":
			if str, ok := value.(string); ok {
				notification.Title = str
			}
		case "message":
			if str, ok := value.(string); ok {
				notification.Message = str
			}
		case "details":
			if str, ok := value.(string); ok {
				notification.Details = str
			}
		case "progress":
			if progress, ok := value.(*NotificationProgress); ok {
				notification.Progress = progress
			}
		case "persistent":
			if persistent, ok := value.(bool); ok {
				notification.Persistent = persistent
			}
		}
	}
	
	// Notify subscribers of update
	for _, subscriber := range nm.subscribers {
		go subscriber.OnNotificationUpdate(notification)
	}
	
	return nil
}

// DismissNotification dismisses a notification
func (nm *NotificationManager) DismissNotification(notificationID string) error {
	nm.mu.Lock()
	defer nm.mu.Unlock()
	
	notification, exists := nm.notifications[notificationID]
	if !exists {
		return fmt.Errorf("notification %s not found", notificationID)
	}
	
	notification.Dismissed = true
	
	// Notify subscribers
	for _, subscriber := range nm.subscribers {
		go subscriber.OnNotificationDismissed(notificationID)
	}
	
	// Remove from active notifications after a delay
	go func() {
		time.Sleep(1 * time.Second)
		nm.mu.Lock()
		delete(nm.notifications, notificationID)
		nm.mu.Unlock()
	}()
	
	return nil
}

// GetNotification returns a notification by ID
func (nm *NotificationManager) GetNotification(notificationID string) (*Notification, error) {
	nm.mu.RLock()
	defer nm.mu.RUnlock()
	
	notification, exists := nm.notifications[notificationID]
	if !exists {
		return nil, fmt.Errorf("notification %s not found", notificationID)
	}
	
	return notification, nil
}

// GetAllNotifications returns all active notifications
func (nm *NotificationManager) GetAllNotifications() []*Notification {
	nm.mu.RLock()
	defer nm.mu.RUnlock()
	
	notifications := make([]*Notification, 0, len(nm.notifications))
	for _, notification := range nm.notifications {
		if !notification.Dismissed {
			notifications = append(notifications, notification)
		}
	}
	
	return notifications
}

// GetNotificationsByType returns notifications filtered by type
func (nm *NotificationManager) GetNotificationsByType(notificationType NotificationType) []*Notification {
	nm.mu.RLock()
	defer nm.mu.RUnlock()
	
	notifications := make([]*Notification, 0)
	for _, notification := range nm.notifications {
		if !notification.Dismissed && notification.Type == notificationType {
			notifications = append(notifications, notification)
		}
	}
	
	return notifications
}

// ClearAllNotifications dismisses all notifications
func (nm *NotificationManager) ClearAllNotifications() {
	nm.mu.Lock()
	defer nm.mu.Unlock()
	
	for _, notification := range nm.notifications {
		notification.Dismissed = true
	}
	
	// Clear the map
	nm.notifications = make(map[string]*Notification)
}

// autoDismiss automatically dismisses a notification after the specified duration
func (nm *NotificationManager) autoDismiss(notificationID string, duration time.Duration) {
	time.Sleep(duration)
	nm.DismissNotification(notificationID)
}

// Convenience methods for common notification types

// ShowSuccessNotification shows a success notification
func (nm *NotificationManager) ShowSuccessNotification(title, message string) string {
	notification := &Notification{
		Type:     NotificationTypeSuccess,
		Priority: NotificationPriorityMedium,
		Title:    title,
		Message:  message,
	}
	nm.ShowNotification(notification)
	return notification.ID
}

// ShowInfoNotification shows an info notification
func (nm *NotificationManager) ShowInfoNotification(title, message string) string {
	notification := &Notification{
		Type:     NotificationTypeInfo,
		Priority: NotificationPriorityLow,
		Title:    title,
		Message:  message,
	}
	nm.ShowNotification(notification)
	return notification.ID
}

// ShowWarningNotification shows a warning notification
func (nm *NotificationManager) ShowWarningNotification(title, message string) string {
	notification := &Notification{
		Type:     NotificationTypeWarning,
		Priority: NotificationPriorityHigh,
		Title:    title,
		Message:  message,
	}
	nm.ShowNotification(notification)
	return notification.ID
}

// ShowErrorNotification shows an error notification
func (nm *NotificationManager) ShowErrorNotification(title, message string) string {
	notification := &Notification{
		Type:     NotificationTypeError,
		Priority: NotificationPriorityUrgent,
		Title:    title,
		Message:  message,
		Persistent: true, // Errors should be persistent by default
	}
	nm.ShowNotification(notification)
	return notification.ID
}

// ShowProgressNotification shows a progress notification
func (nm *NotificationManager) ShowProgressNotification(title, message string, total int) string {
	notification := &Notification{
		Type:     NotificationTypeProgress,
		Priority: NotificationPriorityMedium,
		Title:    title,
		Message:  message,
		Persistent: true,
		Progress: &NotificationProgress{
			Current: 0,
			Total:   total,
			Percent: 0,
			Status:  "starting",
		},
	}
	nm.ShowNotification(notification)
	return notification.ID
}

// UpdateProgressNotification updates a progress notification
func (nm *NotificationManager) UpdateProgressNotification(notificationID string, current int, status string) error {
	updates := map[string]interface{}{
		"progress": &NotificationProgress{
			Current: current,
			Total:   nm.getProgressTotal(notificationID),
			Percent: nm.calculateProgressPercent(current, nm.getProgressTotal(notificationID)),
			Status:  status,
		},
	}
	return nm.UpdateNotification(notificationID, updates)
}

// CompleteProgressNotification marks a progress notification as complete
func (nm *NotificationManager) CompleteProgressNotification(notificationID string, message string) error {
	updates := map[string]interface{}{
		"title":     message,
		"message":   "Operation completed successfully",
		"type":      NotificationTypeSuccess,
		"persistent": false,
		"progress": &NotificationProgress{
			Percent: 100,
			Status:  "completed",
		},
	}
	
	if err := nm.UpdateNotification(notificationID, updates); err != nil {
		return err
	}
	
	// Auto-dismiss after 3 seconds
	go nm.autoDismiss(notificationID, 3*time.Second)
	return nil
}

// FailProgressNotification marks a progress notification as failed
func (nm *NotificationManager) FailProgressNotification(notificationID string, message string) error {
	updates := map[string]interface{}{
		"title":     message,
		"message":   "Operation failed",
		"type":      NotificationTypeError,
		"persistent": true,
		"progress": &NotificationProgress{
			Status: "failed",
		},
	}
	
	return nm.UpdateNotification(notificationID, updates)
}

// Helper methods

func (nm *NotificationManager) getProgressTotal(notificationID string) int {
	nm.mu.RLock()
	defer nm.mu.RUnlock()
	
	if notification, exists := nm.notifications[notificationID]; exists && notification.Progress != nil {
		return notification.Progress.Total
	}
	return 0
}

func (nm *NotificationManager) calculateProgressPercent(current, total int) float64 {
	if total == 0 {
		return 0
	}
	return float64(current) / float64(total) * 100
}

// NotificationBuilder provides a fluent interface for building notifications
type NotificationBuilder struct {
	notification *Notification
}

// NewNotificationBuilder creates a new notification builder
func NewNotificationBuilder() *NotificationBuilder {
	return &NotificationBuilder{
		notification: &Notification{
			Timestamp: time.Now(),
		},
	}
}

// Type sets the notification type
func (nb *NotificationBuilder) Type(notificationType NotificationType) *NotificationBuilder {
	nb.notification.Type = notificationType
	return nb
}

// Priority sets the notification priority
func (nb *NotificationBuilder) Priority(priority NotificationPriority) *NotificationBuilder {
	nb.notification.Priority = priority
	return nb
}

// Title sets the notification title
func (nb *NotificationBuilder) Title(title string) *NotificationBuilder {
	nb.notification.Title = title
	return nb
}

// Message sets the notification message
func (nb *NotificationBuilder) Message(message string) *NotificationBuilder {
	nb.notification.Message = message
	return nb
}

// Details sets additional notification details
func (nb *NotificationBuilder) Details(details string) *NotificationBuilder {
	nb.notification.Details = details
	return nb
}

// Duration sets the notification duration
func (nb *NotificationBuilder) Duration(duration time.Duration) *NotificationBuilder {
	nb.notification.Duration = duration
	return nb
}

// Persistent sets whether the notification is persistent
func (nb *NotificationBuilder) Persistent(persistent bool) *NotificationBuilder {
	nb.notification.Persistent = persistent
	return nb
}

// AddAction adds an action to the notification
func (nb *NotificationBuilder) AddAction(id, label, style string) *NotificationBuilder {
	if nb.notification.Actions == nil {
		nb.notification.Actions = make([]NotificationAction, 0)
	}
	
	nb.notification.Actions = append(nb.notification.Actions, NotificationAction{
		ID:    id,
		Label: label,
		Style: style,
	})
	return nb
}

// AddMetadata adds metadata to the notification
func (nb *NotificationBuilder) AddMetadata(key, value string) *NotificationBuilder {
	if nb.notification.Metadata == nil {
		nb.notification.Metadata = make(map[string]string)
	}
	nb.notification.Metadata[key] = value
	return nb
}

// Build constructs the final notification
func (nb *NotificationBuilder) Build() *Notification {
	return nb.notification
}

// ToJSON converts the notification to JSON
func (n *Notification) ToJSON() (string, error) {
	data, err := json.Marshal(n)
	if err != nil {
		return "", fmt.Errorf("failed to marshal notification to JSON: %w", err)
	}
	return string(data), nil
}

// NotificationSummary provides a summary of notifications
type NotificationSummary struct {
	TotalNotifications    int                        `json:"total_notifications"`
	NotificationsByType    map[NotificationType]int   `json:"notifications_by_type"`
	NotificationsByPriority map[NotificationPriority]int `json:"notifications_by_priority"`
	UnreadCount           int                        `json:"unread_count"`
	ActiveNotifications   []*Notification            `json:"active_notifications"`
}

// GetNotificationSummary returns a summary of all notifications
func (nm *NotificationManager) GetNotificationSummary() *NotificationSummary {
	nm.mu.RLock()
	defer nm.mu.RUnlock()
	
	summary := &NotificationSummary{
		TotalNotifications:      len(nm.notifications),
		NotificationsByType:     make(map[NotificationType]int),
		NotificationsByPriority: make(map[NotificationPriority]int),
		ActiveNotifications:     make([]*Notification, 0),
	}
	
	for _, notification := range nm.notifications {
		if !notification.Dismissed {
			summary.NotificationsByType[notification.Type]++
			summary.NotificationsByPriority[notification.Priority]++
			summary.ActiveNotifications = append(summary.ActiveNotifications, notification)
			
			if !notification.Read {
				summary.UnreadCount++
			}
		}
	}
	
	return summary
}
