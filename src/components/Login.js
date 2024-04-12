import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';  // react-router-dom v6

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');  // Clear previous errors
        try {
            const response = await axios.post('http://localhost:3001/login', { email, password }, { withCredentials: true })
            if (response.data.loggedIn) {
                navigate('/dashboard');  // Redirect to the dashboard on successful login
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        } catch (error) {
            setError('Login failed. Please try again later.');
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit">Login</button>
                {error && <p className="error">{error}</p>}
            </form>
            <p>Need an account? <Link to="/">Register Here</Link></p>
        </div>
        
    );
}
export default Login;
