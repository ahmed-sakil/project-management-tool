import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from "../config";

const Register = ({ setAuth }) => {
    const [inputs, setInputs] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const { name, email, password, confirmPassword } = inputs;

    const onChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const body = { email, password, name };
            const response = await fetch(`${API_URL}/api/auth/register`, {
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
                setError(parseRes.message || "Registration failed");
            }
        } catch (err) {
            console.error(err.message);
            setError("Server Error");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg">
                        <div className="card-body p-5">
                            <h3 className="text-center mb-4 fw-bold">Create Account</h3>

                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={onSubmitForm}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control form-control-lg"
                                        value={name}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
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
                                    <label className="form-label fw-semibold">Password (min 6 chars)</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={onChange}
                                        minLength="6"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control form-control-lg"
                                        value={confirmPassword}
                                        onChange={onChange}
                                        minLength="6"
                                        required
                                    />
                                </div>

                                <button className="btn btn-success btn-lg w-100 mt-3">Sign Up</button>
                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted">Already have an account? </span>
                                <Link to="/login" className="fw-bold text-decoration-none">Log In</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;