import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from "../config";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { password, confirmPassword } = formData;

    const onChange = (e) => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const parseRes = await response.json();

            if (response.ok) {
                setMessage("Password updated! Redirecting...");
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(parseRes.message);
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
                            <h3 className="text-center mb-4 fw-bold">New Password</h3>
                            
                            {error && <div className="alert alert-danger">{error}</div>}
                            {message && <div className="alert alert-success">{message}</div>}

                            <form onSubmit={onSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">New Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={onChange}
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control form-control-lg"
                                        value={confirmPassword}
                                        onChange={onChange}
                                        required
                                        minLength="6"
                                    />
                                </div>

                                <button className="btn btn-success btn-lg w-100">Update Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;