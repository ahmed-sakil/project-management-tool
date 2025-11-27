import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import List from "./List";
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { API_URL } from "../config";
import { toast } from "react-toastify"; 

const Board = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [allCards, setAllCards] = useState({});
  
  // --- SHARE MODAL STATE ---
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // --- HELPERS ---
  const cleanId = (strId) => {
    if (!strId) return null;
    return String(strId).replace("list-", "").replace("card-", "");
  };

  const findContainer = (uniqueId) => {
    if (!uniqueId) return null;
    const activeId = cleanId(uniqueId);
    if (Object.keys(allCards).includes(activeId)) return activeId;
    const foundListKey = Object.keys(allCards).find((key) =>
      allCards[key].some(c => c.id === activeId)
    );
    return foundListKey || null;
  };

  // --- API CALLS ---
  const updateCardPosition = async (cardId, newListId, newOrder) => {
    try {
      const body = { list_id: newListId, order: parseFloat(newOrder) };
      await fetch(`${API_URL}/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token: localStorage.token },
        body: JSON.stringify(body),
      });
    } catch (err) { console.error(err.message); }
  };

  const saveNewCardOrder = async (cardsToUpdate) => {
    try {
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
      const boardRes = await fetch(`${API_URL}/api/boards/${id}`, header);
      
      if (!boardRes.ok) {
        throw new Error("Failed to fetch board");
      }

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

    const rawActiveId = String(active.id);
    const rawOverId = String(over.id);
    const sourceListId = findContainer(rawActiveId);
    const destListId = findContainer(rawOverId);

    if (!sourceListId || !destListId) return;

    const sourceCards = allCards[sourceListId] ?? [];
    const destCards = allCards[destListId] ?? [];

    const activeCardId = cleanId(rawActiveId);
    const overCardId = cleanId(rawOverId);

    const activeIndex = sourceCards.findIndex(c => c.id === activeCardId);
    const overIndex = destCards.findIndex(c => c.id === overCardId);

    let newSourceCards = [...sourceCards];
    let newDestCards = [...destCards];

    if (sourceListId !== destListId) {
      const [movedCard] = newSourceCards.splice(activeIndex, 1);
      movedCard.list_id = destListId;
      let insertIndex = overIndex >= 0 ? overIndex : newDestCards.length + 1;
      newDestCards.splice(insertIndex, 0, movedCard);

      setAllCards(prev => ({ ...prev, [sourceListId]: newSourceCards, [destListId]: newDestCards }));

      const cardsToUpdate = newDestCards.map((c, i) => ({ id: c.id, order: i + 1 }));
      await updateCardPosition(movedCard.id, destListId, insertIndex + 1);
      await saveNewCardOrder(cardsToUpdate);
    } else if (activeIndex !== overIndex) {
      const newCards = arrayMove(sourceCards, activeIndex, overIndex);
      setAllCards(prev => ({ ...prev, [sourceListId]: newCards }));
      const cardsToUpdate = newCards.map((c, i) => ({ id: c.id, order: i + 1 }));
      await saveNewCardOrder(cardsToUpdate);
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    try {
      const body = { title: newListTitle, board_id: id };
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

  // --- INVITE HANDLER (FIXED) ---
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
        const response = await fetch(`${API_URL}/api/boards/${id}/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json", token: localStorage.token },
            body: JSON.stringify({ email: inviteEmail }),
        });

        const parseRes = await response.json();

        if (response.ok) {
            toast.success("Invitation sent successfully!");
            setShowShareModal(false);
            setInviteEmail("");
        } else {
            // FIX: Safely extract the error string whether it's an object or string
            const errorMsg = parseRes.message || (typeof parseRes === "string" ? parseRes : "Failed to invite user");
            toast.error(errorMsg);
        }
    } catch (err) {
        console.error(err.message);
        toast.error("Server Error: Check console");
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  return (
    <div className="container mt-5" style={{ minHeight: "calc(100vh - 100px)" }}>
      {board && (
        <div className="h-100 d-flex flex-column">

          {/* --- HEADER SECTION --- */}
          <div
            className="d-flex align-items-center justify-content-between p-3 mb-4 rounded shadow-sm"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <Link to="/dashboard" className="btn btn-outline-light btn-sm">
                <i className="bi bi-arrow-left me-1"></i> Dashboard
              </Link>
              <h3 className="text-white fw-bold m-0">{board.title}</h3>
              {/* Show role badge if available */}
              {board.user_role && (
                <span className="badge bg-secondary ms-2">{board.user_role}</span>
              )}
            </div>

            {/* SHARE BUTTON (Only for Owner) */}
            {board.user_role === 'owner' && (
                <button 
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                    onClick={() => setShowShareModal(true)}
                >
                    <i className="bi bi-person-plus-fill"></i> Share
                </button>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div
              className="d-flex flex-wrap align-items-start justify-content-center justify-content-md-start pb-4 flex-grow-1"
              style={{ gap: "20px" }}
            >
              {lists.map((list) => (
                <div key={list.id} className="list-wrapper">
                  <List
                    list={list}
                    cards={allCards[list.id] || []}
                    setCards={setAllCards}
                    refreshBoard={getData}
                  />
                </div>
              ))}

              <div className="list-wrapper">
                <form
                  onSubmit={createList}
                  className="p-3 rounded"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="+ Add another list"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    required
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      border: "none",
                      color: "white"
                    }}
                  />
                  <button className="btn btn-success btn-sm w-100">Add List</button>
                </form>
              </div>
            </div>
          </DndContext>

          {/* --- SHARE MODAL --- */}
          {showShareModal && (
            <div className="card-modal-overlay">
                <div className="card-modal-glass" style={{ maxWidth: "400px" }}>
                    <h4>Invite Member</h4>
                    <p className="text-white-50 small mb-3">
                        Share this board with another user by entering their email address.
                    </p>
                    
                    <form onSubmit={handleInvite}>
                        <label>User Email</label>
                        <input 
                            type="email" 
                            className="form-control mb-4"
                            placeholder="friend@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                        />

                        <div className="d-flex justify-content-end gap-2">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setShowShareModal(false)}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary">
                                Send Invite
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Board;