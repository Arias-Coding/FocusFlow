import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

import { useAuth } from "@/components/context/AuthContext"; // Importamos el usuario
import { noteService } from "@/lib/appwrite"; // Importamos el servicio

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

// --- Componente: Editor Refinado ---
function MarkdownEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (val: string) => void;
}) {
  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Escribe tus pensamientos aquí..."
      className="w-full bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-lg leading-relaxed min-h-[500px] font-sans text-foreground/80 placeholder:text-muted-foreground/30 selection:bg-primary/30"
    />
  );
}

// --- Componente: Preview Obsidian-Style ---
function MarkdownPreview({ content }: { content: string }) {
  return (
    <div
      className="prose prose-stone dark:prose-invert max-w-none 
      prose-headings:text-foreground prose-headings:tracking-tight prose-headings:font-bold
      prose-h1:text-4xl prose-h1:mb-6 prose-h1:pb-2 prose-h1:border-b prose-h1:border-border/50
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
      prose-p:text-muted-foreground prose-p:leading-8
      prose-strong:text-foreground
      prose-ul:my-6 prose-li:my-2
      prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/5 prose-pre:shadow-2xl
      prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-xl prose-blockquote:py-1
      [&_input[type='checkbox']]:mr-2 [&_input[type='checkbox']]:accent-primary"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "*No hay contenido para mostrar*"}
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

  // 1. Cargar notas
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      try {
        const data = await noteService.getNotes(user.$id);
        const formattedNotes = data.documents.map((doc: any) => ({
          id: doc.$id,
          title: doc.title,
          content: doc.content,
          date: doc.date,
        }));
        setNotes(formattedNotes);
        if (formattedNotes.length > 0) setSelectedId(formattedNotes[0].id);
      } catch (error) {
        console.error("Error cargando notas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  const activeNote = notes.find((n) => n.id === selectedId);

  // 2. Lógica de Debounce
  const debouncedNote = useDebounce(activeNote, 500);

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
    }
  }, [debouncedNote?.title, debouncedNote?.content]);

  // 3. Crear nota CORREGIDO
  const addNote = async () => {
    if (!user) {
      console.error("No hay usuario autenticado");
      return;
    }

    const newNoteData = {
      title: "Nueva nota",
      content: "",
      date: new Date()
        .toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        .toUpperCase(),
    };

    try {
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
        setNotes((prevNotes) => [createdNote, ...prevNotes]);

        // 3. La seleccionamos y entramos en modo edición
        setSelectedId(createdNote.id);
        setViewMode("edit");
      }
    } catch (error) {
      console.error("Error crítico al crear nota:", error);
      alert(
        "No se pudo crear la nota. Revisa la consola o los permisos de Appwrite."
      );
    }
  };

  // 4. Borrar nota
  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await noteService.deleteNote(id);
      setNotes((prev) => {
        const filtered = prev.filter((n) => n.id !== id);
        if (selectedId === id) setSelectedId(filtered[0]?.id || null);
        return filtered;
      });
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

  return (
    <div className="w-full max-w-7xl mx-auto h-auto lg:h-[85vh] flex flex-col lg:flex-row gap-0 lg:gap-6 p-0 lg:p-6 animate-in fade-in duration-700">
      {/* SIDEBAR: Estilo Panel de Control */}
      <aside
        className={cn(
          "w-full lg:w-[380px] flex flex-col bg-background lg:bg-transparent border-b lg:border-none",
          selectedId ? "hidden lg:flex" : "flex"
        )}
      >
        <div className="p-6 lg:p-0 space-y-6 flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
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
                      "font-bold truncate text-[16px] transition-colors",
                      selectedId === note.id
                        ? "text-primary"
                        : "text-foreground/80"
                    )}
                  >
                    {note.title || "Documento sin nombre"}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-md">
                      {note.date}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground/50 italic">
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

      {/* EDITOR: Estilo "Canvas" Ancho */}
      <Card
        className={cn(
          "flex-1 border-none lg:border border-border/40 bg-card/40 backdrop-blur-xl shadow-3xl lg:rounded-[40px] flex flex-col overflow-hidden transition-all duration-500",
          !selectedId ? "hidden lg:flex" : "flex"
        )}
      >
        {activeNote ? (
          <>
            {/* Toolbar Superior */}
            <header className="flex items-center justify-between px-6 lg:px-10 py-5 border-b border-border/10 bg-background/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedId(null)}
                className="lg:hidden rounded-full border-border/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex bg-muted/40 p-1 rounded-2xl border border-border/20 shadow-inner">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "rounded-xl h-9 px-6 font-bold text-xs transition-all",
                    viewMode === "preview"
                      ? "bg-card text-primary shadow-md"
                      : "text-muted-foreground"
                  )}
                >
                  Lectura
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("edit")}
                  className={cn(
                    "rounded-xl h-9 px-6 font-bold text-xs transition-all",
                    viewMode === "edit"
                      ? "bg-card text-primary shadow-md"
                      : "text-muted-foreground"
                  )}
                >
                  Escritura
                </Button>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Sincronizado
                </span>
              </div>
            </header>

            {/* Lienzo de Escritura */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto px-8 lg:px-16 py-12 lg:py-20">
                {/* Cabecera del Documento */}
                <div className="space-y-6 mb-12">
                  <div className="flex items-center gap-4 group">
                    <div className="h-10 w-1 bg-primary/30 group-hover:bg-primary transition-colors rounded-full" />
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) =>
                        updateNote(activeNote.id, "title", e.target.value)
                      }
                      className="text-3xl lg:text-5xl font-black bg-transparent border-none outline-none focus:ring-0 w-full tracking-tight placeholder:text-muted-foreground/10"
                      placeholder="Título del Proyecto"
                    />
                  </div>
                  <div className="flex items-center gap-6 px-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground/50 font-bold">
                        Última edición
                      </span>
                      <span className="text-xs font-semibold">
                        {activeNote.date}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-border/40" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground/50 font-bold">
                        Formato
                      </span>
                      <span className="text-xs font-semibold">
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
                      onChange={(val) =>
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
