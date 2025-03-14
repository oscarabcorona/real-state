export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, string>;
  read: boolean;
  created_at: string;
}
