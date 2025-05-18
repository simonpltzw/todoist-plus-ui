"use client";

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MoreVertical } from 'lucide-react';

// Define types for our Kanban board
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  content: string;
  priority: TaskPriority;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface ColumnsState {
  [key: string]: Column;
}

// Initial data for our Kanban board
const initialColumns: ColumnsState = {
  todo: {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: 'task-1', content: 'Research UI libraries', priority: 'medium' },
      { id: 'task-2', content: 'Set up project structure', priority: 'high' },
      { id: 'task-3', content: 'Create wireframes', priority: 'low' },
    ],
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    tasks: [
      { id: 'task-4', content: 'Implement authentication', priority: 'high' },
      { id: 'task-5', content: 'Design database schema', priority: 'medium' },
    ],
  },
  review: {
    id: 'review',
    title: 'Review',
    tasks: [
      { id: 'task-6', content: 'Code review for PR #123', priority: 'high' },
    ],
  },
  done: {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 'task-7', content: 'Initial project setup', priority: 'medium' },
      { id: 'task-8', content: 'Team meeting', priority: 'low' },
    ],
  },
};

// Map priority to color classes
const priorityColorMap: Record<TaskPriority, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

// Task card component
interface TaskCardProps {
  task: Task;
  index: number;
  isOverlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, isOverlay = false }) => {
  const priorityClass = priorityColorMap[task.priority];
  
  return (
    <Card className={`mb-2 ${isOverlay ? 'opacity-70' : ''}`}>
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{task.content}</CardTitle>
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardFooter className="p-3 pt-1 flex justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${priorityClass}`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500">#{index + 1}</span>
      </CardFooter>
    </Card>
  );
};

// Component to add new task
interface AddTaskProps {
  columnId: string;
  onAddTask: (columnId: string, content: string) => void;
}

const AddTask: React.FC<AddTaskProps> = ({ columnId, onAddTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskContent, setTaskContent] = useState('');

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleSave = () => {
    if (taskContent.trim()) {
      onAddTask(columnId, taskContent);
      setTaskContent('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTaskContent('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="mt-2">
        <Input
          value={taskContent}
          onChange={(e) => setTaskContent(e.target.value)}
          placeholder="Enter task title"
          className="mb-2"
          autoFocus
        />
        <div className="flex space-x-2">
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      className="w-full mt-2 flex items-center justify-center text-gray-500 hover:text-gray-700"
      onClick={handleAddClick}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Task
    </Button>
  );
};

// Main Kanban board component
const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<ColumnsState>(initialColumns);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the active task and its column
  const findTaskAndColumn = (taskId: UniqueIdentifier): { task: Task | null; column: Column | null } => {
    const taskIdStr = taskId.toString();
    for (const columnId in columns) {
      const column = columns[columnId];
      const task = column.tasks.find((task) => task.id === taskIdStr);
      if (task) {
        return { task, column };
      }
    }
    return { task: null, column: null };
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const { id: activeId } = active;
    const { id: overId } = over;

    // Find source column and destination column
    const { task: activeTask, column: sourceColumn } = findTaskAndColumn(activeId);
    
    if (!activeTask || !sourceColumn) {
      setActiveId(null);
      return;
    }
    
    const activeIdStr = activeId.toString();
    
    // Handle dropping on a column
    if (typeof overId === 'string' && overId.startsWith('column-')) {
      const destColumnId = overId.replace('column-', '');
      
      if (sourceColumn.id !== destColumnId) {
        // Remove task from source column
        const newSourceTasks = sourceColumn.tasks.filter(t => t.id !== activeIdStr);
        
        // Add task to destination column
        const updatedColumns = {
          ...columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            tasks: newSourceTasks
          },
          [destColumnId]: {
            ...columns[destColumnId],
            tasks: [...columns[destColumnId].tasks, activeTask]
          }
        };
        
        setColumns(updatedColumns);
      }
    } 
    // Handle dropping on another task (reordering)
    else if (overId) {
      const overIdStr = overId.toString();
      const { column: destColumn } = findTaskAndColumn(overId);
      
      if (destColumn) {
        // Same column reordering
        if (sourceColumn.id === destColumn.id) {
          const oldIndex = sourceColumn.tasks.findIndex(t => t.id === activeIdStr);
          const newIndex = destColumn.tasks.findIndex(t => t.id === overIdStr);
          
          const newTasks = arrayMove(sourceColumn.tasks, oldIndex, newIndex);
          
          setColumns({
            ...columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              tasks: newTasks
            }
          });
        } 
        // Moving to a different column
        else {
          const sourceTaskIndex = sourceColumn.tasks.findIndex(t => t.id === activeIdStr);
          const destTaskIndex = destColumn.tasks.findIndex(t => t.id === overIdStr);
          
          // Remove from source
          const newSourceTasks = [...sourceColumn.tasks];
          const [removedTask] = newSourceTasks.splice(sourceTaskIndex, 1);
          
          // Add to destination
          const newDestTasks = [...destColumn.tasks];
          newDestTasks.splice(destTaskIndex, 0, removedTask);
          
          setColumns({
            ...columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              tasks: newSourceTasks
            },
            [destColumn.id]: {
              ...destColumn,
              tasks: newDestTasks
            }
          });
        }
      }
    }
    
    setActiveId(null);
  };

  // Add a new task to a column
  const handleAddTask = (columnId: string, content: string) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = { id: newTaskId, content, priority: 'medium' };
    
    setColumns({
      ...columns,
      [columnId]: {
        ...columns[columnId],
        tasks: [...columns[columnId].tasks, newTask]
      }
    });
  };

  // Find the active task for the drag overlay
  const activeTask = activeId ? findTaskAndColumn(activeId).task : null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Kanban Board</h1>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {Object.values(columns).map((column) => (
            <KanbanColumn 
              key={column.id} 
              column={column}
            >
              {column.tasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  index={index} 
                />
              ))}
              <AddTask columnId={column.id} onAddTask={handleAddTask} />
            </KanbanColumn>
          ))}
        </div>
        
        <DragOverlay>
          {activeId && activeTask ? (
            <TaskCard 
              task={activeTask} 
              index={0} 
              isOverlay={true} 
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// Column component
interface KanbanColumnProps {
  column: Column;
  children: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, children }) => {
  return (
    <div
      id={`column-${column.id}`}
      className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
        <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs">
          {column.tasks.length}
        </span>
      </div>
      <div className="min-h-40">
        {children}
      </div>
    </div>
  );
};

export default KanbanBoard;