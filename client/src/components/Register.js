import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // To link to the Login page

const Register = ({ setAuth }) => {
    const [inputs, setInputs] = useState({
        email: '',
        password: '',
        name: '' // Optional, but good to have ready
    });

    const { email, password, name } = inputs;

    const onChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const onSubmitForm = async (e) => {
        e.preventDefault(); // Stop browser from refreshing
        try {
            const body = { email, password, name };

            // Call the Backend API
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const parseRes = await response.json();

            if (parseRes.token) {
                // Save token to local storage
                localStorage.setItem('token', parseRes.token);
                setAuth(true);
            } else {
                alert(parseRes.message || "Registration failed");
            }

        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div>
            <h1 className="text-center my-5">Register</h1>
            <form onSubmit={onSubmitForm}>
                <input
                    type="email"
                    name="email"
                    placeholder="email"
                    className="form-control my-3"
                    value={email}
                    onChange={onChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="password"
                    className="form-control my-3"
                    value={password}
                    onChange={onChange}
                />
                <button className="btn btn-success btn-block">Submit</button>
            </form>
            <Link to="/login">Login</Link>
        </div>
    );
};

export default Register;