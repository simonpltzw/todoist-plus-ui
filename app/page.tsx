"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MoreHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Einzigartige ID generieren
const generateId = () => Math.random().toString(36).substr(2, 9);

// Anfängliche Dummy-Daten für das Board
const initialBoardData = {
  columns: {
    backlog: {
      id: "backlog",
      title: "Backlog",
      taskIds: ["task-6"],
    },
    todo: {
      id: "todo",
      title: "To Do",
      taskIds: ["task-1", "task-2", "task-3"],
    },
    inProgress: {
      id: "inProgress",
      title: "In Progress",
      taskIds: ["task-4", "task-5"],
    },
  },
  columnOrder: ["backlog", "todo", "inProgress"],
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Website-Design",
      description: "Erstellen eines neuen UI-Designs",
      tag: "Design",
    },
    "task-2": {
      id: "task-2",
      title: "API-Dokumentation",
      description: "REST-API dokumentieren",
      tag: "Backend",
    },
    "task-3": {
      id: "task-3",
      title: "Login-System implementieren",
      description: "JWT Authentication",
      tag: "Feature",
    },
    "task-4": {
      id: "task-4",
      title: "Komponententests",
      description: "Unit-Tests für React-Komponenten",
      tag: "Testing",
    },
    "task-5": {
      id: "task-5",
      title: "Mobile Responsive",
      description: "Mobilanpassung der Hauptseite",
      tag: "UI",
    },
    "task-6": {
      id: "task-6",
      title: "Deployment-Pipeline",
      description: "CI/CD-Pipeline einrichten",
      tag: "DevOps",
    },
  },
};

// Tag-Farben
const tagColors = {
  Design: "bg-blue-100 text-blue-800",
  Backend: "bg-green-100 text-green-800",
  Feature: "bg-purple-100 text-purple-800",
  Testing: "bg-yellow-100 text-yellow-800",
  UI: "bg-pink-100 text-pink-800",
  DevOps: "bg-gray-100 text-gray-800",
  Bug: "bg-red-100 text-red-800",
};

export default function KanbanBoard() {
  const [boardData, setBoardData] = useState(initialBoardData);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    tag: "Feature",
  });
  const [editTaskData, setEditTaskData] = useState(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newColumnDialogOpen, setNewColumnDialogOpen] = useState(false);

  // Sortierbare Task-Komponente mit dnd-kit
  const SortableTask = ({ task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: task.id,
      data: {
        type: "task",
        task,
      },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="mb-2"
        {...attributes}
        {...listeners}
      >
        <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-move">
          <CardHeader className="pb-0">
            <div className="flex justify-between">
              <CardTitle className="text-sm font-medium">
                {task.title}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEditTask(task)}>
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => deleteTask(task.id)}
                  >
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <CardDescription className="text-xs">
              {task.description}
            </CardDescription>
          </CardContent>
          <CardFooter className="pt-0">
            <Badge
              className={`text-xs ${tagColors[task.tag] || "bg-gray-100"}`}
            >
              {task.tag}
            </Badge>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // Sortierbare Dropzone für Spalten - NEU
  const DroppableColumn = ({ column, tasks }) => {
    const columnId = column.id;

    const { setNodeRef } = useSortable({
      id: columnId,
      data: {
        type: "column",
        column,
      },
    });

    return (
      <div ref={setNodeRef} className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">{column.title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{column.taskIds.length}</Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteColumn(column.id)}
              className="h-8 w-8 text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-2 pb-1 min-h-40">
          <SortableContext
            items={column.taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTask key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-md h-32 flex items-center justify-center text-sm text-gray-400">
                Tasks hierher ziehen
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    );
  };

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

  // Aktive Task für DragOverlay
  const [activeTask, setActiveTask] = useState(null);

  // dnd-kit Drag-Handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(boardData.tasks[active.id]);
  };

  // ÜBERARBEITETER DRAGEND HANDLER
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
  const addNewTask = () => {
    if (newTaskData.title.trim() === "") return;

    const newTaskId = `task-${generateId()}`;
    const newTask = {
      id: newTaskId,
      title: newTaskData.title,
      description: newTaskData.description,
      tag: newTaskData.tag,
    };

    // Task zur "To Do"-Spalte hinzufügen
    const todoColumn = boardData.columns.todo;
    const updatedTaskIds = [...todoColumn.taskIds, newTaskId];

    setBoardData({
      ...boardData,
      tasks: {
        ...boardData.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...boardData.columns,
        todo: {
          ...todoColumn,
          taskIds: updatedTaskIds,
        },
      },
    });

    // Formular zurücksetzen
    setNewTaskData({ title: "", description: "", tag: "Feature" });
    setDialogOpen(false);
  };

  // Task bearbeiten
  const startEditTask = (task) => {
    setEditTaskData(task);
    setEditDialogOpen(true);
  };

  const saveEditTask = () => {
    if (editTaskData.title.trim() === "") return;

    setBoardData({
      ...boardData,
      tasks: {
        ...boardData.tasks,
        [editTaskData.id]: {
          ...editTaskData,
        },
      },
    });

    setEditTaskData(null);
    setEditDialogOpen(false);
  };

  // Task löschen
  const deleteTask = (taskId) => {
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
      const updatedTaskIds = column.taskIds.filter((id) => id !== taskId);

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
            taskIds: updatedTaskIds,
          },
        },
      });
    }
  };

  // Neue Spalte hinzufügen
  const addNewColumn = () => {
    if (newColumnTitle.trim() === "") return;

    const newColumnId = `column-${generateId()}`;

    setBoardData({
      ...boardData,
      columns: {
        ...boardData.columns,
        [newColumnId]: {
          id: newColumnId,
          title: newColumnTitle,
          taskIds: [],
        },
      },
      columnOrder: [...boardData.columnOrder, newColumnId],
    });

    setNewColumnTitle("");
    setNewColumnDialogOpen(false);
  };

  // Spalte löschen
  const deleteColumn = (columnId) => {
    if (boardData.columns[columnId].taskIds.length > 0) {
      alert("Diese Spalte enthält noch Tasks und kann nicht gelöscht werden.");
      return;
    }

    const updatedColumns = { ...boardData.columns };
    delete updatedColumns[columnId];

    const updatedColumnOrder = boardData.columnOrder.filter(
      (id) => id !== columnId
    );

    setBoardData({
      ...boardData,
      columns: updatedColumns,
      columnOrder: updatedColumnOrder,
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Task erstellen</DialogTitle>
                <DialogDescription>
                  Füge eine neue Task zu deinem Board hinzu.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Titel"
                  value={newTaskData.title}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Beschreibung"
                  value={newTaskData.description}
                  onChange={(e) =>
                    setNewTaskData({
                      ...newTaskData,
                      description: e.target.value,
                    })
                  }
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newTaskData.tag}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, tag: e.target.value })
                  }
                >
                  {Object.keys(tagColors).map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button onClick={addNewTask}>Hinzufügen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={newColumnDialogOpen}
            onOpenChange={setNewColumnDialogOpen}
          >
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
                <Button
                  variant="secondary"
                  onClick={() => setNewColumnDialogOpen(false)}
                >
                  Abbrechen
                </Button>
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
          <SortableContext
            items={boardData.columnOrder}
            strategy={verticalListSortingStrategy}
          >
            {boardData.columnOrder.map((columnId) => {
              const column = boardData.columns[columnId];
              const tasks = column.taskIds.map(
                (taskId) => boardData.tasks[taskId]
              );

              return (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <DroppableColumn column={column} tasks={tasks} />
                </div>
              );
            })}
          </SortableContext>

          {/* DragOverlay zeigt die aktive Task während des Draggings */}
          <DragOverlay>
            {activeTask ? (
              <Card className="border shadow-md w-72">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium">
                    {activeTask.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <CardDescription className="text-xs">
                    {activeTask.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Badge
                    className={`text-xs ${
                      tagColors[activeTask.tag] || "bg-gray-100"
                    }`}
                  >
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
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Task bearbeiten</DialogTitle>
              <DialogDescription>
                Bearbeite die Details dieser Task.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Titel"
                value={editTaskData.title}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Beschreibung"
                value={editTaskData.description}
                onChange={(e) =>
                  setEditTaskData({
                    ...editTaskData,
                    description: e.target.value,
                  })
                }
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={editTaskData.tag}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, tag: e.target.value })
                }
              >
                {Object.keys(tagColors).map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setEditDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button onClick={saveEditTask}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
