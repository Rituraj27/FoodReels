import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8000/api/auth/user/login',
        {
          email,
          password,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      alert('Login successful');
      navigate('/home');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || 'Login failed. Please try again.';
      alert(errorMessage);
      console.error('Login error:', error);
    }
  };
  return (
    <div className='auth-screen'>
      <div className='auth-box card form-card'>
        <div className='auth-header'>
          <h1 className='page-title'>User Login</h1>
          <p className='page-subtitle'>Welcome back. Sign in to continue.</p>
        </div>
        <form className='form' onSubmit={handleSubmit}>
          <div className='form-row'>
            <label className='label' htmlFor='userEmail'>
              Email
            </label>
            <input
              className='input'
              id='userEmail'
              name='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              required
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='userPassword'>
              Password
            </label>
            <input
              className='input'
              id='userPassword'
              name='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              required
            />
          </div>

          <div className='form-actions'>
            <button className='btn btn-primary' type='submit'>
              Sign In
            </button>
            <a className='btn btn-link' href='/user/register'>
              Create account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserLogin;
