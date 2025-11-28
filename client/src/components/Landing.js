import React from "react";
import { Link, Navigate } from "react-router-dom";

const Landing = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="landing-page">
      
      {/* --- HERO SECTION --- */}
      <div 
        className="text-center py-5 mb-5 position-relative" 
        style={{ 
          background: "linear-gradient(180deg, rgba(108, 92, 231, 0.15) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <div className="container py-4">
          <div className="d-inline-block px-3 py-1 mb-3 rounded-pill border border-success text-success bg-dark bg-opacity-50 small fw-bold">
            🚀 New: Team Collaboration & Notifications
          </div>
          <h1 className="display-3 fw-bold mb-3 text-white">
            Master Your Workflow <br />
            <span style={{ color: "var(--system-green)" }}>From To-Do to Done</span>
          </h1>
          <p className="lead text-white-50 mb-5 mx-auto" style={{ maxWidth: "650px" }}>
            The all-in-one project management tool. Organize tasks, invite your team, 
            track deadlines, and stay synced with real-time notifications.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-success btn-lg px-5 shadow-lg fw-bold">
              Get Started for Free
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg px-5">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS (ZIG-ZAG LAYOUT) --- */}
      <div className="container mb-5">
        <h2 className="text-center text-white fw-bold mb-5">Everything You Need to Know</h2>

        {/* STEP 1: ORGANIZATION */}
        <div className="row align-items-center mb-5 g-5">
          <div className="col-md-6 order-md-2">
            <div className="p-4 rounded shadow-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="display-1 text-center" style={{ color: "#6c5ce7" }}>
                <i className="bi bi-kanban"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 order-md-1 text-white">
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-primary me-2 rounded-circle p-2">1</span>
              <h3 className="m-0 fw-bold">Create & Organize</h3>
            </div>
            <p className="text-muted fs-5">
              Start by creating a <strong>Project Board</strong>. Inside, build your workflow using <strong>Lists</strong> (e.g., "Backlog", "In Progress", "Testing").
            </p>
            <ul className="text-white-50 mt-3 list-unstyled">
              <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Create unlimited lists</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Drag & drop cards instantly</li>
              <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> Click any card to edit details</li>
            </ul>
          </div>
        </div>

        {/* STEP 2: TASKS & DEADLINES */}
        <div className="row align-items-center mb-5 g-5">
          <div className="col-md-6">
            <div className="p-4 rounded shadow-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="display-1 text-center text-warning">
                <i className="bi bi-calendar-check"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-white">
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-warning text-dark me-2 rounded-circle p-2">2</span>
              <h3 className="m-0 fw-bold">Track Deadlines</h3>
            </div>
            <p className="text-muted fs-5">
              Never miss a deadline. Click the <i className="bi bi-pencil-square"></i> icon on a card to set a <strong>Due Date</strong>.
            </p>
            <div className="p-3 rounded mt-3" style={{ background: "rgba(46, 204, 113, 0.1)", borderLeft: "4px solid #2ecc71" }}>
              <h6 className="text-white fw-bold"><i className="bi bi-lightbulb-fill text-warning me-2"></i>Pro Tip:</h6>
              <p className="m-0 small text-white-50">
                Cards due <strong>Today</strong> will glow <span style={{ color: "#2ecc71", fontWeight: "bold" }}>Green</span> to grab your attention immediately!
              </p>
            </div>
          </div>
        </div>

        {/* STEP 3: COLLABORATION */}
        <div className="row align-items-center mb-5 g-5">
          <div className="col-md-6 order-md-2">
            <div className="p-4 rounded shadow-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="display-1 text-center text-info">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 order-md-1 text-white">
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-info text-dark me-2 rounded-circle p-2">3</span>
              <h3 className="m-0 fw-bold">Invite Your Team</h3>
            </div>
            <p className="text-muted fs-5">
              Work is better together. As a Board Owner, click the <strong>Share</strong> button to invite others via email.
            </p>
            <ul className="text-white-50 mt-3 list-unstyled">
              <li className="mb-2"><i className="bi bi-arrow-right-short text-info me-2"></i> Invited users get an instant alert</li>
              <li className="mb-2"><i className="bi bi-arrow-right-short text-info me-2"></i> Shared boards appear on their Dashboard</li>
              <li className="mb-2"><i className="bi bi-arrow-right-short text-info me-2"></i> Collaborate in real-time</li>
            </ul>
          </div>
        </div>

        {/* STEP 4: NOTIFICATIONS */}
        <div className="row align-items-center mb-5 g-5">
          <div className="col-md-6">
            <div className="p-4 rounded shadow-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="display-1 text-center text-danger">
                <i className="bi bi-bell-fill"></i>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-white">
            <div className="d-flex align-items-center mb-3">
              <span className="badge bg-danger me-2 rounded-circle p-2">4</span>
              <h3 className="m-0 fw-bold">Stay Updated</h3>
            </div>
            <p className="text-muted fs-5">
              Check the <strong>Bell Icon</strong> in the navigation bar to see who invited you to new projects. 
            </p>
            <p className="text-muted small">
              You can also manage your account settings and log out via the Profile menu.
            </p>
          </div>
        </div>

      </div>

      {/* --- FINAL CTA --- */}
      <div className="text-center py-5" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="container">
          <h2 className="text-white fw-bold mb-4">Ready to get organized?</h2>
          <Link to="/register" className="btn btn-success btn-lg px-5 fw-bold rounded-pill">
            Create Free Account
          </Link>
          <p className="text-muted mt-3 small">No credit card required. Open source & free forever.</p>
        </div>
      </div>

    </div>
  );
};

export default Landing;