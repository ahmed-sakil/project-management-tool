import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import CardItem from "./CardItem";
import { API_URL } from "../config";

const List = ({ list, cards, setCards, refreshBoard }) => {
  const [newCardTitle, setNewCardTitle] = useState("");

  const { setNodeRef } = useDroppable({
    id: String(list.id),
  });

  const addCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    try {
      const body = { 
          title: newCardTitle, 
          list_id: list.id,
          order: cards.length + 1 
      };

      const response = await fetch(`${API_URL}/api/cards`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            token: localStorage.token 
        },
        body: JSON.stringify(body),
      });

      const newCard = await response.json();

      // --- CHANGE HERE: Attach autoOpen flag ---
      const cardWithFlag = { ...newCard, autoOpen: true };

      setCards((prev) => ({
        ...prev,
        [list.id]: [...(prev[list.id] || []), cardWithFlag],
      }));

      setNewCardTitle("");
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="list-container d-flex flex-column" style={{ 
        width: "100%", 
        flexShrink: 0,
        backgroundColor: "var(--bg-input)",
        borderRadius: "8px",
        border: "1px solid var(--color-border)",
        maxHeight: "100%"
    }}>
      
      <div className="p-3 font-weight-bold text-white border-bottom border-secondary">
        <h5 className="mb-0" style={{ fontSize: "1rem", fontWeight: "bold" }}>
            {list.title}
        </h5>
      </div>

      <div ref={setNodeRef} className="flex-grow-1 p-2" style={{ minHeight: "50px", overflowY: "auto" }}>
        <SortableContext 
            id={String(list.id)} 
            items={cards.map((c) => String(c.id))}
            strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <CardItem 
                key={card.id} 
                card={card} 
                refreshBoard={refreshBoard}
            />
          ))}
        </SortableContext>
      </div>

      <div className="p-2">
        <form onSubmit={addCard}>
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="+ Add a card"
            style={{ 
                backgroundColor: "#1e453e", 
                border: "none", 
                color: "white" 
            }}
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
          />
          {newCardTitle && (
              <button className="btn btn-success btn-sm w-100">Add</button>
          )}
        </form>
      </div>
    </div>
  );
};

export default List;