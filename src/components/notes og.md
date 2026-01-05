VITE_APPWRITE_PROJECT_ID = "695c1d960039b265230f"
VITE_APPWRITE_PROJECT_NAME = "FocusFlow_DB"
VITE_APPWRITE_ENDPOINT = "https://sfo.cloud.appwrite.io/v1"
695c1e1e0014b86aa080

{--- OG ---}

export function Notes() {
const [notes, setNotes] = useState<Note[]>([
{
id: "1",
title: "Diseño de Interfaz",
content:
"# Conceptos Clave\n\n- [x] Refactorizar componentes\n- [ ] Implementar animaciones\n\n`const app = () => 'Better UI';` \n\n> El buen diseño es invisible.",
date: "05 ENE",
},
]);

const [selectedId, setSelectedId] = useState<string | null>(
notes[0]?.id || null
);
const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");

const activeNote = notes.find((n) => n.id === selectedId);

const addNote = () => {
const newNote: Note = {
id: Date.now().toString(),
title: "",
content: "",
date: new Date()
.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
.toUpperCase(),
};
setNotes([newNote, ...notes]);
setSelectedId(newNote.id);
setViewMode("edit");
};

const deleteNote = (id: string, e: React.MouseEvent) => {
e.stopPropagation();
const updatedNotes = notes.filter((n) => n.id !== id);
setNotes(updatedNotes);
if (selectedId === id) setSelectedId(updatedNotes[0]?.id || null);
};

const updateNote = (id: string, field: keyof Note, value: string) => {
setNotes(notes.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
};

return (

<div className="w-full max-w-6xl mx-auto h-[780px] flex gap-8 p-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
{/_ Sidebar Refinado _/}
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
