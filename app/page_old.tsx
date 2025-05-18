"use client";

import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function Draggable(props: any) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({id: props.id});
  const style = {
    transform: CSS.Translate.toString(transform),
    border: '1px solid #ccc',
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: 'white',
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}

function Droppable(props: any) {
  const {isOver, setNodeRef} = useDroppable({id: props.id});
  const style = {
    backgroundColor: isOver ? '#f0f0f0' : '',
    padding: '16px',
    minHeight: '200px',
    width: '250px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginRight: '16px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <h3>{props.title}</h3>
      {props.children}
    </div>
  );
}
  

export default function Home() {
  const [items, setItems] = useState<{[key: string]: string[]}>({
    todo: ['Task 1', 'Task 2'],
    inprogress: ['Task 3'],
    done: ['Task 4'],
  });

  function handleDragEnd(event: any) {
    const {active, over} = event;
    if (over && active.id !== over.id) {
      const activeContainer = Object.keys(items).find(key => items[key].includes(active.id));
      const overContainer = over.id;

      if (activeContainer && overContainer) {
        const activeItems = items[activeContainer].filter(item => item !== active.id);
        const overItems = [...items[overContainer], active.id];

        setItems({
          ...items,
          [activeContainer]: activeItems,
          [overContainer]: overItems,
        });
      }
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Droppable id="todo" title="To Do">
          {items.todo.map(item => <Draggable key={item} id={item}>{item}</Draggable>)}
        </Droppable>
        <Droppable id="inprogress" title="In Progress">
          {items.inprogress.map(item => <Draggable key={item} id={item}>{item}</Draggable>)}
        </Droppable>
        <Droppable id="done" title="Done">
          {items.done.map(item => <Draggable key={item} id={item}>{item}</Draggable>)}
        </Droppable>
      </div>
    </DndContext>
  );
}
