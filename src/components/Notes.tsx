import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  StickyNote,
  Plus,
  Trash2,
  ChevronLeft,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn, saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";

import { useAuth } from "@/components/context/AuthContext"; // Importamos el usuario
import { noteService } from "@/lib/appwrite"; // Importamos el servicio

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

// --- Componente: Callout personalizado ---
function Callout({
  type,
  title,
  children,
}: {
  type: string;
  title?: string;
  children: React.ReactNode;
}) {
  const getCalloutConfig = (type: string) => {
    switch (type.toUpperCase()) {
      case "INFO":
        return {
          icon: Info,
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          iconColor: "text-blue-600 dark:text-blue-400",
          titleColor: "text-blue-900 dark:text-blue-100",
        };
      case "WARNING":
      case "WARN":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          titleColor: "text-yellow-900 dark:text-yellow-100",
        };
      case "SUCCESS":
      case "CHECK":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-200 dark:border-green-800",
          iconColor: "text-green-600 dark:text-green-400",
          titleColor: "text-green-900 dark:text-green-100",
        };
      case "ERROR":
      case "DANGER":
        return {
          icon: XCircle,
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
          iconColor: "text-red-600 dark:text-red-400",
          titleColor: "text-red-900 dark:text-red-100",
        };
      case "TIP":
      case "HINT":
        return {
          icon: Lightbulb,
          bgColor: "bg-purple-50 dark:bg-purple-950/20",
          borderColor: "border-purple-200 dark:border-purple-800",
          iconColor: "text-purple-600 dark:text-purple-400",
          titleColor: "text-purple-900 dark:text-purple-100",
        };
      case "NOTE":
        return {
          icon: StickyNote,
          bgColor: "bg-gray-50 dark:bg-gray-950/20",
          borderColor: "border-gray-200 dark:border-gray-800",
          iconColor: "text-gray-600 dark:text-gray-400",
          titleColor: "text-gray-900 dark:text-gray-100",
        };
      default:
        return {
          icon: Info,
          bgColor: "bg-primary/5",
          borderColor: "border-primary/30",
          iconColor: "text-primary",
          titleColor: "text-primary",
        };
    }
  };

  const config = getCalloutConfig(type);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "my-4 sm:my-6 md:my-8 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-l-4 shadow-sm",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Icon
          className={cn(
            "w-5 sm:w-6 h-5 sm:h-6 mt-0.5 flex-shrink-0",
            config.iconColor
          )}
        />
        <div className="flex-1 min-w-0">
          {title && (
            <div
              className={cn(
                "font-semibold text-xs sm:text-sm md:text-base mb-2",
                config.titleColor
              )}
            >
              {title}
            </div>
          )}
          <div className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed sm:leading-6 md:leading-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Función para copiar código ---
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Error al copiar:", err);
  });
}

// --- Componente: Bloque de código mejorado ---
function CodeBlock({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const language = className?.replace("language-", "") || "text";

  const handleCopy = () => {
    copyToClipboard(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 sm:my-6 md:my-8 rounded-lg sm:rounded-xl border border-primary/10 overflow-hidden shadow-lg">
      <div className="bg-primary/10 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-primary/10">
        <span className="text-xs sm:text-sm font-mono text-primary uppercase font-semibold">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 sm:h-4 sm:w-4" /> Copiado
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" /> Copiar
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        className="!bg-zinc-950 !m-0 text-xs sm:text-sm md:text-base rounded-b-lg"
        showLineNumbers={true}
        wrapLongLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

// --- Componente: Editor Refinado ---
function MarkdownEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (val: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (e.target) {
      e.target.style.height = "auto";
      e.target.style.height = e.target.scrollHeight + "px";
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      placeholder="Escribe tus pensamientos aquí..."
      className="w-full bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-base sm:text-lg md:text-xl lg:text-2xl leading-7 sm:leading-8 md:leading-9 lg:leading-10 min-h-[400px] font-sans text-foreground/80 placeholder:text-muted-foreground/30 selection:bg-primary/30 overflow-hidden"
    />
  );
}

// --- Componente: Preview Obsidian-Style ---
function MarkdownPreview({ content }: { content: string }) {
  // Procesar callouts antes de renderizar
  const processCallouts = (text: string): string => {
    const calloutRegex = /^>\s*\[!(.*?)\](?:\s+(.*?))?\n((?:>.*\n?)*)/gm;

    return text.replace(
      calloutRegex,
      (_match: string, type: string, title: string, content: string) => {
        const processedContent = content
          .split("\n")
          .filter((line: string) => line.startsWith(">"))
          .map((line: string) => line.substring(1).trim())
          .join("\n");

        return `<div data-callout="${type}" data-title="${
          title || ""
        }" data-content="${processedContent.replace(/"/g, "&quot;")}"></div>`;
      }
    );
  };

  const processedContent = processCallouts(content);

  return (
    <div
      className="prose prose-stone dark:prose-invert max-w-none 
      prose-headings:text-foreground prose-headings:tracking-tight prose-headings:font-bold
      prose-h1:text-2xl prose-h1:mb-4 prose-h1:pb-2 prose-h1:border-b prose-h1:border-border/50 prose-h1:mt-6
      prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-primary prose-h2:border-b prose-h2:border-primary/20 prose-h2:pb-1
      prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-primary/80
      prose-h4:text-base prose-h4:mt-4 prose-h4:mb-2
      prose-h5:text-sm prose-h5:mt-4 prose-h5:mb-2 prose-h5:font-semibold
      prose-h6:text-sm prose-h6:mt-4 prose-h6:mb-2 prose-h6:font-semibold prose-h6:text-muted-foreground
      prose-p:text-muted-foreground prose-p:leading-7 prose-p:mb-4 prose-p:text-base sm:prose-p:text-lg sm:prose-p:leading-8 md:prose-p:text-xl md:prose-p:leading-9 lg:prose-p:text-2xl lg:prose-p:leading-10 sm:prose-p:mb-5 md:prose-p:mb-6
      prose-li:text-base sm:prose-li:text-lg md:prose-li:text-xl lg:prose-li:text-2xl prose-li:marker:text-primary
      prose-ul:my-4 sm:prose-ul:my-6 md:prose-ul:my-8 prose-ul:ml-6 sm:prose-ul:ml-8 md:prose-ul:ml-10 prose-ul:space-y-2 sm:prose-ul:space-y-3 md:prose-ul:space-y-4 prose-ul:list-outside prose-ul:list-disc
      prose-ol:my-4 sm:prose-ol:my-6 md:prose-ol:my-8 prose-ol:ml-6 sm:prose-ol:ml-8 md:prose-ol:ml-10 prose-ol:space-y-2 sm:prose-ol:space-y-3 md:prose-ol:space-y-4 prose-ol:list-outside prose-ol:list-decimal
      prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:rounded-r-md prose-blockquote:text-sm
      prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
      prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/5 prose-pre:shadow-2xl prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto prose-pre:text-xs
      prose-pre code:bg-transparent prose-pre code:text-zinc-100 prose-pre code:px-0 prose-pre code:py-0
      prose-hr:border-border/50 prose-hr:my-6
      prose-table:border-collapse prose-table:border prose-table:border-border/50 prose-table:my-4 prose-table:text-xs
      prose-th:bg-muted/50 prose-th:border prose-th:border-border/50 prose-th:px-2 prose-th:py-1 prose-th:text-left prose-th:font-semibold prose-th:text-xs
      prose-td:border prose-td:border-border/50 prose-td:px-2 prose-td:py-1 prose-td:text-xs
      prose-a:text-primary prose-a:underline prose-a:underline-offset-2 prose-a:decoration-primary/50 hover:prose-a:decoration-primary
      prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-border/50 prose-img:max-w-full
      sm:prose-h1:text-3xl sm:prose-h1:mb-6 sm:prose-h1:mt-8
      sm:prose-h2:text-2xl sm:prose-h2:mt-10 sm:prose-h2:mb-4
      sm:prose-h3:text-xl sm:prose-h3:mt-8 sm:prose-h3:mb-3
      sm:prose-blockquote:pl-6 sm:prose-blockquote:text-base
      sm:prose-code:px-1.5 sm:prose-code:py-0.5 sm:prose-code:text-sm
      sm:prose-pre:p-4 sm:prose-pre:text-sm
      sm:prose-table:text-sm sm:prose-th:px-4 sm:prose-th:py-2 sm:prose-th:text-sm sm:prose-td:px-4 sm:prose-td:py-2 sm:prose-td:text-sm
      md:prose-h1:text-4xl md:prose-h1:text-5xl md:prose-h2:text-3xl md:prose-h3:text-2xl"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground mb-4 sm:mb-6 pb-2 border-b border-border/50 mt-6 sm:mt-8 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary mb-3 sm:mb-4 pb-1 border-b border-primary/20 mt-8 sm:mt-10">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-primary/80 mb-2 sm:mb-3 mt-6 sm:mt-8">
              {children}
            </h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 sm:pl-6 italic bg-primary/5 py-2 rounded-r-md my-4 sm:my-6 text-sm sm:text-base md:text-lg">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            // Check if it's inline code (no className or specific className)
            const isInline = !className || !className.includes("language-");
            if (isInline) {
              return (
                <code className="text-primary bg-primary/10 px-1 sm:px-1.5 py-0.5 rounded text-xs sm:text-sm md:text-base font-mono">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => {
            // Extract text content from code element
            const codeElement = React.Children.toArray(children).find(
              (child) => React.isValidElement(child) && child.type === "code"
            ) as
              | React.ReactElement<{
                  children?: React.ReactNode;
                  className?: string;
                }>
              | undefined;

            const codeContent = codeElement?.props?.children
              ? String(codeElement.props.children)
              : String(children);

            const className = codeElement?.props?.className;

            return <CodeBlock className={className}>{codeContent}</CodeBlock>;
          },
          mark: ({ children }) => (
            <mark className="bg-primary/20 dark:bg-primary/30 text-primary font-semibold px-1 py-0.5 rounded-sm">
              {children}
            </mark>
          ),
          div: ({ children, ...props }) => {
            // Handle callouts - check if this div has callout data attributes
            const calloutType = (props as any)["data-callout"];
            const calloutTitle = (props as any)["data-title"];
            const calloutContent = (props as any)["data-content"];

            if (calloutType) {
              return (
                <Callout type={calloutType} title={calloutTitle || undefined}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <>{children}</>,
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      code: ({ children, className }) => {
                        const isInline =
                          !className || !className.includes("language-");
                        if (isInline) {
                          return (
                            <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          );
                        }
                        return <code className={className}>{children}</code>;
                      },
                      mark: ({ children }) => (
                        <mark className="bg-primary/20 dark:bg-primary/30 text-primary font-semibold px-1 py-0.5 rounded-sm">
                          {children}
                        </mark>
                      ),
                    }}
                  >
                    {calloutContent}
                  </ReactMarkdown>
                </Callout>
              );
            }
            return <div {...props}>{children}</div>;
          },
          ul: ({ children }) => (
            <ul className="my-4 sm:my-6 md:my-8 space-y-2 sm:space-y-3 md:space-y-4 ml-6 sm:ml-8 md:ml-10 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 sm:my-6 md:my-8 space-y-2 sm:space-y-3 md:space-y-4 ml-6 sm:ml-8 md:ml-10 list-none">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const isNested = (props as any).className?.includes("nested");
            const isOrdered = (props as any).className?.includes("ol");
            let counter = 1;

            return (
              <li
                className="text-muted-foreground leading-7 sm:leading-8 md:leading-9 text-lg sm:text-xl md:text-2xl lg:text-2xl my-1 sm:my-2 relative pl-6 sm:pl-8"
                style={
                  {
                    listStyleType: "none",
                    marginLeft: isNested ? "1.5rem" : "0",
                    counterIncrement: isOrdered ? "item" : "none",
                  } as React.CSSProperties
                }
              >
                {isOrdered ? (
                  <span className="absolute left-0 text-primary font-bold">
                    {`${(props as any).value || counter}.`}
                  </span>
                ) : (
                  <span className="absolute left-0 text-primary text-lg">
                    {isNested ? "◎" : "◉"}
                  </span>
                )}
                {children}
              </li>
            );
          },
          p: ({ children }) => (
            <p className="text-muted-foreground leading-7 sm:leading-8 md:leading-9 mb-4 sm:mb-5 md:mb-6 last:mb-0 text-lg sm:text-xl md:text-2xl lg:text-2xl">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="text-foreground font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-foreground/90 italic">{children}</em>
          ),
          hr: () => <hr className="border-border/50 my-6 sm:my-8 md:my-10" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 sm:my-6 md:my-8">
              <table className="border-collapse border border-border/50 min-w-full text-xs sm:text-sm md:text-base">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-muted/50 border border-border/50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm md:text-base">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border/50 px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-2 decoration-primary/50 hover:decoration-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");

  const [height, setHeight] = useState<number | undefined>();

  useEffect(() => {
    const contenido = document.getElementById(`${selectedId}`);
    setHeight(contenido?.scrollHeight);

    const card = document.getElementById(`card`);
    console.log(card);
  }, [selectedId]);

  // 1. Cargar notas
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) {
        // Load from localStorage if no user
        const localNotes = loadFromLocalStorage("notes") || [];
        setNotes(localNotes);
        if (localNotes.length > 0) setSelectedId(localNotes[0].id);
        setIsLoading(false);
        return;
      }

      try {
        const data = await noteService.getNotes(user.$id);
        const formattedNotes = data.documents.map((doc: any) => ({
          id: doc.$id,
          title: doc.title,
          content: doc.content,
          date: doc.date,
        }));
        setNotes(formattedNotes.reverse());
        if (formattedNotes.length > 0) setSelectedId(formattedNotes[0].id);
        // Save to localStorage as backup
        saveToLocalStorage("notes", formattedNotes);
      } catch (error) {
        console.error("Error cargando notas:", error);
        // Fallback to localStorage
        const localNotes = loadFromLocalStorage("notes") || [];
        setNotes(localNotes);
        if (localNotes.length > 0) setSelectedId(localNotes[0].id);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  const activeNote = notes.find((n) => n.id === selectedId);

  // 2. Lógica de Debounce
  const debouncedNote = useDebounce(activeNote, 2000);

  useEffect(() => {
    // IMPORTANTE: Solo disparar si la nota tiene ID y no estamos cargando
    if (debouncedNote?.id && !isLoading) {
      const syncWithAppwrite = async () => {
        try {
          await noteService.updateNote(debouncedNote.id, {
            title: debouncedNote.title,
            content: debouncedNote.content,
          });
          console.log("☁️ Sincronizado");
        } catch (error) {
          console.error("Error en autosave:", error);
        }
      };
      syncWithAppwrite();

      // Always save to localStorage for offline persistence
      const updatedNotes = notes.map((note) =>
        note.id === debouncedNote.id ? debouncedNote : note
      );
      saveToLocalStorage("notes", updatedNotes);
    }
  }, [debouncedNote?.title, debouncedNote?.content]);

  // 3. Crear nota CORREGIDO
  const addNote = async () => {
    const newNoteData = {
      title: "Nueva nota",
      content: "",
      date: new Date()
        .toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        .toUpperCase(),
    };

    try {
      if (user) {
        // 1. Llamada a Appwrite
        const res = await noteService.createNote(
          user.$id,
          newNoteData.title,
          newNoteData.content,
          newNoteData.date
        );

        if (res?.$id) {
          const createdNote = { id: res.$id, ...newNoteData };

          // 2. Actualizamos el estado asegurando que la nueva nota sea la primera
          const updatedNotes = [createdNote, ...notes];
          setNotes(updatedNotes);

          // 3. La seleccionamos y entramos en modo edición
          setSelectedId(createdNote.id);
          setViewMode("edit");

          // Save to localStorage
          saveToLocalStorage("notes", updatedNotes);
        }
      } else {
        // Offline mode - create local note
        const localNote = { id: `local-${Date.now()}`, ...newNoteData };
        const updatedNotes = [localNote, ...notes];
        setNotes(updatedNotes);
        setSelectedId(localNote.id);
        setViewMode("edit");
        saveToLocalStorage("notes", updatedNotes);
      }
    } catch (error) {
      console.error("Error crítico al crear nota:", error);
      // Fallback to local storage
      const localNote = { id: `local-${Date.now()}`, ...newNoteData };
      const updatedNotes = [localNote, ...notes];
      setNotes(updatedNotes);
      setSelectedId(localNote.id);
      setViewMode("edit");
      saveToLocalStorage("notes", updatedNotes);
    }
  };

  // 4. Borrar nota
  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    if (selectedId === id) setSelectedId(updatedNotes[0]?.id || null);

    // Save to localStorage immediately
    saveToLocalStorage("notes", updatedNotes);

    try {
      if (user) {
        await noteService.deleteNote(id);
      }
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  };

  // 5. Actualizar localmente
  const updateNote = (id: string, field: keyof Note, value: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse font-bold tracking-widest opacity-50">
        SINCRONIZANDO NUBE...
      </div>
    );

  //    h-[${height}px]

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-0 lg:gap-6 p-0 lg:p-6 animate-in fade-in duration-700 relative">
      {/* SIDEBAR: Estilo Panel de Control - Bloque Separado */}

      <aside
        className={cn(
          "lg:flex flex-col w-full lg:w-93 bg-card border-none lg:sticky lg:top-20 h-fit",
          selectedId ? "hidden lg:flex" : "flex"
        )}
      >
        <div className="p-6 lg:p-0 space-y-6 flex flex-col max-h-[calc(100vh-120px)]">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Notas
              </h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {notes.length} Documentos guardados
              </p>
            </div>
            <Button
              onClick={addNote}
              className="rounded-2xl h-11 w-11 shadow-xl bg-primary hover:bg-primary/90 transition-all hover:rotate-90"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          {/* Buscador o Filtro (Espacio para futura funcionalidad) */}
          <div className="relative px-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="w-full h-10 bg-muted/30 rounded-xl border border-border/50" />
          </div>

          {/* Lista de Notas */}
          <div className="flex-1 overflow-y-auto space-y-2 px-1 custom-scrollbar pr-2">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={cn(
                  "group relative w-full p-5 rounded-[22px] transition-all duration-300 border",
                  selectedId === note.id
                    ? "bg-card border-primary/40 shadow-xl shadow-primary/5 ring-1 ring-primary/10"
                    : "bg-transparent border-transparent hover:bg-muted/30"
                )}
              >
                <div className="space-y-2">
                  <h3
                    className={cn(
                      "font-bold truncate text-[20px] transition-colors",
                      selectedId === note.id
                        ? "text-primary"
                        : "text-foreground/80"
                    )}
                  >
                    {note.title || "Documento sin nombre"}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-black uppercase tracking-tighter text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-md">
                      {note.date}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[15px] text-muted-foreground/50 italic">
                      {note.content?.length || 0} caracteres
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => deleteNote(note.id, e)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 lg:group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* EDITOR: Estilo "Canvas" Ancho - Bloque Separado */}
      <Card
        className={cn(
          "flex-1 border-none lg:border border-border/40 bg-card/40 backdrop-blur-xl shadow-3xl lg:rounded-[40px] flex flex-col transition-all duration-500",
          !selectedId ? "hidden lg:flex" : "flex"
        )}
        id={`${selectedId}`}
      >
        {activeNote ? (
          <>
            {/* Toolbar Superior */}
            <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 sm:py-5 border-b border-border/10 bg-background/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedId(null)}
                className="lg:hidden rounded-full border-border/50 h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex bg-muted/40 p-1 rounded-2xl border border-border/20 shadow-inner mx-auto lg:mx-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "rounded-xl h-8 sm:h-9 px-3 sm:px-6 font-bold text-xs transition-all",
                    viewMode === "preview"
                      ? "bg-card text-primary shadow-md"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="hidden sm:inline">Lectura</span>
                  <span className="sm:hidden">Ver</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("edit")}
                  className={cn(
                    "rounded-xl h-8 sm:h-9 px-3 sm:px-6 font-bold text-xs transition-all",
                    viewMode === "edit"
                      ? "bg-card text-primary shadow-md"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="hidden sm:inline">Escritura</span>
                  <span className="sm:hidden">Editar</span>
                </Button>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Sincronizado
                </span>
              </div>

              {/* Mobile sync indicator */}
              <div className="lg:hidden flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
              </div>
            </header>

            {/* Lienzo de Escritura */}
            <div className="flex-1 ">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12 min-h-full">
                {/* Cabecera del Documento */}
                <div className="space-y-3 sm:space-y-4 md:space-y-6 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="h-6 sm:h-7 md:h-8 w-1 sm:w-1.5 bg-primary/30 group-hover:bg-primary transition-colors rounded-full" />
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) =>
                        updateNote(activeNote.id, "title", e.target.value)
                      }
                      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black bg-transparent border-none outline-none focus:ring-0 w-full tracking-tight placeholder:text-muted-foreground/10"
                      placeholder="Título del Proyecto"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-3 sm:px-5">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] uppercase text-muted-foreground/50 font-bold">
                        Última edición
                      </span>
                      <span className="text-xs sm:text-sm font-semibold">
                        {activeNote.date}
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-6 bg-border/40" />
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] uppercase text-muted-foreground/50 font-bold">
                        Formato
                      </span>
                      <span className="text-xs sm:text-sm font-semibold">
                        Markdown / UTF-8
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="prose prose-stone dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-2 duration-1000">
                  {viewMode === "edit" ? (
                    <MarkdownEditor
                      content={activeNote.content}
                      onChange={(val: string) =>
                        updateNote(activeNote.id, "content", val)
                      }
                    />
                  ) : (
                    <MarkdownPreview content={activeNote.content} />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-6 p-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-card border border-border/50 p-8 rounded-[30px] shadow-2xl">
                <StickyNote className="h-16 w-16 text-primary/40" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Tu espacio de pensamiento</h3>
              <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                Selecciona una nota de la izquierda o crea una nueva para
                empezar a capturar tus ideas.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
