import React, { useState } from 'react';
import './Login.css'; // Ensure it contains .error-message styles
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // New state for error messages
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous error messages

        axios.post('http://localhost:3001/login', { email, password })
            .then(result => {
                if (result.data.message === "Success") {
                    navigate('/home');
                } else {
                    // Set error message from server response
                    setErrorMessage(result.data.message);
                }
            })
            .catch(error => {
                // Fallback error message
                setErrorMessage(error.response ? error.response.data.message : "Login error");
            });
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Log In</button>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <p className="signup-link">
                    Don't have an account? <a href="/signup">Sign up</a>
                </p>
            </form>
        </div>
    );
}

export default Login;