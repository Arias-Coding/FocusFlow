import { create } from "zustand";
import { noteService } from "@/lib/appwrite";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface NotesState {
  notes: Note[];
  selectedId: string | null;
  loading: boolean;
  newNoteTitle: string;

  // Actions
  fetchNotes: (userId?: string) => Promise<void>;
  createNote: (userId: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  setNewNoteTitle: (title: string) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedId: null,
  loading: true,
  newNoteTitle: "",

  setNewNoteTitle: (title) => set({ newNoteTitle: title }),

  fetchNotes: async (userId?: string) => {
    set({ loading: true });
    try {
      if (!userId) {
        // Load from localStorage if no user
        const localNotes = loadFromLocalStorage("notes") || [];
        set({ notes: localNotes });
        if (localNotes.length > 0) set({ selectedId: localNotes[0].id });
        set({ loading: false });
        return;
      }

      const data = await noteService.getNotes(userId);
      const formattedNotes = data.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        content: doc.content,
        date: doc.date,
      })).reverse();

      set({ notes: formattedNotes });
      if (formattedNotes.length > 0) set({ selectedId: formattedNotes[0].id });
      // Save to localStorage as backup
      saveToLocalStorage("notes", formattedNotes);
    } catch (error) {
      console.error("Error cargando notas:", error);
      // Fallback to localStorage
      const localNotes = loadFromLocalStorage("notes") || [];
      set({ notes: localNotes });
      if (localNotes.length > 0) set({ selectedId: localNotes[0].id });
    } finally {
      set({ loading: false });
    }
  },

  createNote: async (userId: string) => {
    const { newNoteTitle, notes } = get();
    if (!newNoteTitle.trim() || !userId) return;

    try {
      const date = new Date().toISOString().split('T')[0];
      const createdNote = await noteService.createNote(userId, newNoteTitle, "", date);

      const newNote: Note = {
        id: createdNote.$id,
        title: newNoteTitle,
        content: "",
        date,
      };

      const updatedNotes = [newNote, ...notes];
      set({ notes: updatedNotes, selectedId: newNote.id, newNoteTitle: "" });
      saveToLocalStorage("notes", updatedNotes);
    } catch (error) {
      console.error("Error creando nota:", error);
      // Create local note for offline functionality
      const date = new Date().toISOString().split('T')[0];
      const localNote: Note = {
        id: `local-${Date.now()}`,
        title: newNoteTitle,
        content: "",
        date,
      };

      const updatedNotes = [localNote, ...notes];
      set({ notes: updatedNotes, selectedId: localNote.id, newNoteTitle: "" });
      saveToLocalStorage("notes", updatedNotes);
    }
  },

  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    const { notes } = get();
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, ...updates } : note
    );
    set({ notes: updatedNotes });
    saveToLocalStorage("notes", updatedNotes);

    // Debounced save to server (implement debouncing in component or use effect)
    // This will be handled by a useEffect in the component that watches for changes
  },

  deleteNote: async (id: string) => {
    const { notes, selectedId } = get();
    const updatedNotes = notes.filter(note => note.id !== id);

    // Select another note if the deleted one was selected
    let newSelectedId = selectedId;
    if (selectedId === id) {
      const deletedIndex = notes.findIndex(note => note.id === id);
      if (updatedNotes.length > 0) {
        newSelectedId = updatedNotes[Math.min(deletedIndex, updatedNotes.length - 1)].id;
      } else {
        newSelectedId = null;
      }
    }

    set({ notes: updatedNotes, selectedId: newSelectedId });
    saveToLocalStorage("notes", updatedNotes);

    try {
      await noteService.deleteNote(id);
    } catch (error) {
      console.error("Error eliminando nota:", error);
      // Restore on error
      set({ notes, selectedId });
      saveToLocalStorage("notes", notes);
    }
  },

  selectNote: (id: string | null) => set({ selectedId: id }),
}));