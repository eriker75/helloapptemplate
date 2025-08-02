export interface Chat {
  id: string;
  created_at: string;
  updated_at?: string | null;
  is_active?: boolean | null;
  type?: string | null;
  last_message_id?: string | null;
  description?: string | null;
  creator_id?: string | null;
  name?: string | null;
}
