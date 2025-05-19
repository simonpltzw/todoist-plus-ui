import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Task from "./Task";
import { Column as ColumnType, Task as TaskType } from "./types";

interface ColumnProps {
  column: ColumnType;
  tasks: TaskType[];
  onEditTask: (task: TaskType) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export default function Column({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
}: ColumnProps) {
  
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  return (
    <div id={column.id} className="flex-shrink-0 w-80">
      <div ref={setNodeRef} className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">{column.title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{column.taskIds.length}</Badge>
            {onDeleteColumn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteColumn(column.id)}
                className="h-8 w-8 text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-2 min-h-40">
          <SortableContext
            id={column.id}
            items={column.taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
            {tasks.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-md h-32 flex items-center justify-center text-sm text-gray-400">
                Tasks hierher ziehen
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
