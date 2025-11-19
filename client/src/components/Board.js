import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import List from "./List";
import { 
  DndContext, 
  closestCorners, 
  useSensor, 
  useSensors, 
  PointerSensor 
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { API_URL } from "../config"; // <--- NEW IMPORT

const Board = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [allCards, setAllCards] = useState({}); 

  // Configure sensors to prevent accidental drags (require 5px movement)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Helper to strip prefixes (e.g., "list-1" -> 1)
  const cleanId = (strId) => {
      if (!strId) return null;
      return parseInt(String(strId).replace("list-", "").replace("card-", ""));
  };

  // Helper to find which List a card belongs to in state
  const findContainer = (uniqueId) => {
    if (!uniqueId) return null;
    const listId = cleanId(uniqueId);
    
    // Case 1: ID is a List
    if (allCards[listId]) return listId;

    // Case 2: ID is a Card (Search inside all lists)
    const foundListKey = Object.keys(allCards).find((key) => 
        allCards[key].some(c => `card-${c.id}` === uniqueId)
    );
    
    return foundListKey ? parseInt(foundListKey) : null;
  };

  const updateCardPosition = async (cardId, newListId, newOrder) => {
      try {
          const body = { list_id: newListId, order: newOrder };
          // UPDATED PATH
          await fetch(`${API_URL}/api/cards/${cardId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', token: localStorage.token },
              body: JSON.stringify(body),
          });
      } catch (err) { console.error(err.message); }
  };

  const saveNewCardOrder = async (cardsToUpdate) => {
    try {
        // UPDATED PATH
        await fetch(`${API_URL}/api/cards/reorder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', token: localStorage.token },
            body: JSON.stringify({ cards: cardsToUpdate }),
        });
    } catch (err) { console.error(err.message); }
  };

  const getData = async () => {
    try {
      const header = { headers: { token: localStorage.token } };
      
      // UPDATED PATHS (3 Fetch calls here)
      const boardRes = await fetch(`${API_URL}/api/boards/${id}`, header);
      setBoard(await boardRes.json());

      const listRes = await fetch(`${API_URL}/api/lists/${id}`, header);
      const listData = await listRes.json();
      setLists(listData);
      
      const cardsMap = {};
      const cardPromises = listData.map(async (list) => {
          const cardRes = await fetch(`${API_URL}/api/cards/${list.id}`, header);
          const cards = await cardRes.json();
          cardsMap[list.id] = cards;
      });
      
      await Promise.all(cardPromises);
      setAllCards(cardsMap);
    } catch (err) { console.error(err.message); }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceListId = findContainer(activeId);
    const destListId = findContainer(overId);

    if (!sourceListId || !destListId) return;

    const sourceCards = allCards[sourceListId] ?? [];
    const destCards = allCards[destListId] ?? [];

    const activeIndex = sourceCards.findIndex(c => `card-${c.id}` === activeId);
    const overIndex = destCards.findIndex(c => `card-${c.id}` === overId);

    let newSourceCards = [...sourceCards];
    let newDestCards = [...destCards];

    // Scenario 1: Moving between different lists
    if (sourceListId !== destListId) {
        const [movedCard] = newSourceCards.splice(activeIndex, 1);
        movedCard.list_id = destListId;

        let insertIndex;
        if (overIndex >= 0) {
            insertIndex = overIndex;
        } else {
            insertIndex = newDestCards.length + 1;
        }

        newDestCards.splice(insertIndex, 0, movedCard);

        setAllCards(prev => ({
            ...prev,
            [sourceListId]: newSourceCards,
            [destListId]: newDestCards
        }));

        const cardsToUpdate = newDestCards.map((c, i) => ({ id: c.id, order: i }));
        await updateCardPosition(movedCard.id, destListId, insertIndex);
        await saveNewCardOrder(cardsToUpdate);
    } 
    
    // Scenario 2: Reordering in the same list
    else if (activeIndex !== overIndex) {
        const newCards = arrayMove(sourceCards, activeIndex, overIndex);
        
        setAllCards(prev => ({
            ...prev,
            [sourceListId]: newCards
        }));

        const cardsToUpdate = newCards.map((c, i) => ({ id: c.id, order: i }));
        await saveNewCardOrder(cardsToUpdate);
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    try {
      const body = { title: newListTitle, board_id: id };
      // UPDATED PATH
      const response = await fetch(`${API_URL}/api/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token: localStorage.token },
        body: JSON.stringify(body),
      });

      const newList = await response.json();
      setLists([...lists, newList]);
      setNewListTitle(""); 
      setAllCards(prev => ({ ...prev, [newList.id]: [] }));
    } catch (err) { console.error(err.message); }
  };

  useEffect(() => {
    getData();
  }, [id]);

  return (
    <div className="container-fluid mt-5">
      <Link to="/dashboard" className="btn btn-outline-dark mb-4">
        ← Back to Dashboard
      </Link>

      {board && (
        <div>
          <h2 className="mb-4 text-white bg-dark p-3 rounded">{board.title}</h2>

          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners} 
            onDragEnd={handleDragEnd} 
          >
            <div className="d-flex overflow-auto" style={{ gap: "20px", paddingBottom: "20px" }}>
              {lists.map((list) => (
                <List 
                    key={list.id} 
                    list={list} 
                    cards={allCards[list.id] || []} 
                    setCards={setAllCards} 
                />
              ))}

              <div className="flex-shrink-0" style={{ width: "280px" }}>
                <form onSubmit={createList} className="bg-light p-3 rounded shadow-sm">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="+ Add another list"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    required
                  />
                  <button className="btn btn-success btn-sm w-100">Add List</button>
                </form>
              </div>
            </div>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default Board;