import React, { useState } from 'react';
import './Signup.css'; // Ensure this CSS file includes styles for .error-message
import axios from 'axios';

function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State to store error message

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Reset error message on new submission

        // Basic frontend password validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        axios.post('http://localhost:3001/signup', { username, email, password })
            .then(result => {
                console.log(result);
                // Navigate to login or show success message
            })
            .catch(err => {
                console.log(err);
                setError(err.response.data.message || 'An error occurred. Please try again.');
            })
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Sign Up</button>
                {error && <div className="error-message">{error}</div>}
                <p className="login-link">
                    Already have an account? <a href="/login">Log in</a>
                </p>
            </form>
        </div>
    );
}

export default Signup;