export interface CreateChatDto {
  name?: string;
  description?: string;
  type?: string;
  creator_id: string;
  is_active?: boolean;
  last_message_id?: string;
}
