import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated, setAuth }) => {
    const navigate = useNavigate();
    
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    const logout = (e) => {
        e.preventDefault();
        closeMenu();
        localStorage.removeItem("token");
        setAuth(false);
        navigate("/login");
    };

    return (
        <nav
            className="navbar navbar-expand-lg navbar-dark shadow-sm"
            style={{
                backgroundColor: "var(--bg-card)",
                borderBottom: "1px solid var(--color-border)",
                padding: "0.8rem 1rem"
            }}
        >
            <div className="container">

                <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
                    <img
                        src={process.env.PUBLIC_URL + "/logo.png"}
                        alt="PlanStack Logo"
                        style={{
                            height: "45px",
                            width: "45px",
                            objectFit: "contain",
                            marginRight: "12px"
                        }}
                    />

                    <div className="d-flex flex-column justify-content-center">
                        <span
                            style={{
                                fontSize: "1.4rem",
                                fontWeight: "800",
                                letterSpacing: "-0.5px",
                                lineHeight: "1",
                                color: "white"
                            }}
                        >
                            PlanStack
                        </span>
                        <span
                            style={{
                                fontSize: "0.7rem",
                                fontWeight: "500",
                                letterSpacing: "1px",
                                color: "white",
                                textTransform: "uppercase",
                                marginTop: "2px"
                            }}
                        >
                            From To-Do to Done
                        </span>
                    </div>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMenu}
                    style={{ borderColor: "var(--color-border)" }}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">

                        {!isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <Link 
                                        className="nav-link px-3" 
                                        to="/login" 
                                        style={{ color: "var(--text-muted)" }}
                                        onClick={closeMenu}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item ms-2">
                                    <Link 
                                        className="btn btn-success px-4 fw-bold" 
                                        to="/register"
                                        onClick={closeMenu}
                                    >
                                        Get Started
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link 
                                        className="nav-link px-3" 
                                        to="/dashboard"
                                        onClick={closeMenu}
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item ms-2">
                                    <button
                                        className="btn btn-outline-light btn-sm px-3"
                                        onClick={logout}
                                        style={{ borderRadius: "20px" }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}

                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;