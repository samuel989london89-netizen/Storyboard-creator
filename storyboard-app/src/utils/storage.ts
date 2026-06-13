import type { Storyboard } from '../types';

const STORAGE_KEY = 'storyboard_ai_boards';

export function loadStoryboards(): Storyboard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Storyboard[];
  } catch {
    return [];
  }
}

export function saveStoryboard(board: Storyboard): void {
  const boards = loadStoryboards();
  const idx = boards.findIndex(b => b.id === board.id);
  if (idx >= 0) {
    boards[idx] = { ...board, updatedAt: Date.now() };
  } else {
    boards.unshift({ ...board, updatedAt: Date.now() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

export function deleteStoryboard(id: string): void {
  const boards = loadStoryboards().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

export function exportBackup(): void {
  const boards = loadStoryboards();
  const blob = new Blob([JSON.stringify(boards, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `storyboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file: File): Promise<Storyboard[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const boards = JSON.parse(e.target?.result as string) as Storyboard[];
        const existing = loadStoryboards();
        const merged = [...boards, ...existing.filter(b => !boards.find(nb => nb.id === b.id))];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        resolve(merged);
      } catch {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
