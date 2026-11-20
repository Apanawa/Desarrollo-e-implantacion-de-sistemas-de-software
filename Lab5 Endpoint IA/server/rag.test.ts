import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exampleDocuments } from '../shared/documents';
import {
  chunkDocument,
  demoAnswer,
  noContextMessage,
  retrieve,
  tokenize,
} from './rag';

test('normaliza acentos y mayúsculas, y excluye palabras vacías', () => {
  assert.deepEqual(tokenize('¿QUÉ es la generación?'), ['generacion']);
});

test('recupera documentos relevantes con citas consecutivas y fragmentos verificables', () => {
  const sources = retrieve('¿Qué significa RAG?', exampleDocuments);
  assert.ok(sources.length > 0);
  assert.match(sources[0].excerpt, /Retrieval-Augmented/);
  sources.forEach((source, index) => {
    assert.equal(source.id, index + 1);
    assert.ok(
      exampleDocuments
        .find((document) => document.id === source.documentId)!
        .content.includes(source.excerpt),
    );
  });
});

test('no inventa contexto cuando no hay coincidencias ni documentos', () => {
  assert.deepEqual(
    retrieve('¿Cuál es la capital de Zimbabue?', exampleDocuments),
    [],
  );
  assert.deepEqual(retrieve('React', []), []);
  assert.equal(demoAnswer([]), noContextMessage);
});

test('fragmenta textos largos sin perder su contenido', () => {
  const content = 'contenido extenso '.repeat(400).trim();
  const chunks = chunkDocument({
    id: 'long',
    title: 'Texto largo',
    content,
    origin: 'upload',
  });
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 900));
  assert.equal(chunks.join(' '), content);
});

test('el modo demo usa extractos literales con referencias y admite documentos propios', () => {
  const sources = retrieve('¿Cuál es el color de Zephyr?', [
    {
      id: 'custom',
      title: 'Mi dragón',
      content: 'Zephyr tiene escamas azules y vive en una biblioteca.',
      origin: 'upload',
    },
  ]);
  assert.equal(sources[0].documentId, 'custom');
  assert.match(
    demoAnswer(sources),
    /Zephyr tiene escamas azules y vive en una biblioteca\. \[1\]/,
  );
});

test('los términos frecuentes no desplazan una coincidencia específica', () => {
  const sources = retrieve('embeddings', [
    {
      id: 'a',
      title: 'General',
      content: 'React es una biblioteca de interfaces.',
      origin: 'example',
    },
    {
      id: 'b',
      title: 'Vectores',
      content: 'Los embeddings representan texto mediante vectores numéricos.',
      origin: 'example',
    },
  ]);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].documentId, 'b');
});

test('descarta encabezados aislados y coincidencias débiles de otro dragón', () => {
  const sources = retrieve(
    '¿Dónde vive Zephyr y de qué color son sus escamas?',
    [
      {
        id: 'zephyr',
        title: 'Mi dragón',
        content:
          '# Zephyr\n\nZephyr vive en la montaña de obsidiana. Tiene escamas azules.',
        origin: 'upload',
      },
      {
        id: 'brasa',
        title: 'Otro dragón',
        content: 'Brasa tiene escamas verdes y alas cobrizas.',
        origin: 'example',
      },
    ],
  );
  assert.equal(sources.length, 1);
  assert.equal(sources[0].documentId, 'zephyr');
  assert.ok(!sources[0].excerpt.startsWith('#'));
});
