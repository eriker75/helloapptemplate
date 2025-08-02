export interface Message {
  id: string;
  created_at: string;
  updated_at?: string | null;
  chat_id: string;
  content?: string | null;
  sender_id: string;
  parent_id?: string | null;
  draft_content?: string | null;
  type?: string | null;
  readed?: boolean | null;
  deleted?: boolean | null;
}
