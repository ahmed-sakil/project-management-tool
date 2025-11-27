import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { API_URL } from "../config";
import "./CardItem.css";

const CardItem = ({ card, refreshBoard }) => {
  // 1. AUTO OPEN: Initialize state based on the flag passed from List.js
  const [isEditing, setIsEditing] = useState(card.autoOpen || false);
  
  const [editTitle, setEditTitle] = useState(card.title);
  
  const [editDate, setEditDate] = useState(
    card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : ""
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: String(card.id), disabled: isEditing });

  // 2. FIXED GLOW LOGIC: Compare Year-Month-Day only
  const isDueToday = () => {
    if (!card.due_date) return false;
    
    const today = new Date();
    const due = new Date(card.due_date);

    return (
        today.getDate() === due.getDate() &&
        today.getMonth() === due.getMonth() &&
        today.getFullYear() === due.getFullYear()
    );
  };

  // 3. DATE FORMATTER: DD-Month-YYYY (e.g., 27 Nov 2025)
  const formatDisplayDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
      });
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditing ? 'default' : 'grab'
  };

  const saveChanges = async () => {
    if (!editTitle.trim()) return;
    try {
      const body = { 
        title: editTitle, 
        due_date: editDate || null,
        is_archived: false 
      };

      await fetch(`${API_URL}/api/cards/${card.id}/details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", token: localStorage.token },
        body: JSON.stringify(body),
      });

      setIsEditing(false);
      refreshBoard();
    } catch (err) {
      console.error(err.message);
    }
  };

  const archiveCard = async () => {
    if(!window.confirm("Are you sure you want to archive this card?")) return;

    try {
      const body = { 
        title: editTitle, 
        due_date: editDate || null,
        is_archived: true
      };

      await fetch(`${API_URL}/api/cards/${card.id}/details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", token: localStorage.token },
        body: JSON.stringify(body),
      });

      setIsEditing(false);
      refreshBoard();
    } catch (err) {
      console.error(err.message);
    }
  };

  const cancelEdit = () => {
      setIsEditing(false);
      setEditTitle(card.title);
      // Optional: If it was auto-opened and cancelled immediately, you might want to keep it or delete it. 
      // For now, it stays as a card with no date.
  }

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        // Apply glow-green class if due today
        className={`task-card ${isDueToday() ? "glow-green" : ""} ${isEditing ? "editing" : ""}`}
        {...attributes} 
        {...listeners}
      >
        {!isEditing ? (
          // --- VIEW MODE ---
          <>
             <div className="d-flex justify-content-between align-items-start">
              <span style={{wordBreak: "break-word"}}>{card.title}</span>
              
              <i 
                className="bi bi-pencil-square edit-icon ms-2"
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={() => setIsEditing(true)}
              ></i>
            </div>
            
            {card.due_date && (
                <div className="date-badge mt-2">
                    <i className="bi bi-clock me-1"></i>
                    {/* Display formatted date */}
                    {formatDisplayDate(card.due_date)}
                </div>
            )}
          </>
        ) : (
          // --- EDIT MODE ---
          <div className="inline-edit-form" onPointerDown={(e) => e.stopPropagation()}>
            <input 
              type="text" 
              className="form-control form-control-sm mb-2 edit-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              autoFocus
              placeholder="Card Title"
            />

            <input 
              type="date" 
              className="form-control form-control-sm mb-2 edit-input"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
            />

            <div className="d-flex justify-content-between gap-1 mt-2 align-items-center">
                 <i 
                    className="bi bi-archive archive-icon" 
                    onClick={archiveCard}
                    title="Archive Card"
                 ></i>
                <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>X</button>
                    <button className="btn btn-sm btn-success" onClick={saveChanges}>Save</button>
                </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default CardItem;