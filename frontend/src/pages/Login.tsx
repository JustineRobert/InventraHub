import { useState, FormEvent } from 'react';
import axios from 'axios';

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('inventrahub_token', response.data.token);
      onLogin();
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>InventraHub</h1>
        <p>Secure hardware inventory and mobile money-ready sales operations.</p>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </div>
          <button type="submit" className="button">Sign In</button>
        </form>
      </div>
    </div>
  );
}
