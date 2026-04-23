export interface NotificationPreferences {
  // Critical alerts — always enabled, cannot be disabled
  criticalNeedAlerts: boolean;
  
  // Operational notifications
  taskAssignments: boolean;
  taskStatusUpdates: boolean;
  volunteerApplications: boolean;
  volunteerStatusChanges: boolean;
  
  // AI & Insights
  aiMatchSuggestions: boolean;
  surgePredictions: boolean;
  weeklyDigest: boolean;
  
  // Inventory
  lowStockAlerts: boolean;
  inventoryTransactions: boolean;
  
  // Delivery channels
  pushEnabled: boolean;
  emailDigest: boolean;
  
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format, e.g. '22:00'
  quietHoursEnd: string;   // HH:mm format, e.g. '07:00'
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  criticalNeedAlerts: true,
  taskAssignments: true,
  taskStatusUpdates: true,
  volunteerApplications: true,
  volunteerStatusChanges: true,
  aiMatchSuggestions: true,
  surgePredictions: true,
  weeklyDigest: true,
  lowStockAlerts: true,
  inventoryTransactions: false,
  pushEnabled: true,
  emailDigest: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};
