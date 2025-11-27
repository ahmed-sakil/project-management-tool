import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated, setAuth }) => {
    const navigate = useNavigate();
    
    // State for Mobile Menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // State for Profile Dropdown
    const [showDropdown, setShowDropdown] = useState(false);

    // REF: Used to detect clicks outside the dropdown
    const dropdownRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setShowDropdown(false);
    };

    const toggleDropdown = (e) => {
        e.preventDefault(); 
        setShowDropdown(!showDropdown);
    };

    const logout = (e) => {
        e.preventDefault();
        closeMenu();
        localStorage.removeItem("token");
        setAuth(false);
        navigate("/login");
    };

    // EFFECT: Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <nav
            className="navbar navbar-expand-lg navbar-dark shadow-sm"
            style={{
                backgroundColor: "var(--bg-card)",
                borderBottom: "1px solid var(--color-border)",
                padding: "0.8rem 1rem",
                position: "relative", 
                zIndex: 1050
            }}
        >
            <div className="container">

                {/* --- LOGO SECTION --- */}
                <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
                    <img
                        src={process.env.PUBLIC_URL + "/logo.png"}
                        alt="PlanStack Logo"
                        style={{
                            height: "45px",
                            width: "45px",
                            objectFit: "contain",
                            marginRight: "12px",
                            borderRadius: "8px"
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
                        {/* THE MOTTO */}
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

                {/* Mobile Toggler */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMenu}
                    style={{ borderColor: "var(--color-border)" }}
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`} id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">

                        {!isAuthenticated ? (
                            // --- GUEST VIEW ---
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
                            // --- AUTHENTICATED VIEW ---
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

                                {/* 1. Notification Item */}
                                <li className="nav-item mx-2">
                                    
                                    {/* A. DESKTOP VIEW: Icon Only */}
                                    <Link 
                                        to="/notifications" 
                                        className="btn btn-link text-white position-relative d-none d-lg-block"
                                    >
                                        <i className="bi bi-bell" style={{ fontSize: "1.2rem" }}></i>
                                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                            <span className="visually-hidden">New alerts</span>
                                        </span>
                                    </Link>

                                    {/* B. MOBILE VIEW: Full Text Link */}
                                    <Link 
                                        to="/notifications" 
                                        className="nav-link px-3 d-flex align-items-center d-lg-none"
                                        onClick={closeMenu}
                                    >
                                        <i className="bi bi-bell me-2"></i> Notifications
                                        <span className="badge bg-danger ms-2 rounded-pill">New</span>
                                    </Link>
                                </li>

                                {/* 2. Profile Dropdown */}
                                <li 
                                    className="nav-item dropdown ms-2 position-relative"
                                    ref={dropdownRef}
                                >
                                    {/* FIXED: Changed <a> to <button> to fix ESLint Warning */}
                                    <button 
                                        className="nav-link dropdown-toggle d-flex align-items-center mt-2 mt-lg-0" 
                                        onClick={toggleDropdown}
                                        type="button"
                                        style={{ 
                                            color: "white", 
                                            cursor: "pointer",
                                            background: "transparent",
                                            border: "none",
                                            padding: "8px" 
                                        }}
                                    >
                                        <div 
                                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                            style={{ 
                                                width: "35px", 
                                                height: "35px", 
                                                backgroundColor: "#6c5ce7", 
                                                color: "white",
                                                fontWeight: "bold",
                                                border: "2px solid rgba(255,255,255,0.2)"
                                            }}
                                        >
                                           <i className="bi bi-person-fill"></i>
                                        </div>
                                        {/* Show Name on Mobile for better UX */}
                                        <span className="d-lg-none">My Account</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <ul 
                                            className="dropdown-menu dropdown-menu-end show" 
                                            style={{
                                                position: "absolute",
                                                right: 0,
                                                top: "100%",
                                                backgroundColor: "var(--bg-card)",
                                                border: "1px solid var(--color-border)",
                                                backdropFilter: "blur(10px)",
                                                minWidth: "200px",
                                                zIndex: 9999
                                            }}
                                        >
                                            <li>
                                                <Link 
                                                    className="dropdown-item text-white" 
                                                    to="/profile"
                                                    onClick={closeMenu}
                                                    style={{ padding: "10px 20px" }}
                                                >
                                                    <i className="bi bi-person-badge me-2"></i> My Profile
                                                </Link>
                                            </li>
                                            <li><hr className="dropdown-divider bg-secondary" /></li>
                                            <li>
                                                <button 
                                                    className="dropdown-item text-danger" 
                                                    onClick={logout}
                                                    style={{ padding: "10px 20px", background: "transparent", border: "none", width: "100%", textAlign: "left" }}
                                                >
                                                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                                                </button>
                                            </li>
                                        </ul>
                                    )}
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