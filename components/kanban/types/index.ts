// Types für das Kanban Board
export type TagType = 'Design' | 'Backend' | 'Feature' | 'Testing' | 'UI' | 'DevOps' | 'Bug';

export interface Task {
  id: string;
  title: string;
  description: string;
  tag: TagType;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface BoardData {
  columns: {
    [key: string]: Column;
  };
  columnOrder: string[];
  tasks: {
    [key: string]: Task;
  };
}

// Typ-Definitionen für dnd-kit Events
export interface DragStartEvent {
  active: {
    id: string;
  };
}

export interface DragOverEvent {
  active: {
    id: string;
  };
  over: {
    id: string;
  } | null;
}

export interface DragEndEvent {
  active: {
    id: string;
  };
  over: {
    id: string;
  } | null;
}

// Tag-Farben
export const tagColors: Record<TagType, string> = {
  'Design': 'bg-blue-100 text-blue-800',
  'Backend': 'bg-green-100 text-green-800',
  'Feature': 'bg-purple-100 text-purple-800',
  'Testing': 'bg-yellow-100 text-yellow-800',
  'UI': 'bg-pink-100 text-pink-800',
  'DevOps': 'bg-gray-100 text-gray-800',
  'Bug': 'bg-red-100 text-red-800',
};