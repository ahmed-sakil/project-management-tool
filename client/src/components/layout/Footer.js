import React from "react";

const Footer = () => {
  return (
    <footer className="text-center py-4 mt-auto" style={{
      backgroundColor: "var(--bg-card)",
      borderTop: "1px solid var(--color-border)",
      color: "var(--text-muted)"
    }}>
      <div className="container">
        <small>
          &copy; {new Date().getFullYear()} PlanStack. Developed By SAKIL & TAUHID
        </small>
        <div className="mt-2">
          <a
            href="https://github.com/ahmed-sakil/"
            className="text-muted mx-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-github"></i>
          </a>
          <a
            href="https://x.com/thesakil_09"
            className="text-muted mx-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-twitter-x"></i>
          </a>
          <a
            href="https://www.linkedin.com/in/ahmed-sakil"
            className="text-muted mx-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;