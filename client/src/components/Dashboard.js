import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const Dashboard = ({ setAuth }) => {
  const [name, setName] = useState("");
  // 1. Separate State for My Boards and Shared Boards
  const [myBoards, setMyBoards] = useState([]);
  const [sharedBoards, setSharedBoards] = useState([]);
  
  const [newBoardTitle, setNewBoardTitle] = useState("");

  async function getProfile() {
    try {
      const response = await fetch(`${API_URL}/api/dashboard`, {
        method: "GET",
        headers: { token: localStorage.token }
      });
      const parseRes = await response.json();
      setName(parseRes.name);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function getBoards() {
    try {
      const response = await fetch(`${API_URL}/api/boards`, {
        method: "GET",
        headers: { token: localStorage.token }
      });
      const parseRes = await response.json();
      
      // 2. Handle the new data structure from backend
      // Backend now returns { myBoards: [], sharedBoards: [] }
      setMyBoards(parseRes.myBoards || []);
      setSharedBoards(parseRes.sharedBoards || []);
      
    } catch (err) {
      console.error(err.message);
    }
  }

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/boards`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            token: localStorage.token 
        },
        body: JSON.stringify({ title: newBoardTitle })
      });
      
      if (response.ok) {
        setNewBoardTitle("");
        getBoards(); // Refresh the lists
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getProfile();
    getBoards();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-bold text-white">Welcome, {name}</h2>
      </div>

      {/* --- CREATE BOARD SECTION --- */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-8">
          <div className="card shadow-lg"> 
            <div className="card-body p-4">
              <h4 className="card-title mb-3">Create a New Project Board</h4>
              <form onSubmit={createBoard} className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control form-control-lg"
                  placeholder="e.g., Marketing Campaign, House Renovation..." 
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                />
                <button className="btn btn-success btn-lg px-4">Create</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 1: MY PROJECTS --- */}
      <h3 className="mb-4 pb-2 border-bottom border-secondary text-white">
        <i className="bi bi-folder2-open me-2"></i> My Workspace
      </h3>
      
      <div className="row mb-5">
        {myBoards.length === 0 ? (
           <div className="col-12 text-center mt-3 text-muted">
              <p>You haven't created any boards yet.</p>
           </div>
        ) : (
          myBoards.map((board) => (
            <div key={board.id} className="col-md-4 col-lg-3 mb-4">
              <div className="card h-100 hover-shadow transition-all">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate" title={board.title}>{board.title}</h5>
                  <p className="card-text small flex-grow-1 text-muted">
                      Owner: Me
                  </p>
                  <Link to={`/board/${board.id}`} className="btn btn-outline-dark w-100 mt-2">
                    Open Board
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- SECTION 2: SHARED WITH ME --- */}
      <h3 className="mb-4 pb-2 border-bottom border-secondary text-white">
        <i className="bi bi-people-fill me-2"></i> Shared with Me
      </h3>

      <div className="row">
        {sharedBoards.length === 0 ? (
           <div className="col-12 text-center mt-3 text-muted">
              <p>No boards have been shared with you yet.</p>
           </div>
        ) : (
          sharedBoards.map((board) => (
            <div key={board.id} className="col-md-4 col-lg-3 mb-4">
              <div className="card h-100 hover-shadow transition-all border-warning"> {/* Add warning border to distinguish */}
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                      <h5 className="card-title text-truncate" title={board.title}>{board.title}</h5>
                      <span className="badge bg-secondary">{board.role}</span>
                  </div>
                  <p className="card-text small flex-grow-1 text-muted mt-2">
                      Shared Workspace
                  </p>
                  <Link to={`/board/${board.id}`} className="btn btn-outline-warning w-100 mt-2">
                    Open Shared Board
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Dashboard;