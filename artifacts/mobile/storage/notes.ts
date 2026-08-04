import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '@/types';

const NOTES_KEY = '@codenotes:notes_v1';

export async function loadNotes(): Promise<Note[]> {
  try {
    const data = await AsyncStorage.getItem(NOTES_KEY);
    return data ? (JSON.parse(data) as Note[]) : [];
  } catch {
    return [];
  }
}

export async function saveNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
