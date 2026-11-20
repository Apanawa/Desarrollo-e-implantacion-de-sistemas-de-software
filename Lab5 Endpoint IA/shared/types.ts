export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  origin: 'example' | 'upload';
}

export interface Source {
  id: number;
  documentId: string;
  title: string;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  mode?: 'demo' | 'live';
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface ChatResponse {
  message: string;
  sources: Source[];
  mode: 'demo' | 'live';
  model: string;
}

export interface ServiceStatus {
  mode: 'demo' | 'live';
  model: string;
}
