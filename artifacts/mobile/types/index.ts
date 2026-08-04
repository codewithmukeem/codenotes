export type Language =
  | 'text'
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'sql'
  | 'c'
  | 'cpp'
  | 'java'
  | 'bash'
  | 'xml'
  | 'yaml';

export interface Collection {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  collectionId: string | null;
  tags: string[];
  language: Language;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}
