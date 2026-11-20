import { z } from 'zod';
import { exampleDocuments } from '../../shared/documents';
import type { Conversation, KnowledgeDocument } from '../../shared/types';

export interface Workspace {
  conversations: Conversation[];
  activeId: string;
  documents: KnowledgeDocument[];
  enabledIds: string[];
}

const sourceSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  excerpt: z.string(),
});
const workspaceSchema = z.object({
  conversations: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().max(150),
        updatedAt: z.number(),
        messages: z
          .array(
            z.object({
              id: z.string(),
              role: z.enum(['user', 'assistant']),
              content: z.string().max(40000),
              sources: z.array(sourceSchema).optional(),
              mode: z.enum(['demo', 'live']).optional(),
            }),
          )
          .max(80),
      }),
    )
    .min(1)
    .max(20),
  activeId: z.string(),
  documents: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().max(150),
        content: z.string().max(60000),
        origin: z.enum(['example', 'upload']),
      }),
    )
    .max(12),
  enabledIds: z.array(z.string()).max(12),
});

export function newConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: 'Nueva conversación',
    messages: [],
    updatedAt: Date.now(),
  };
}

export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem('adangpt.workspace.v1');
    if (raw) {
      const saved = workspaceSchema.parse(JSON.parse(raw));
      if (
        saved.conversations.some((chat) => chat.id === saved.activeId) &&
        saved.documents.reduce((sum, doc) => sum + doc.content.length, 0) <=
          240000
      )
        return saved;
    }
  } catch {
    /* El almacenamiento no disponible o incompatible inicia un espacio limpio. */
  }
  const conversation = newConversation();
  return {
    conversations: [conversation],
    activeId: conversation.id,
    documents: exampleDocuments,
    enabledIds: exampleDocuments.map((document) => document.id),
  };
}

export function downloadConversation(conversation: Conversation) {
  const text =
    `# ${conversation.title}\n\n` +
    conversation.messages
      .map((message) => {
        const sources = message.sources?.length
          ? '\n\nFuentes:\n' +
            message.sources
              .map(
                (source) =>
                  `[${source.id}] ${source.title}\n> ${source.excerpt}`,
              )
              .join('\n\n')
          : '';
        return `## ${message.role === 'user' ? 'Tú' : `AdanGPT (${message.mode === 'demo' ? 'demo' : 'IA'})`}\n\n${message.content}${sources}`;
      })
      .join('\n\n');
  const url = URL.createObjectURL(
    new Blob([text], { type: 'text/markdown;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'AdanGPT-conversacion.md';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
