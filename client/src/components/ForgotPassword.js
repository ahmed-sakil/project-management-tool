import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from "../config";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Added loading state

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        // 1. DEBUG: Check where we are sending data
        console.log("🚀 Sending request to:", `${API_URL}/api/auth/forgot-password`);

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            // 2. DEBUG: Check raw response status
            console.log("📡 Response Status:", response.status);

            // 3. Handle 204 or Empty responses gracefully
            if (response.status === 204) {
                alert("Error: Server returned 204 (No Content). This might be a CORS preflight issue.");
                setIsLoading(false);
                return;
            }

            // 4. Handle Text responses (Server Error) vs JSON
            const contentType = response.headers.get("content-type");
            let parseRes;

            if (contentType && contentType.indexOf("application/json") !== -1) {
                parseRes = await response.json();
            } else {
                const text = await response.text();
                console.error("❌ Non-JSON Response:", text);
                alert("Server Error (Not JSON): " + text);
                setIsLoading(false);
                return;
            }

            // 5. Success or Logic Failure
            if (response.ok) {
                setMessage(parseRes.message);
            } else {
                alert(parseRes.message || "Request Failed");
            }

        } catch (err) {
            console.error("💥 Network/Fetch Error:", err);
            alert("Network Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg">
                        <div className="card-body p-5">
                            <h3 className="text-center mb-4 fw-bold">Reset Password</h3>
                            
                            {message && <div className="alert alert-success">{message}</div>}
                            
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
                                <button disabled={isLoading} className="btn btn-primary btn-lg w-100">
                                    {isLoading ? "Sending..." : "Send Reset Link"}
                                </button>
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