import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import boardBg from "./assets/pinboard-review.jpg";
import addSoundFile from "./assets/add.mp3";
import deleteSoundFile from "./assets/delete.mp3";
import dropSoundFile from "./assets/paper.mp3";

import "./index.css";

const columns = ["ToDo", "Doing", "Review", "Done"];

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor));

  const playSound = (file) => {
    const audio = new Audio(file);
    audio.volume = 0.6;
    audio.play();
  };

  const addTask = () => {
    if (!title.trim()) return;

    playSound(addSoundFile);

    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title,
        description,
        status: "ToDo"
      }
    ]);

    setTitle("");
    setDescription("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    playSound(dropSoundFile);

    setTasks((prev) =>
      prev.map((task) =>
        task.id === active.id ? { ...task, status: over.id } : task
      )
    );
  };

  return (
    <div
      className="board"
      style={{ backgroundImage: `url(${boardBg})` }}
    >
      <div className="header">
        <h1 className="title">KANBAN BOARD</h1>
        <p className="author">By Tanmay</p>
      </div>

      <div className="add-section">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description..."
        />

        <button onClick={addTask}>Add</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="columns">
          {columns.map((col) => (
            <Column
              key={col}
              id={col}
              title={col}
              tasks={tasks.filter((t) => t.status === col)}
              setTasks={setTasks}
              playSound={playSound}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function Column({ id, title, tasks, setTasks, playSound }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="column">
      <h2>{title}</h2>
      {tasks.map((task) => (
        <Task
          key={task.id}
          task={task}
          setTasks={setTasks}
          playSound={playSound}
        />
      ))}
    </div>
  );
}

function Task({ task, setTasks, playSound }) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform)
  };

  return (
    <div ref={setNodeRef} style={style} className="card">
      <div {...listeners} {...attributes}>
        <strong>{task.title}</strong>
        <p>{task.description}</p>
      </div>

      <button
        className="delete-btn"
        onClick={() => {
          playSound(deleteSoundFile);
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default App;