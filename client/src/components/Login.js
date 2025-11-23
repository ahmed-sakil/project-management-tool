import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from "../config"; 

const Login = ({ setAuth }) => {
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    });

    const { email, password } = inputs;

    const onChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        try {
            const body = { email, password };
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const parseRes = await response.json();

            if (parseRes.token) {
                localStorage.setItem('token', parseRes.token);
                setAuth(true);
            } else {
                setAuth(false);
                alert(parseRes.message || "Login Failed");
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg">
                        <div className="card-body p-5">
                            <h3 className="text-center mb-4 fw-bold">PlanStack</h3>
                            
                            <form onSubmit={onSubmitForm}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control form-control-lg"
                                        value={email}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={onChange}
                                        required
                                    />
                                </div>

                                <div className="d-flex justify-content-end mb-4">
                                    <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                        Forgot Password?
                                    </Link>
                                </div>

                                <button className="btn btn-primary btn-lg w-100">Log In</button>
                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted">Don't have an account? </span>
                                <Link to="/register" className="fw-bold text-decoration-none">Sign Up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;