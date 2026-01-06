import { Client, Account, Databases, ID, Query } from 'appwrite';

// Inicialización del Cliente
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

// IDs de tus colecciones (Cámbialos por tus IDs reales de la consola)
export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
    NOTES: import.meta.env.VITE_APPWRITE_COLLECTION_NOTES_ID,
    HABITS: import.meta.env.VITE_APPWRITE_COLLECTION_HABITS_ID,
    TASKS: import.meta.env.VITE_APPWRITE_COLLECTION_TASKS_ID,
    GOALS: import.meta.env.VITE_APPWRITE_COLLECTION_GOALS_ID,
};

// --- SERVICIO DE NOTAS ---
export const noteService = {
    // Crear una nota
    async createNote(userId: string, title: string, content: string, date: string) {
        return await databases.createDocument(
            DB_ID,
            COLLECTIONS.NOTES,
            ID.unique(),
            { userId, title, content, date }
        );
    },

    // Obtener todas las notas del usuario logueado
    async getNotes(userId: string) {
        return await databases.listDocuments(
            DB_ID,
            COLLECTIONS.NOTES,
            [Query.equal("userId", userId)]
        );
    },

    // Actualizar una nota existente
    async updateNote(documentId: string, data: { title?: string; content?: string }) {
        return await databases.updateDocument(
            DB_ID,
            COLLECTIONS.NOTES,
            documentId,
            data
        );
    },

    // Borrar una nota
    async deleteNote(documentId: string) {
        return await databases.deleteDocument(
            DB_ID,
            COLLECTIONS.NOTES,
            documentId
        );
    }
};

export const taskService = {
    async createTask(userId: string, text: string) {
        return await databases.createDocument(
            DB_ID,
            import.meta.env.VITE_APPWRITE_COLLECTION_TASKS_ID,
            ID.unique(),
            { userId, text, completed: false }
        );
    },

    async getTasks(userId: string) {
        return await databases.listDocuments(
            DB_ID,
            import.meta.env.VITE_APPWRITE_COLLECTION_TASKS_ID,
            [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
        );
    },

    async toggleTask(documentId: string, completed: boolean) {
        return await databases.updateDocument(
            DB_ID,
            import.meta.env.VITE_APPWRITE_COLLECTION_TASKS_ID,
            documentId,
            { completed }
        );
    },

    async deleteTask(documentId: string) {
        return await databases.deleteDocument(
            DB_ID,
            import.meta.env.VITE_APPWRITE_COLLECTION_TASKS_ID,
            documentId
        );
    }
};

export const habitService = {
  async createHabit(userId: string, name: string) {
    return await databases.createDocument(
      DB_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_HABITS_ID,
      ID.unique(),
      { userId, name, streak: 0, completedDays: [] }
    );
  },

  async getHabits(userId: string) {
    return await databases.listDocuments(
      DB_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_HABITS_ID,
      [Query.equal("userId", userId)]
    );
  },

  async updateHabitDays(documentId: string, days: string[], streak: number) {
    return await databases.updateDocument(
      DB_ID,
      import.meta.env.VITE_APPWRITE_COLLECTION_HABITS_ID,
      documentId,
      { completedDays: days, streak: streak }
    );
  }
};

// --- SERVICIO DE OBJETIVOS ---
export const goalService = {
  async createGoal(userId: string, title: string, description: string, year: number) {
    return await databases.createDocument(
      DB_ID,
      COLLECTIONS.GOALS,
      ID.unique(),
      { userId, title, description, completed: false, year }
    );
  },

  async getGoals(userId: string, year: number) {
    return await databases.listDocuments(
      DB_ID,
      COLLECTIONS.GOALS,
      [Query.equal("userId", userId), Query.equal("year", year)]
    );
  },

  async toggleGoal(documentId: string, completed: boolean) {
    return await databases.updateDocument(
      DB_ID,
      COLLECTIONS.GOALS,
      documentId,
      { completed }
    );
  }
};