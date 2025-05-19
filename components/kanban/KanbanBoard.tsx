"use client";

import { useState } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

import Column from './Column';
import TaskForm from './TaskForm';
import { generateId, initialBoardData } from './utils/initialData';
import { 
  BoardData, 
  Task, 
  TagType, 
  tagColors
} from './types';

export default function KanbanBoard() {
  const [boardData, setBoardData] = useState<BoardData>(initialBoardData);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editTaskData, setEditTaskData] = useState<Task | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newColumnDialogOpen, setNewColumnDialogOpen] = useState(false);
  
  // Konfiguriere Sensors für dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimale Bewegungsdistanz für Drag-Aktivierung
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // dnd-kit Drag-Handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(boardData.tasks[active.id]);
  };
  
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // Finde die Quellspalte der Task
    let sourceColumnId;
    for (const colId of boardData.columnOrder) {
      if (boardData.columns[colId].taskIds.includes(activeId)) {
        sourceColumnId = colId;
        break;
      }
    }

    // Finde die Zielspalte oder -task
    let destinationColumnId;

    // 1. Prüfe ob das Ziel eine Spalte ist
    if (boardData.columnOrder.includes(overId)) {
      destinationColumnId = overId;
    } else {
      // 2. Das Ziel ist vermutlich eine Task, finde ihre Spalte
      for (const colId of boardData.columnOrder) {
        if (boardData.columns[colId].taskIds.includes(overId)) {
          destinationColumnId = colId;
          break;
        }
      }
    }

    // Copy des aktuellen Boardstates
    const boardCopy = JSON.parse(JSON.stringify(boardData));

    // Gleiche Spalte - Neuanordnung innerhalb der Spalte
    if (sourceColumnId === destinationColumnId) {
      const column = boardCopy.columns[sourceColumnId];
      const taskIds = [...column.taskIds];

      // Finde die Positionen
      const sourceIndex = taskIds.indexOf(activeId);

      // Wenn das Ziel eine Task ist, finde deren Index
      const destinationIndex =
        overId !== destinationColumnId
          ? taskIds.indexOf(overId)
          : taskIds.length; // Wenn über der Spalte gedroppt, am Ende hinzufügen

      if (sourceIndex !== -1 && destinationIndex !== -1) {
        // Entferne das Element aus dem Array
        taskIds.splice(sourceIndex, 1);

        // Füge es an der neuen Position ein
        taskIds.splice(destinationIndex, 0, activeId);

        // Aktualisiere die Spalte
        boardCopy.columns[sourceColumnId].taskIds = taskIds;
      }
    } else if (sourceColumnId && destinationColumnId) {
      // Verschiedene Spalten - Task zwischen Spalten verschieben

      // Task aus Quellspalte entfernen
      const sourceTaskIndex =
        boardCopy.columns[sourceColumnId].taskIds.indexOf(activeId);
      if (sourceTaskIndex !== -1) {
        boardCopy.columns[sourceColumnId].taskIds.splice(sourceTaskIndex, 1);
      }

      // Wenn das Ziel eine Task ist, finde deren Index und füge es dort ein
      if (boardData.columnOrder.includes(overId)) {
        // Wenn über einer Spalte gedroppt, am Ende hinzufügen
        boardCopy.columns[destinationColumnId].taskIds.push(activeId);
      } else {
        // Wenn über einer Task gedroppt, an der richtigen Position einfügen
        const destinationTaskIds =
          boardCopy.columns[destinationColumnId].taskIds;
        const destinationIndex = destinationTaskIds.indexOf(overId);

        if (destinationIndex !== -1) {
          destinationTaskIds.splice(destinationIndex, 0, activeId);
        } else {
          // Fallback: Wenn Index nicht gefunden wird, am Ende hinzufügen
          destinationTaskIds.push(activeId);
        }
      }
    }

    // Update des Boardstates
    setBoardData(boardCopy);

    // Reset aktive Task
    setActiveTask(null);
  };
  
  // Neue Task hinzufügen
  const addNewTask = (taskData: Omit<Task, 'id'>) => {
    const newTaskId = `task-${generateId()}`;
    const newTask: Task = {
      id: newTaskId,
      ...taskData
    };
    
    // Task zur "To Do"-Spalte hinzufügen
    const todoColumn = boardData.columns.todo;
    const updatedTaskIds = [...todoColumn.taskIds, newTaskId];
    
    setBoardData({
      ...boardData,
      tasks: {
        ...boardData.tasks,
        [newTaskId]: newTask
      },
      columns: {
        ...boardData.columns,
        todo: {
          ...todoColumn,
          taskIds: updatedTaskIds
        }
      }
    });
    
    setDialogOpen(false);
  };
  
  // Task bearbeiten
  const startEditTask = (task: Task) => {
    setEditTaskData(task);
    setEditDialogOpen(true);
  };
  
  const saveEditTask = (taskData: Omit<Task, 'id'>) => {
    if (!editTaskData) return;
    
    setBoardData({
      ...boardData,
      tasks: {
        ...boardData.tasks,
        [editTaskData.id]: {
          ...taskData,
          id: editTaskData.id
        }
      }
    });
    
    setEditTaskData(null);
    setEditDialogOpen(false);
  };
  
  // Task löschen
  const deleteTask = (taskId: string) => {
    // Finde die Spalte, die die Task enthält
    let columnId;
    for (const colId of boardData.columnOrder) {
      if (boardData.columns[colId].taskIds.includes(taskId)) {
        columnId = colId;
        break;
      }
    }
    
    if (columnId) {
      const column = boardData.columns[columnId];
      const updatedTaskIds = column.taskIds.filter(id => id !== taskId);
      
      // Board-Daten kopieren und aktualisieren
      const updatedTasks = { ...boardData.tasks };
      delete updatedTasks[taskId];
      
      setBoardData({
        ...boardData,
        tasks: updatedTasks,
        columns: {
          ...boardData.columns,
          [columnId]: {
            ...column,
            taskIds: updatedTaskIds
          }
        }
      });
    }
  };
  
  // Neue Spalte hinzufügen
  const addNewColumn = () => {
    if (newColumnTitle.trim() === '') return;
    
    const newColumnId = `column-${generateId()}`;
    
    setBoardData({
      ...boardData,
      columns: {
        ...boardData.columns,
        [newColumnId]: {
          id: newColumnId,
          title: newColumnTitle,
          taskIds: []
        }
      },
      columnOrder: [...boardData.columnOrder, newColumnId]
    });
    
    setNewColumnTitle('');
    setNewColumnDialogOpen(false);
  };
  
  // Spalte löschen
  const deleteColumn = (columnId: string) => {
    if (boardData.columns[columnId].taskIds.length > 0) {
      alert('Diese Spalte enthält noch Tasks und kann nicht gelöscht werden.');
      return;
    }
    
    const updatedColumns = { ...boardData.columns };
    delete updatedColumns[columnId];
    
    const updatedColumnOrder = boardData.columnOrder.filter(id => id !== columnId);
    
    setBoardData({
      ...boardData,
      columns: updatedColumns,
      columnOrder: updatedColumnOrder
    });
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Neue Task
              </Button>
            </DialogTrigger>
            <TaskForm 
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onSave={addNewTask}
              title="Neue Task erstellen"
              description="Füge eine neue Task zu deinem Board hinzu."
              availableTags={Object.keys(tagColors) as TagType[]}
            />
          </Dialog>
          
          <Dialog open={newColumnDialogOpen} onOpenChange={setNewColumnDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Neue Spalte
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Spalte erstellen</DialogTitle>
                <DialogDescription>
                  Erstelle eine neue Spalte für dein Kanban Board.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Spaltentitel"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setNewColumnDialogOpen(false)}>Abbrechen</Button>
                <Button onClick={addNewColumn}>Erstellen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]);
            
            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                onEditTask={startEditTask}
                onDeleteTask={deleteTask}
                onDeleteColumn={deleteColumn}
              />
            );
          })}
          
          {/* DragOverlay zeigt die aktive Task während des Draggings */}
          <DragOverlay>
            {activeTask ? (
              <Card className="border shadow-md w-72">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium">{activeTask.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <CardDescription className="text-xs">{activeTask.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Badge className={`text-xs ${tagColors[activeTask.tag]}`}>
                    {activeTask.tag}
                  </Badge>
                </CardFooter>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      {/* Dialog zum Bearbeiten einer Task */}
      {editTaskData && (
        <TaskForm
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={editTaskData}
          onSave={saveEditTask}
          title="Task bearbeiten"
          description="Bearbeite die Details dieser Task."
          availableTags={Object.keys(tagColors) as TagType[]}
        />
      )}
    </div>
  );
}