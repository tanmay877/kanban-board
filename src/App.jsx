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

  /* =========================
     LOAD TASKS SAFELY
  ========================== */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kanban_tasks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      }
    } catch {
      localStorage.removeItem("kanban_tasks");
    }
  }, []);

  /* =========================
     SAVE TASKS
  ========================== */
  useEffect(() => {
    localStorage.setItem("kanban_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor));

  const playSound = (file) => {
    try {
      const sound = new Audio(file);
      sound.play().catch(() => {});
    } catch {}
  };

  const addTask = () => {
    if (!title.trim()) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title,
        description,
        status: "ToDo"
      }
    ]);

    setTitle("");
    setDescription("");
    playSound(addSoundFile);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === active.id ? { ...task, status: over.id } : task
      )
    );

    playSound(dropSoundFile);
  };

  return (
    <div
      className="board"
      style={{
        backgroundImage: `url(${boardBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <h1 className="title">KANBAN BOARD</h1>

      <div className="add-section">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
        />

        <input
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

      <div className="dust"></div>
    </div>
  );
}

/* =========================
   COLUMN
========================= */

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

/* =========================
   TASK CARD
========================= */

function Task({ task, setTasks, playSound }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);

  const saveEdit = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, title: editTitle, description: editDesc }
          : t
      )
    );

    setIsEditing(false);
    playSound(addSoundFile);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${isDragging ? "dragging" : ""}`}
    >
      <div className="pin"></div>

      {isEditing ? (
        <>
          <input
            className="edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <input
            className="edit-input"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />
          <button className="save-btn" onClick={saveEdit}>
            💾
          </button>
        </>
      ) : (
        <div className="drag-area" {...listeners} {...attributes}>
          <h4>{task.title}</h4>
          <p className="desc">{task.description}</p>
        </div>
      )}

      <div className="peel"></div>

      <div className="card-buttons">
        <button className="edit-btn" onClick={() => setIsEditing(true)}>
          ✏️
        </button>

        <button
          className="delete-btn"
          onClick={() => {
            setTasks((prev) => prev.filter((t) => t.id !== task.id));
            playSound(deleteSoundFile);
          }}
        >
          ❌
        </button>
      </div>
    </div>
  );
}

export default App;