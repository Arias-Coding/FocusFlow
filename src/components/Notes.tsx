import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Eye, Edit3, Plus, Trash2, Hash } from "lucide-react";
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
    <div className="w-full max-w-6xl mx-auto h-[780px] flex gap-8 p-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Sidebar Refinado */}
      <aside className="w-[320px] flex flex-col gap-8 h-full">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <StickyNote className="text-primary h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Mis Notas</h2>
          </div>
          <Button
            onClick={addNote}
            size="icon"
            className="rounded-xl h-9 w-9 shadow-lg hover:scale-105 transition-transform"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 px-1 custom-scrollbar">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              className={cn(
                "group relative w-full p-4 rounded-2xl transition-all border cursor-pointer",
                selectedId === note.id
                  ? "bg-card border-primary/50 shadow-md shadow-primary/5"
                  : "bg-transparent border-transparent hover:bg-card/50 hover:border-border"
              )}
            >
              <div className="flex-1 truncate pr-6">
                <h3
                  className={cn(
                    "font-semibold truncate text-[15px]",
                    selectedId === note.id ? "text-primary" : "text-foreground"
                  )}
                >
                  {note.title || "Sin título"}
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground tracking-widest mt-2 block opacity-50">
                  {note.date}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => deleteNote(note.id, e)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </aside>

      {/* Editor Principal Refinado */}
      <Card className="flex-1 border border-border/50 bg-card/30 backdrop-blur-md shadow-2xl rounded-[32px] flex flex-col overflow-hidden">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between px-10 py-5 border-b border-border/40 bg-muted/10">
              <div className="flex bg-muted/50 p-1.5 rounded-xl border border-border/50">
                <Button
                  variant="ghost" // Usamos ghost como base
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "rounded-lg h-8 px-4 font-semibold text-xs transition-all",
                    viewMode === "preview"
                      ? "bg-card text-foreground shadow-sm" // Estilos activos: fondo de tarjeta y sombra
                      : "text-muted-foreground hover:bg-transparent hover:text-foreground" // Estilos inactivos
                  )}
                >
                  <Eye className="h-3.5 w-3.5 mr-2" /> Preview
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("edit")}
                  className={cn(
                    "rounded-lg h-8 px-4 font-semibold text-xs transition-all",
                    viewMode === "edit"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-transparent hover:text-foreground"
                  )}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-2" /> Editar
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="flex items-center gap-3 mb-8 opacity-40 group hover:opacity-100 transition-opacity">
                <Hash className="h-6 w-6 text-primary" />
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) =>
                    updateNote(activeNote.id, "title", e.target.value)
                  }
                  className="text-4xl font-bold bg-transparent border-none outline-none focus:ring-0 w-full tracking-tight placeholder:text-muted-foreground/20"
                  placeholder="Título de la nota..."
                />
              </div>

              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
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
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="bg-muted p-6 rounded-full animate-pulse">
              <StickyNote className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium italic">
              Selecciona una nota de tu colección
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
