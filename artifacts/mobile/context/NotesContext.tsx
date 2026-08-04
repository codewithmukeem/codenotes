import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Collection, Language, Note } from '@/types';
import { loadNotes, saveNotes } from '@/storage/notes';
import { loadCollections, saveCollections } from '@/storage/collections';
import { generateId } from '@/utils/noteUtils';

interface NotesContextValue {
  notes: Note[];
  collections: Collection[];
  isLoaded: boolean;
  createNote: (data: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  permanentlyDeleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  pinNote: (id: string, pinned: boolean) => void;
  favoriteNote: (id: string, fav: boolean) => void;
  archiveNote: (id: string, archived: boolean) => void;
  duplicateNote: (id: string) => Note;
  emptyTrash: () => void;
  createCollection: (name: string, icon: string) => Collection;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  getActiveNotes: () => Note[];
  getPinnedNotes: () => Note[];
  getFavoriteNotes: () => Note[];
  getArchivedNotes: () => Note[];
  getDeletedNotes: () => Note[];
  getNotesByCollection: (collectionId: string) => Note[];
  searchNotes: (query: string) => Note[];
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([loadNotes(), loadCollections()]).then(([n, c]) => {
      setNotes(n);
      setCollections(c);
      setIsLoaded(true);
    });
  }, []);

  const persistNotes = useCallback((next: Note[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNotes(next), 500);
  }, []);

  const persistCollections = useCallback((next: Collection[]) => {
    saveCollections(next);
  }, []);

  const createNote = useCallback(
    (data: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Note => {
      const now = Date.now();
      const note: Note = {
        id: generateId(),
        title: data.title ?? '',
        content: data.content ?? '',
        isPinned: data.isPinned ?? false,
        isFavorite: data.isFavorite ?? false,
        isArchived: data.isArchived ?? false,
        isDeleted: data.isDeleted ?? false,
        collectionId: data.collectionId ?? null,
        tags: data.tags ?? [],
        language: data.language ?? 'text',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      setNotes((prev) => {
        const next = [note, ...prev];
        persistNotes(next);
        return next;
      });
      return note;
    },
    [persistNotes],
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<Note>) => {
      setNotes((prev) => {
        const next = prev.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n,
        );
        persistNotes(next);
        return next;
      });
    },
    [persistNotes],
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.map((n) =>
          n.id === id
            ? { ...n, isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() }
            : n,
        );
        persistNotes(next);
        return next;
      });
    },
    [persistNotes],
  );

  const permanentlyDeleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        persistNotes(next);
        return next;
      });
    },
    [persistNotes],
  );

  const restoreNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.map((n) =>
          n.id === id
            ? { ...n, isDeleted: false, isArchived: false, deletedAt: null, updatedAt: Date.now() }
            : n,
        );
        persistNotes(next);
        return next;
      });
    },
    [persistNotes],
  );

  const pinNote = useCallback(
    (id: string, pinned: boolean) => updateNote(id, { isPinned: pinned }),
    [updateNote],
  );

  const favoriteNote = useCallback(
    (id: string, fav: boolean) => updateNote(id, { isFavorite: fav }),
    [updateNote],
  );

  const archiveNote = useCallback(
    (id: string, archived: boolean) =>
      updateNote(id, { isArchived: archived, isPinned: archived ? false : undefined }),
    [updateNote],
  );

  const duplicateNote = useCallback(
    (id: string): Note => {
      const source = notes.find((n) => n.id === id);
      if (!source) throw new Error('Note not found');
      return createNote({
        title: source.title ? `${source.title} (Copy)` : '',
        content: source.content,
        collectionId: source.collectionId,
        tags: source.tags,
        language: source.language,
      });
    },
    [notes, createNote],
  );

  const emptyTrash = useCallback(() => {
    setNotes((prev) => {
      const next = prev.filter((n) => !n.isDeleted);
      persistNotes(next);
      return next;
    });
  }, [persistNotes]);

  const createCollection = useCallback(
    (name: string, icon: string): Collection => {
      const now = Date.now();
      const col: Collection = {
        id: generateId(),
        name,
        icon,
        createdAt: now,
        updatedAt: now,
      };
      setCollections((prev) => {
        const next = [...prev, col];
        persistCollections(next);
        return next;
      });
      return col;
    },
    [persistCollections],
  );

  const updateCollection = useCallback(
    (id: string, updates: Partial<Collection>) => {
      setCollections((prev) => {
        const next = prev.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c,
        );
        persistCollections(next);
        return next;
      });
    },
    [persistCollections],
  );

  const deleteCollection = useCallback(
    (id: string) => {
      setCollections((prev) => {
        const next = prev.filter((c) => c.id !== id);
        persistCollections(next);
        return next;
      });
      setNotes((prev) => {
        const next = prev.map((n) =>
          n.collectionId === id ? { ...n, collectionId: null, updatedAt: Date.now() } : n,
        );
        persistNotes(next);
        return next;
      });
    },
    [persistCollections, persistNotes],
  );

  const getNoteById = useCallback((id: string) => notes.find((n) => n.id === id), [notes]);
  const getActiveNotes = useCallback(
    () =>
      notes
        .filter((n) => !n.isArchived && !n.isDeleted)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notes],
  );
  const getPinnedNotes = useCallback(
    () =>
      notes
        .filter((n) => n.isPinned && !n.isArchived && !n.isDeleted)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notes],
  );
  const getFavoriteNotes = useCallback(
    () =>
      notes
        .filter((n) => n.isFavorite && !n.isArchived && !n.isDeleted)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notes],
  );
  const getArchivedNotes = useCallback(
    () =>
      notes
        .filter((n) => n.isArchived && !n.isDeleted)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notes],
  );
  const getDeletedNotes = useCallback(
    () =>
      notes
        .filter((n) => n.isDeleted)
        .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)),
    [notes],
  );
  const getNotesByCollection = useCallback(
    (colId: string) =>
      notes
        .filter((n) => n.collectionId === colId && !n.isArchived && !n.isDeleted)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notes],
  );
  const searchNotes = useCallback(
    (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return [];
      return notes
        .filter(
          (n) =>
            !n.isDeleted &&
            (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)),
        )
        .sort((a, b) => b.updatedAt - a.updatedAt);
    },
    [notes],
  );

  return (
    <NotesContext.Provider
      value={{
        notes,
        collections,
        isLoaded,
        createNote,
        updateNote,
        deleteNote,
        permanentlyDeleteNote,
        restoreNote,
        pinNote,
        favoriteNote,
        archiveNote,
        duplicateNote,
        emptyTrash,
        createCollection,
        updateCollection,
        deleteCollection,
        getNoteById,
        getActiveNotes,
        getPinnedNotes,
        getFavoriteNotes,
        getArchivedNotes,
        getDeletedNotes,
        getNotesByCollection,
        searchNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
