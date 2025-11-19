import React, { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import CardItem from './CardItem'; 
import { API_URL } from "../config"; // <--- NEW IMPORT

const List = ({ list, cards, setCards }) => {
  const [newCardTitle, setNewCardTitle] = useState("");

  const { setNodeRef } = useDroppable({
    id: `list-${list.id}`,
  });

  const listCards = Array.isArray(cards) ? cards : [];
  const cardIds = listCards.map(card => `card-${card.id}`);

  const createCard = async (e) => {
    e.preventDefault();
    try {
      const body = { title: newCardTitle, list_id: list.id };
      
      // UPDATED PATH: Uses API_URL
      const response = await fetch(`${API_URL}/api/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token: localStorage.token },
        body: JSON.stringify(body),
      });

      const newCard = await response.json();
      
      setCards(prev => ({ 
        ...prev, 
        [list.id]: [...(prev[list.id] || []), newCard] 
      }));
      setNewCardTitle("");
    } catch (err) { console.error(err.message); }
  };

  return (
    <div 
        ref={setNodeRef} 
        className="card flex-shrink-0" 
        style={{ width: "280px", backgroundColor: "#ebecf0", minHeight: "100px" }}
    >
      <div className="card-body p-2">
        <h5 className="card-title p-2">{list.title}</h5>

        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {listCards.map((card) => (
                <CardItem key={card.id} card={card} />
            ))}
        </SortableContext>

        <form onSubmit={createCard} className="mt-2">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="+ Add a card"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            required
          />
          <button className="btn btn-primary btn-sm w-100">Add Card</button>
        </form>
      </div>
    </div>
  );
};

export default List;