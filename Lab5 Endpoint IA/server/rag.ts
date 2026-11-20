import type { KnowledgeDocument, Source } from '../shared/types';

const stopwords = new Set(
  'a al algo ante asi aun cada como con cual cuando de del desde donde el ella en entre era es esa ese eso esta este estos fue ha hay la las le lo los mas me mi muy ni no nos o para pero por porque que quien se ser si sin sobre son su sus te tiene tu un una uno unos unas y ya'.split(
    ' ',
  ),
);

export function tokenize(text: string): string[] {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length > 1 && !stopwords.has(word)) ?? []
  );
}

export function chunkDocument(document: KnowledgeDocument): string[] {
  const paragraphs = document.content
    .split(/\n\s*\n/)
    .map((text) => text.replace(/^#{1,6}\s+[^\n]+$/gm, '').trim())
    .filter(Boolean);
  return paragraphs.flatMap((paragraph) => {
    const chunks: string[] = [];
    let remaining = paragraph;
    while (remaining.length > 900) {
      let end = remaining.lastIndexOf(' ', 900);
      if (end < 450) end = 900;
      chunks.push(remaining.slice(0, end));
      remaining = remaining.slice(end).trim();
    }
    if (remaining) chunks.push(remaining);
    return chunks;
  });
}

export function retrieve(
  question: string,
  documents: KnowledgeDocument[],
  limit = 3,
): Source[] {
  const query = [...new Set(tokenize(question))];
  if (!query.length) return [];
  const chunks = documents.flatMap((document) =>
    chunkDocument(document).map((excerpt) => ({
      document,
      excerpt,
      tokens: tokenize(excerpt),
    })),
  );
  const averageLength =
    chunks.reduce((sum, chunk) => sum + chunk.tokens.length, 0) /
    (chunks.length || 1);
  const frequencies = new Map(
    query.map((term) => [
      term,
      chunks.filter((chunk) => chunk.tokens.includes(term)).length,
    ]),
  );
  const ranked = chunks
    .map((chunk, index) => {
      let score = 0;
      let matched = 0;
      for (const term of query) {
        const tf = chunk.tokens.filter((word) => word === term).length;
        if (!tf) continue;
        matched++;
        const count = frequencies.get(term) ?? 0;
        const idf = Math.log(1 + (chunks.length - count + 0.5) / (count + 0.5));
        score +=
          (idf * (tf * 2.2)) /
          (tf + 1.2 * (0.25 + (0.75 * chunk.tokens.length) / averageLength));
      }
      return { ...chunk, score: score * (matched / query.length), index };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const threshold = (ranked[0]?.score ?? 0) * 0.35;
  return ranked
    .filter((chunk) => chunk.score >= threshold)
    .slice(0, limit)
    .map((chunk, index) => ({
      id: index + 1,
      documentId: chunk.document.id,
      title: chunk.document.title,
      excerpt: chunk.excerpt,
    }));
}

export const noContextMessage =
  'No encontré información suficiente en los documentos activos para responder esa pregunta. Prueba con otros términos o agrega un archivo .txt o .md a tu biblioteca.';

export function demoAnswer(sources: Source[]): string {
  if (!sources.length) return noContextMessage;
  return (
    'Esto es lo que encontré en tu biblioteca:\n\n' +
    sources.map((source) => `${source.excerpt} [${source.id}]`).join('\n\n')
  );
}
