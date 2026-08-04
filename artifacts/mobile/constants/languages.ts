import { Language } from '@/types';

export interface LanguageInfo {
  id: Language;
  label: string;
  extension: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { id: 'text', label: 'Plain Text', extension: 'txt' },
  { id: 'python', label: 'Python', extension: 'py' },
  { id: 'javascript', label: 'JavaScript', extension: 'js' },
  { id: 'typescript', label: 'TypeScript', extension: 'ts' },
  { id: 'html', label: 'HTML', extension: 'html' },
  { id: 'css', label: 'CSS', extension: 'css' },
  { id: 'json', label: 'JSON', extension: 'json' },
  { id: 'markdown', label: 'Markdown', extension: 'md' },
  { id: 'sql', label: 'SQL', extension: 'sql' },
  { id: 'c', label: 'C', extension: 'c' },
  { id: 'cpp', label: 'C++', extension: 'cpp' },
  { id: 'java', label: 'Java', extension: 'java' },
  { id: 'bash', label: 'Bash', extension: 'sh' },
  { id: 'xml', label: 'XML', extension: 'xml' },
  { id: 'yaml', label: 'YAML', extension: 'yaml' },
];

export function getLanguageLabel(id: Language): string {
  return LANGUAGES.find((l) => l.id === id)?.label ?? id;
}
