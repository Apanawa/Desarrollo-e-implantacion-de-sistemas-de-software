import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  FileText,
  Flame,
  FolderOpen,
  Info,
  Menu,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type {
  ChatMessage,
  ChatResponse,
  KnowledgeDocument,
  ServiceStatus,
} from '../shared/types';
import Dragon from './components/Dragon';
import Modal from './components/Modal';
import {
  downloadConversation,
  loadWorkspace,
  newConversation,
} from './lib/workspace';

const Markdown = lazy(() => import('./components/Markdown'));

const prompts = [
  {
    icon: Sparkles,
    className: 'prompt-sage',
    title: 'Despierta tu curiosidad',
    description: '¿Qué es RAG y cómo funciona?',
    prompt: '¿Qué es RAG y cómo funciona?',
  },
  {
    icon: Flame,
    className: 'prompt-peach',
    title: 'Un poco de magia',
    description: 'Cuéntame sobre los dragones',
    prompt: '¿Cómo son los dragones en distintas culturas?',
  },
  {
    icon: Code2,
    className: 'prompt-lavender',
    title: 'Construye algo increíble',
    description: '¿Cómo conecto React a una API?',
    prompt: '¿Cómo puedo conectar React con una API y proteger mi clave?',
  },
];

export default function App() {
  const [workspace, setWorkspace] = useState(loadWorkspace);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [modal, setModal] = useState<'library' | 'settings' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [breathing, setBreathing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const fireTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const chat = workspace.conversations.find(
    (conversation) => conversation.id === workspace.activeId,
  )!;
  const activeDocuments = workspace.documents.filter((document) =>
    workspace.enabledIds.includes(document.id),
  );
  const history = workspace.conversations.filter(
    (conversation) =>
      conversation.messages.length &&
      `${conversation.title} ${conversation.messages.map((message) => message.content).join(' ')}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (!sidebarOpen) return;
    sidebar.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      menuButton.current?.focus();
    };
  }, [sidebarOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('adangpt.workspace.v1', JSON.stringify(workspace));
    } catch {
      setNotice(
        'El navegador no pudo guardar el historial. Puedes descargar la conversación antes de salir.',
      );
    }
  }, [workspace]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data: ServiceStatus = await response.json();
        if (!['demo', 'live'].includes(data.mode)) throw new Error();
        setStatus(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            'No se pudo conectar con el servidor. Inicia la app con npm run dev o npm start.',
          );
      });
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.messages.length, pending]);
  useEffect(
    () => () => {
      abort.current?.abort();
      clearTimeout(fireTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = 'auto';
      textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 150)}px`;
    }
  }, [draft]);

  function breatheFire() {
    setBreathing(false);
    requestAnimationFrame(() => setBreathing(true));
    clearTimeout(fireTimer.current);
    fireTimer.current = setTimeout(() => setBreathing(false), 2600);
  }

  async function sendMessage(question = draft) {
    const text = question.trim();
    if (!text || pending) return;
    if (text.length > 4000) {
      setError('Escribe una pregunta de hasta 4,000 caracteres.');
      return;
    }
    if (!activeDocuments.length) {
      setError(
        'Activa al menos un documento en la biblioteca para consultar sus fuentes.',
      );
      return;
    }
    if (chat.messages.length >= 80) {
      setError(
        'Esta conversación llegó a su límite. Descárgala y crea una nueva para seguir.',
      );
      return;
    }
    const chatId = chat.id;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };
    const messages = [...chat.messages, userMessage];
    setWorkspace((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === chatId
          ? {
              ...conversation,
              title: conversation.messages.length
                ? conversation.title
                : text.slice(0, 60),
              messages,
              updatedAt: Date.now(),
            }
          : conversation,
      ),
    }));
    setDraft('');
    setError('');
    setNotice('');
    setPending(true);
    breatheFire();
    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: messages
            .slice(-20)
            .map(({ role, content }) => ({ role, content })),
          documents: activeDocuments,
        }),
      });
      const result = (await response.json()) as ChatResponse & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          result.error || 'No se pudo enviar la pregunta. Inténtalo de nuevo.',
        );
      if (typeof result.message !== 'string' || !Array.isArray(result.sources))
        throw new Error('El servidor devolvió una respuesta inesperada.');
      const answer: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.message,
        sources: result.sources,
        mode: result.mode,
      };
      setWorkspace((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === chatId
            ? {
                ...conversation,
                messages: [...conversation.messages, answer],
                updatedAt: Date.now(),
              }
            : conversation,
        ),
      }));
      setStatus({ mode: result.mode, model: result.model });
    } catch (reason) {
      setWorkspace((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === chatId
            ? {
                ...conversation,
                messages: conversation.messages.filter(
                  (message) => message.id !== userMessage.id,
                ),
              }
            : conversation,
        ),
      }));
      setDraft(text);
      if (!controller.signal.aborted)
        setError(
          reason instanceof Error && reason.message !== 'Failed to fetch'
            ? reason.message
            : 'No hay conexión con el servidor. Revisa que la app siga ejecutándose e inténtalo de nuevo.',
        );
      else setNotice('Envío cancelado. Tu pregunta sigue en el editor.');
    } finally {
      abort.current = null;
      setPending(false);
      textarea.current?.focus();
    }
  }

  function startConversation() {
    if (pending) return;
    const empty = workspace.conversations.find(
      (conversation) => !conversation.messages.length,
    );
    const next = empty ?? newConversation();
    if (!empty && workspace.conversations.length >= 20) {
      setError(
        'Tienes 20 conversaciones. Descarga y elimina alguna para crear otra.',
      );
      return;
    }
    setWorkspace((current) => ({
      ...current,
      activeId: next.id,
      conversations: empty
        ? current.conversations
        : [next, ...current.conversations],
    }));
    setDraft('');
    setError('');
    setSidebarOpen(false);
    textarea.current?.focus();
  }

  function deleteConversation(id: string) {
    if (pending) return;
    setWorkspace((current) => {
      const remaining = current.conversations.filter(
        (conversation) => conversation.id !== id,
      );
      if (!remaining.length) remaining.push(newConversation());
      return {
        ...current,
        conversations: remaining,
        activeId: current.activeId === id ? remaining[0].id : current.activeId,
      };
    });
    setDraft('');
    setError('');
  }

  async function importFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    setImporting(true);
    try {
      if (files.length + workspace.documents.length > 12)
        throw new Error(
          'La biblioteca admite hasta 12 documentos. Elimina uno antes de agregar más.',
        );
      const added: KnowledgeDocument[] = [];
      for (const file of files) {
        if (!/\.(txt|md)$/i.test(file.name))
          throw new Error('Agrega archivos de texto .txt o Markdown .md.');
        if (file.size > 120000)
          throw new Error(`${file.name}: el tamaño máximo es de 120 KB.`);
        const content = (await file.text()).trim();
        if (!content || content.includes('\u0000'))
          throw new Error(
            `${file.name}: el archivo está vacío o no es texto válido.`,
          );
        if (content.length > 60000)
          throw new Error(`${file.name}: el límite es de 60,000 caracteres.`);
        added.push({
          id: crypto.randomUUID(),
          title: file.name.slice(0, 150),
          content,
          origin: 'upload',
        });
      }
      if (
        [...workspace.documents, ...added].reduce(
          (sum, document) => sum + document.content.length,
          0,
        ) > 240000
      )
        throw new Error(
          'La biblioteca admite hasta 240,000 caracteres en total.',
        );
      setWorkspace((current) => ({
        ...current,
        documents: [...current.documents, ...added],
        enabledIds: [
          ...current.enabledIds,
          ...added.map((document) => document.id),
        ],
      }));
      setError('');
      setNotice(
        `${added.length === 1 ? 'Documento agregado' : 'Documentos agregados'} a la biblioteca. Ya puedes hacer preguntas sobre su contenido.`,
      );
      setModal('library');
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'No se pudo leer el archivo.',
      );
    } finally {
      setImporting(false);
    }
  }

  async function copyMessage(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
    } catch {
      setNotice(
        'El navegador no permitió copiar. Puedes seleccionar el texto o descargar la conversación.',
      );
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        id="main-sidebar"
        ref={sidebar}
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
        aria-label="Navegación principal"
      >
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            startConversation();
          }}
        >
          <span className="brand-icon">
            <Flame size={26} strokeWidth={1.7} />
          </span>
          <span>
            Adan<span className="brand-gpt">GPT</span>
            <small>IDEAS CON FUEGO PROPIO</small>
          </span>
        </a>
        <button
          type="button"
          className="new-chat"
          onClick={startConversation}
          disabled={pending}
        >
          <Plus size={19} />
          Nueva conversación<span className="new-chat-shortcut">+</span>
        </button>
        <label className="history-search">
          <Search size={16} />
          <input
            aria-label="Buscar conversaciones"
            placeholder="Buscar conversaciones"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="sidebar-section-label">
          TU HISTORIAL{' '}
          <span>
            {
              workspace.conversations.filter(
                (conversation) => conversation.messages.length,
              ).length
            }
          </span>
        </div>
        <nav
          className="conversation-list"
          aria-label="Conversaciones guardadas"
        >
          {history.length ? (
            history.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-row ${conversation.id === chat.id ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="conversation-link"
                  disabled={pending}
                  onClick={() => {
                    setWorkspace((current) => ({
                      ...current,
                      activeId: conversation.id,
                    }));
                    setDraft('');
                    setError('');
                    setSidebarOpen(false);
                  }}
                >
                  <MessageCircle size={16} />
                  <span>{conversation.title}</span>
                </button>
                <button
                  type="button"
                  className="delete-chat"
                  disabled={pending}
                  aria-label={`Eliminar conversación: ${conversation.title}`}
                  onClick={() => deleteConversation(conversation.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-history">
              <MessageCircle size={21} />
              <p>
                {search
                  ? 'No hay coincidencias.'
                  : 'Las buenas ideas empiezan con una conversación.'}
              </p>
            </div>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="library-teaser">
            <span className="teaser-icon">
              <BookOpen size={19} />
            </span>
            <div>
              <strong>Tu conocimiento, potenciado</strong>
              <p>Dale contexto a tus preguntas.</p>
            </div>
            <button type="button" onClick={() => setModal('library')}>
              Abrir biblioteca <span>{workspace.documents.length}</span>
            </button>
          </div>
          <button
            type="button"
            className="sidebar-settings"
            onClick={() => setModal('settings')}
          >
            <Settings2 size={17} />
            Configuración
            <Info size={15} />
          </button>
          <div className="profile">
            <span className="profile-avatar">A</span>
            <div>
              <strong>Mi espacio personal</strong>
              <small>Explorador de ideas</small>
            </div>
            <span className="profile-flame">
              <Flame size={17} />
            </span>
          </div>
        </div>
      </aside>

      <div className="workspace" inert={sidebarOpen || undefined}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button mobile-menu"
              ref={menuButton}
              aria-label="Abrir menú"
              aria-controls="main-sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="workspace-label">Tu espacio de ideas</span>
            <span className="header-divider" />
            <span className="header-model">
              AdanGPT <ChevronDown size={13} />
            </span>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className={`mode-badge ${status?.mode === 'live' ? 'live' : ''}`}
              onClick={() => setModal('settings')}
            >
              <span className="status-dot" />
              {status
                ? status.mode === 'live'
                  ? 'API configurada'
                  : 'Modo demo'
                : error
                  ? 'Sin conexión'
                  : 'Conectando'}
            </button>
            <button
              type="button"
              className="header-library"
              aria-label="Abrir biblioteca de conocimiento"
              onClick={() => setModal('library')}
            >
              <BookOpen size={17} />
              <span>Biblioteca</span>
              <span className="count-badge">{activeDocuments.length}</span>
            </button>
          </div>
        </header>

        <main
          className={`main-content ${chat.messages.length ? 'has-messages' : ''}`}
        >
          {!chat.messages.length ? (
            <div className="welcome">
              <section className="hero" aria-labelledby="welcome-title">
                <div className="hero-copy">
                  <span className="eyebrow">
                    <span />
                    UNA CHISPA. MIL POSIBILIDADES.
                  </span>
                  <h1 id="welcome-title">
                    Las grandes ideas
                    <br />
                    empiezan con
                    <br />
                    <em>una buena pregunta.</em>
                  </h1>
                  <p>
                    Soy AdanGPT, tu compañero de curiosidad.
                    <br className="desktop-break" /> Exploremos tus documentos y
                    encendamos algo increíble.
                  </p>
                  <div className="hero-signature">
                    <span className="signature-line" />
                    <Flame size={15} />
                    <span>Un poco de inteligencia. Un poco de fuego.</span>
                  </div>
                </div>
                <div className="dragon-stage">
                  <Dragon breathing={breathing || pending} />
                  <button
                    type="button"
                    className="dragon-trigger"
                    onClick={breatheFire}
                  >
                    <Flame size={14} />
                    Encender la chispa
                  </button>
                  <span className="dragon-caption">
                    BRASA, TU GUARDIÁN DE IDEAS
                  </span>
                </div>
              </section>
              <section
                className="prompt-section"
                aria-label="Ideas para comenzar"
              >
                <div className="section-heading">
                  <span>¿Por dónde empezamos?</span>
                  <span>La curiosidad es bienvenida.</span>
                </div>
                <div className="prompt-grid">
                  {prompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt.title}
                      className={`prompt-card ${prompt.className}`}
                      onClick={() => void sendMessage(prompt.prompt)}
                      disabled={pending}
                    >
                      <span className="prompt-icon">
                        <prompt.icon size={20} strokeWidth={1.6} />
                      </span>
                      <strong>{prompt.title}</strong>
                      <span>{prompt.description}</span>
                      <span className="prompt-corner">
                        <Plus size={15} />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              <div className="context-note">
                <ShieldCheck size={16} />
                <p>
                  Respuestas con raíces: AdanGPT consulta{' '}
                  <button type="button" onClick={() => setModal('library')}>
                    {activeDocuments.length}{' '}
                    {activeDocuments.length === 1
                      ? 'documento activo'
                      : 'documentos activos'}
                  </button>{' '}
                  para darte contexto.
                </p>
              </div>
            </div>
          ) : (
            <section className="messages" aria-label="Conversación">
              <div className="chat-heading">
                <span>
                  <MessageCircle size={17} />
                  {chat.title}
                </span>
                <div className="chat-header-actions">
                  <button
                    type="button"
                    className="chat-dragon"
                    aria-label="Hacer que Brasa eche fuego"
                    onClick={breatheFire}
                  >
                    <Dragon small breathing={breathing || pending} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Descargar conversación"
                    onClick={() => downloadConversation(chat)}
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
              {chat.messages.map((message) => (
                <article
                  key={message.id}
                  className={`message message-${message.role}`}
                >
                  <div
                    className={`message-avatar ${message.role === 'assistant' ? 'assistant-avatar' : ''}`}
                  >
                    {message.role === 'user' ? 'A' : <Flame size={20} />}
                  </div>
                  <div className="message-body">
                    <div className="message-label">
                      {message.role === 'user' ? 'Tú' : 'AdanGPT'}
                      {message.mode === 'demo' && (
                        <span>Extracto · modo demo</span>
                      )}
                    </div>
                    <div className="markdown">
                      <Suspense fallback={<p>{message.content}</p>}>
                        <Markdown content={message.content} />
                      </Suspense>
                    </div>
                    {Boolean(message.sources?.length) && (
                      <details className="sources">
                        <summary>
                          <BookOpen size={15} />
                          {message.sources!.length}{' '}
                          {message.sources!.length === 1
                            ? 'fragmento consultado'
                            : 'fragmentos consultados'}
                          <ChevronDown size={14} />
                        </summary>
                        <div className="source-list">
                          {message.sources!.map((source) => (
                            <div key={source.id} className="source-card">
                              <strong>
                                <span>{source.id}</span>
                                {source.title}
                              </strong>
                              <p>{source.excerpt}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                    {message.role === 'assistant' && (
                      <button
                        type="button"
                        className="copy-answer"
                        onClick={() => void copyMessage(message)}
                      >
                        {copiedId === message.id ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}{' '}
                        {copiedId === message.id
                          ? 'Copiado'
                          : 'Copiar respuesta'}
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {pending && (
                <div className="thinking" role="status">
                  <span className="thinking-flame">
                    <Flame size={19} />
                  </span>
                  <span>Brasa está buscando entre tus documentos</span>
                  <span className="thinking-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              )}
              <div ref={end} />
            </section>
          )}

          <div className="composer-area">
            {error && !modal && (
              <div className="feedback error" role="alert">
                <Info size={17} />
                <span>{error}</span>
                <button
                  type="button"
                  aria-label="Cerrar error"
                  onClick={() => setError('')}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {notice && !modal && (
              <div className="feedback notice" role="status">
                <Check size={17} />
                <span>{notice}</span>
                <button
                  type="button"
                  aria-label="Cerrar aviso"
                  onClick={() => setNotice('')}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <form
              className={`composer ${pending ? 'composer-busy' : ''}`}
              onSubmit={submit}
            >
              <label className="sr-only" htmlFor="message-input">
                Tu pregunta para AdanGPT
              </label>
              <textarea
                id="message-input"
                ref={textarea}
                rows={1}
                placeholder="¿Qué idea encendemos hoy?"
                maxLength={4000}
                value={draft}
                disabled={pending}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <div className="composer-bottom">
                <div className="composer-tools">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Adjuntar documento"
                    disabled={pending || importing}
                    onClick={() => fileInput.current?.click()}
                  >
                    <Paperclip size={19} />
                  </button>
                  <span className="composer-tool-divider" />
                  <span className="rag-label">
                    <BookOpen size={14} />
                    Con tus documentos
                  </span>
                </div>
                <div className="composer-send">
                  <span className="enter-hint">
                    {draft.length > 3500
                      ? `${draft.length}/4,000`
                      : 'Enter para enviar'}
                  </span>
                  {pending ? (
                    <button
                      type="button"
                      className="send-button stop-button"
                      aria-label="Detener respuesta"
                      onClick={() => abort.current?.abort()}
                    >
                      <Square size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="send-button"
                      aria-label="Enviar mensaje"
                      disabled={!draft.trim()}
                    >
                      <Send size={18} />
                    </button>
                  )}
                </div>
              </div>
            </form>
            <div className="composer-footer">
              <span>
                <Flame size={12} /> Hecho de curiosidad y un poco de fuego.
              </span>
              <span>
                {status?.mode === 'live'
                  ? 'Verifica las respuestas y sus fuentes.'
                  : 'Modo demo: respuestas extraídas de tus documentos.'}
              </span>
            </div>
          </div>
        </main>
      </div>

      <input
        className="sr-only"
        ref={fileInput}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        multiple
        tabIndex={-1}
        aria-label="Seleccionar documentos"
        onChange={(event) => void importFiles(event)}
      />

      {modal === 'library' && (
        <Modal
          title="Tu biblioteca de conocimiento"
          onClose={() => setModal(null)}
          wide
        >
          {error && (
            <div className="feedback error" role="alert">
              <Info size={17} />
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div className="feedback notice" role="status">
              <Check size={17} />
              <span>{notice}</span>
            </div>
          )}
          <p className="modal-intro">
            Cada buena respuesta empieza con una buena fuente. Activa los
            documentos que AdanGPT puede consultar.
          </p>
          <button
            type="button"
            className="upload-zone"
            disabled={importing || pending}
            onClick={() => fileInput.current?.click()}
          >
            <span>
              <Upload size={22} />
            </span>
            <strong>
              {importing
                ? 'Leyendo documentos…'
                : 'Agrega tus propios documentos'}
            </strong>
            <small>
              Selecciona archivos .txt o .md · hasta 120 KB por archivo
            </small>
          </button>
          <div className="library-meta">
            <span>{workspace.documents.length} de 12 documentos</span>
            <span>
              {activeDocuments.length}{' '}
              {activeDocuments.length === 1 ? 'activo' : 'activos'}
            </span>
          </div>
          <div className="documents-list">
            {workspace.documents.map((document) => (
              <div className="document-item" key={document.id}>
                <div className="document-main">
                  <span className="document-icon">
                    <FileText size={19} />
                  </span>
                  <button
                    type="button"
                    className="document-title"
                    aria-expanded={expandedDoc === document.id}
                    onClick={() =>
                      setExpandedDoc(
                        expandedDoc === document.id ? null : document.id,
                      )
                    }
                  >
                    <strong>{document.title}</strong>
                    <small>
                      {document.origin === 'example'
                        ? 'Documento de ejemplo'
                        : 'Tu documento'}{' '}
                      · {document.content.length.toLocaleString('es-MX')}{' '}
                      caracteres
                    </small>
                  </button>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={workspace.enabledIds.includes(document.id)}
                      disabled={pending}
                      onChange={() =>
                        setWorkspace((current) => ({
                          ...current,
                          enabledIds: current.enabledIds.includes(document.id)
                            ? current.enabledIds.filter(
                                (id) => id !== document.id,
                              )
                            : [...current.enabledIds, document.id],
                        }))
                      }
                    />
                    <span />
                    <span className="sr-only">Consultar {document.title}</span>
                  </label>
                  {document.origin === 'upload' && (
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Eliminar documento: ${document.title}`}
                      disabled={pending}
                      onClick={() =>
                        setWorkspace((current) => ({
                          ...current,
                          documents: current.documents.filter(
                            (entry) => entry.id !== document.id,
                          ),
                          enabledIds: current.enabledIds.filter(
                            (id) => id !== document.id,
                          ),
                        }))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                {expandedDoc === document.id && (
                  <pre className="document-preview">{document.content}</pre>
                )}
              </div>
            ))}
          </div>
          {!activeDocuments.length && (
            <p className="inline-warning">
              Activa un documento para comenzar a preguntar.
            </p>
          )}
          <div className="library-info">
            <ShieldCheck size={18} />
            <p>
              Los documentos se guardan en este navegador. Al preguntar, los
              documentos activos se envían al servidor; con IA conectada, solo
              los fragmentos recuperados se envían al proveedor.
            </p>
          </div>
        </Modal>
      )}

      {modal === 'settings' && (
        <Modal
          title="El fuego detrás de AdanGPT"
          onClose={() => setModal(null)}
        >
          <div className="settings-status">
            <span className="settings-flame">
              <Flame size={25} />
            </span>
            <div>
              <strong>
                {status?.mode === 'live'
                  ? 'API de IA configurada'
                  : status
                    ? 'Estás en modo demo'
                    : 'Servidor sin conexión'}
              </strong>
              <p>
                {status?.mode === 'live'
                  ? status.model
                  : 'Explora la app sin una clave de API.'}
              </p>
            </div>
          </div>
          <p className="modal-intro">
            {status?.mode === 'live'
              ? 'Tus preguntas se responden con un modelo de IA y el contexto recuperado de tu biblioteca.'
              : 'El modo demo busca fragmentos relevantes y los muestra con sus fuentes. No genera texto con un modelo de IA.'}
          </p>
          <h3>Conectar una API de IA</h3>
          <p className="settings-description">
            En la carpeta de la app, copia <code>.env.example</code> a{' '}
            <code>.env</code>, completa estas variables y reinicia el servidor:
          </p>
          <pre className="config-example">
            {
              'OPENAI_API_KEY=tu-clave\nOPENAI_BASE_URL=https://api.openai.com/v1\nOPENAI_MODEL=gpt-4o-mini'
            }
          </pre>
          <div className="library-info">
            <ShieldCheck size={18} />
            <p>
              La clave permanece en el servidor. Nunca se incluye en el código
              de React ni se guarda en el navegador.
            </p>
          </div>
          <div className="rag-explainer">
            <h3>De tu biblioteca a la respuesta</h3>
            <div>
              <span>
                <FolderOpen size={18} />
                <strong>Recuperar</strong>
                <small>Buscar fragmentos</small>
              </span>
              <span>
                <BookOpen size={18} />
                <strong>Dar contexto</strong>
                <small>Incluir tus fuentes</small>
              </span>
              <span>
                <Sparkles size={18} />
                <strong>Responder</strong>
                <small>Citar lo encontrado</small>
              </span>
            </div>
          </div>
          <p className="lab-credit">Lab 5 · Endpoint IA · React + TypeScript</p>
        </Modal>
      )}
    </div>
  );
}
