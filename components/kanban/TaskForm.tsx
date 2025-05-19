import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagType, Task } from './types';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (task: Omit<Task, 'id'>) => void;
  title: string;
  description: string;
  availableTags: TagType[];
}

export default function TaskForm({
  open,
  onOpenChange,
  task,
  onSave,
  title,
  description,
  availableTags
}: TaskFormProps) {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: task?.title || '',
    description: task?.description || '',
    tag: task?.tag || 'Feature'
  });
  
  // Formular zurücksetzen, wenn sich der Task ändert
  useState(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        tag: task.tag
      });
    } else {
      setFormData({
        title: '',
        description: '',
        tag: 'Feature'
      });
    }
  });
  
  const handleSave = () => {
    if (formData.title.trim() === '') return;
    onSave(formData);
    
    // Formular zurücksetzen
    setFormData({
      title: '',
      description: '',
      tag: 'Feature'
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Titel"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <Textarea
            placeholder="Beschreibung"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={formData.tag}
            onChange={(e) => setFormData({...formData, tag: e.target.value as TagType})}
          >
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}