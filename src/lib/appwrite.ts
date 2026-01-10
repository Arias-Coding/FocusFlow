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
    HABITS_LOG: import.meta.env.VITE_APPWRITE_COLLECTION_HABITS_LOG_ID,
};


// --- SERVICIO DE HÁBITOS ---
export const habitService = {
    /**
     * Sincroniza datos iniciales (Seed)
     * Útil para la primera carga de la aplicación
     */
    async seedHabits(initialHabits: any[], initialHabitLogs: Record<string, any[]>) {
        try {
            // Guardar definiciones de hábitos
            for (const habit of initialHabits) {
                const { $id, ...data } = habit;
                await databases.createDocument(
                    DB_ID,
                    COLLECTIONS.HABITS,
                    $id, // Usamos el ID manual (habit_01...)
                    data
                );
            }

            // Guardar historial (logs)
            for (const habitId in initialHabitLogs) {
                const logs = initialHabitLogs[habitId];
                for (const log of logs) {
                    const { $id, ...logData } = log;
                    await databases.createDocument(
                        DB_ID,
                        COLLECTIONS.HABITS_LOG,
                        $id, // Usamos el ID manual (log_bool1...)
                        logData
                    );
                }
            }
            return { success: true };
        } catch (error) {
            console.error("Error en seedHabits:", error);
            throw error;
        }
    },

    // Obtener todos los hábitos de un usuario
    async getHabits(userId: string) {
        return await databases.listDocuments(
            DB_ID,
            COLLECTIONS.HABITS,
            [Query.equal("userId", userId)]
        );
    },

    // Obtener logs de un hábito específico
    async getHabitLogs(userId: string, habitId: string) {
        return await databases.listDocuments(
            DB_ID,
            COLLECTIONS.HABITS_LOG,
            [
                Query.equal("userId", userId),
                Query.equal("habitId", habitId),
                Query.orderDesc("date")
            ]
        );
    },

    // Crear un nuevo log (cuando marcas un hábito como hecho)
    async createLog(habitId: string, userId: string, date: string, value: number, completed: boolean) {
        if (!habitId || !userId || !date || value < 0) {
            throw new Error("Invalid log data");
        }
        return await databases.createDocument(
            DB_ID,
            COLLECTIONS.HABITS_LOG,
            ID.unique(),
            { habitId, userId, date: new Date(date + "T12:00:00").toISOString(), value, completed }
        );
    },

    // Crear un nuevo hábito
    async createHabit(userId: string, name: string, type: "boolean" | "count", frequency: string, unit?: string, target?: number) {
        if (!userId || !name.trim() || !["boolean", "count"].includes(type)) {
            throw new Error("Invalid habit data");
        }
        return await databases.createDocument(
            DB_ID,
            COLLECTIONS.HABITS,
            ID.unique(),
            { userId, name: name.trim(), type, frequency, active: true, streak: 0, unit: unit?.trim(), target }
        );
    },

    // Actualizar un hábito (nombre, meta, etc.)
    async updateHabit(documentId: string, data: Partial<{ name: string; active: boolean; target: number }>) {
        return await databases.updateDocument(
            DB_ID,
            COLLECTIONS.HABITS,
            documentId,
            data
        );
    },

    // Eliminar un hábito
    async deleteHabit(documentId: string) {
        return await databases.deleteDocument(
            DB_ID,
            COLLECTIONS.HABITS,
            documentId
        );
    },

    // Obtener todos los logs de hábitos del usuario
    async getAllHabitLogs(userId: string) {
        return await databases.listDocuments(
            DB_ID,
            COLLECTIONS.HABITS_LOG,
            [Query.equal("userId", userId), Query.orderDesc("date")]
        );
    },

    // Eliminar todos los logs de un hábito
    async deleteHabitLogs(habitId: string, userId: string) {
        const logs = await databases.listDocuments(
            DB_ID,
            COLLECTIONS.HABITS_LOG,
            [Query.equal("habitId", habitId), Query.equal("userId", userId)]
        );
        for (const log of logs.documents) {
            await databases.deleteDocument(DB_ID, COLLECTIONS.HABITS_LOG, log.$id);
        }
    }
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


// --- SERVICIO DE TAREAS ---
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
