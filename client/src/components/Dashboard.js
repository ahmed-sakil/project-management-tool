import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const Dashboard = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [boards, setBoards] = useState([]);
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
      setBoards(parseRes);
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
        getBoards();
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

      <h3 className="mb-4 pb-2 border-bottom border-secondary text-white">My Projects</h3>
      
      <div className="row">
        {boards.length === 0 ? (
           <div className="col-12 text-center mt-5 text-muted">
              <h4>No projects found.</h4>
              <p>Create your first board above to get started!</p>
           </div>
        ) : (
          boards.map((board) => (
            <div key={board.id} className="col-md-4 col-lg-3 mb-4">
              <div className="card h-100 hover-shadow transition-all">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate" title={board.title}>{board.title}</h5>
                  <p className="card-text small flex-grow-1 text-muted">
                      Project Board
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
    </div>
  );
};

export default Dashboard;