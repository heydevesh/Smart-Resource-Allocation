export interface Activity {
  id: string;
  type: 'need_created' | 'task_created' | 'task_assigned' | 'task_resolved' | 'task_updated' | 'volunteer_joined';
  text: string;
  timestamp: any;
  userId: string;
  userName: string;
  dotClass: string;
}
