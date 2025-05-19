import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Task as TaskType, tagColors } from "./types";

interface TaskProps {
  task: TaskType;
  onEditTask: (task: TaskType) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function Task({ task, onEditTask, onDeleteTask }: TaskProps) {
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
            <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditTask(task)}>
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDeleteTask(task.id)}
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
          <Badge className={`text-xs ${tagColors[task.tag] || "bg-gray-100"}`}>
            {task.tag}
          </Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
