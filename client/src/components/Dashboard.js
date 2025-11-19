import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config"; // <--- NEW IMPORT

const Dashboard = ({ setAuth }) => {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState("");

  // 1. Fetch existing boards from the server
  // 1. Fetch existing boards from the server
  async function getBoards() {
    try {
      const response = await fetch(`${API_URL}/api/boards`, {
        headers: { token: localStorage.token },
      });
      const parseRes = await response.json();

      // SAFETY CHECK: Is it an array?
      if (Array.isArray(parseRes)) {
        setBoards(parseRes);
      } else {
        console.error("Server Error:", parseRes);
        // If server returns an error (like invalid token), reset boards
        setBoards([]); 
        // Optional: If token is bad, force logout
        if (response.status === 403 || response.status === 401) {
             localStorage.removeItem("token");
             setAuth(false);
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  // 2. Create a new board
  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { title };
      // UPDATED PATH
      const response = await fetch(`${API_URL}/api/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token,
        },
        body: JSON.stringify(body),
      });

      const parseRes = await response.json();

      // Add the new board to the list immediately (so we don't need to refresh)
      setBoards([...boards, parseRes]);
      setTitle(""); // Clear the input box
    } catch (err) {
      console.error(err.message);
    }
  };

  // 3. Run getBoards when the component loads
  useEffect(() => {
    getBoards();
  }, []);

  // Logout function
  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
  };

  return (
    <div className="container mt-5">
      {/* Header & Logout */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1>My Boards</h1>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Create Board Form */}
      <form className="d-flex mb-5" onSubmit={onSubmitForm}>
        <input
          type="text"
          className="form-control mr-3"
          placeholder="Enter board title (e.g., Marketing Project)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button className="btn btn-success">Create Board</button>
      </form>

      {/* List of Boards */}
      <div className="row">
        {boards.length === 0 ? (
          <p>No boards yet. Create one above!</p>
        ) : (
          boards.map((board) => (
            <div key={board.id} className="col-md-4 mb-3">
              {/* This link will eventually go to the specific board page */}
              <Link to={`/board/${board.id}`} style={{ textDecoration: 'none' }}>
                <div className="card text-white bg-primary mb-3 cursor-pointer">
                  <div className="card-body">
                    <h3 className="card-title">{board.title}</h3>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;