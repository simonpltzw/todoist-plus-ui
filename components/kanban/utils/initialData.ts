import { BoardData } from "../types";

// Einzigartige ID generieren
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Anfängliche Dummy-Daten für das Board
export const initialBoardData: BoardData = {
  columns: {
    todo: {
      id: 'todo',
      title: 'To Do',
      taskIds: ['task-1', 'task-2', 'task-3']
    },
    inProgress: {
      id: 'inProgress',
      title: 'In Progress',
      taskIds: ['task-4', 'task-5']
    },
    done: {
      id: 'done',
      title: 'Done',
      taskIds: ['task-6']
    }
  },
  columnOrder: ['todo', 'inProgress', 'done'],
  tasks: {
    'task-1': { id: 'task-1', title: 'Website-Design', description: 'Erstellen eines neuen UI-Designs', tag: 'Design' },
    'task-2': { id: 'task-2', title: 'API-Dokumentation', description: 'REST-API dokumentieren', tag: 'Backend' },
    'task-3': { id: 'task-3', title: 'Login-System implementieren', description: 'JWT Authentication', tag: 'Feature' },
    'task-4': { id: 'task-4', title: 'Komponententests', description: 'Unit-Tests für React-Komponenten', tag: 'Testing' },
    'task-5': { id: 'task-5', title: 'Mobile Responsive', description: 'Mobilanpassung der Hauptseite', tag: 'UI' },
    'task-6': { id: 'task-6', title: 'Deployment-Pipeline', description: 'CI/CD-Pipeline einrichten', tag: 'DevOps' }
  }
};