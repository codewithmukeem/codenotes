import AsyncStorage from '@react-native-async-storage/async-storage';
import { Collection } from '@/types';

const COLLECTIONS_KEY = '@codenotes:collections_v1';

export async function loadCollections(): Promise<Collection[]> {
  try {
    const data = await AsyncStorage.getItem(COLLECTIONS_KEY);
    return data ? (JSON.parse(data) as Collection[]) : [];
  } catch {
    return [];
  }
}

export async function saveCollections(collections: Collection[]): Promise<void> {
  await AsyncStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}
