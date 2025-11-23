import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from "../config";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const parseRes = await response.json();
            setMessage(parseRes.message);
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
                            <h3 className="text-center mb-4 fw-bold">Reset Password</h3>
                            
                            {message && <div className="alert alert-info">{message}</div>}
                            
                            <p className="text-muted text-center mb-4">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            <form onSubmit={onSubmit}>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button className="btn btn-primary btn-lg w-100">Send Reset Link</button>
                            </form>

                            <div className="text-center mt-4">
                                <Link to="/login" className="fw-bold text-decoration-none">Back to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;