import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const getNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { token: localStorage.token }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "PUT",
        headers: { token: localStorage.token }
      });
      // Update local state to reflect change (remove the 'new' badge styling)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error(err.message);
    }
  };

  const clearRead = async () => {
    try {
        await fetch(`${API_URL}/api/notifications/clear`, {
            method: "DELETE",
            headers: { token: localStorage.token }
        });
        getNotifications();
    } catch (err) {
        console.error(err.message);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white fw-bold">
            <i className="bi bi-bell-fill me-2"></i> Notifications
        </h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={clearRead}>
            Clear Read
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
            {notifications.length === 0 ? (
                <div className="text-center text-muted mt-5">
                    <h4>All caught up!</h4>
                    <p>You have no notifications.</p>
                </div>
            ) : (
                <div className="list-group shadow">
                    {notifications.map(note => (
                        <div 
                            key={note.id} 
                            className={`list-group-item p-3 d-flex justify-content-between align-items-center ${!note.is_read ? 'bg-dark border-primary' : 'bg-dark opacity-75'}`}
                            style={{ 
                                borderLeft: !note.is_read ? "5px solid #0d6efd" : "none",
                                color: "white",
                                marginBottom: "10px",
                                borderRadius: "5px"
                            }}
                        >
                            <div>
                                <p className="mb-1">{note.message}</p>
                                <small className="text-muted">
                                    {new Date(note.created_at).toLocaleString()}
                                </small>
                            </div>
                            
                            {!note.is_read && (
                                <button 
                                    className="btn btn-sm btn-primary ms-3"
                                    onClick={() => markAsRead(note.id)}
                                >
                                    Mark Read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;