export interface CreateMessageDto {
  chat_id: string;
  content: string;
  sender_id: string;
  parent_id?: string;
  type?: string;
}
