import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FoodPartnerLogin() {
  const [businessEmail, setBusinessEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        'http://localhost:8000/api/auth/food-partner/login',
        {
          businessEmail,
          password,
        },
        {
          header: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      alert('Login successfully');
      navigate('/foodpartner/dashboard');
    } catch (error) {
      alert(error?.response?.data?.message || 'Somthing went wrong');
      console.error('Something went wrong', error);
    }
  };
  return (
    <div className='auth-screen'>
      <div className='auth-box card form-card'>
        <div className='auth-header'>
          <h1 className='page-title'>Food Partner Login</h1>
          <p className='page-subtitle'>Access your partner dashboard.</p>
        </div>
        <form className='form' onSubmit={handleSubmit}>
          <div className='form-row'>
            <label className='label' htmlFor='partnerEmail'>
              Business Email
            </label>
            <input
              className='input'
              id='partnerEmail'
              name='email'
              type='email'
              placeholder='partner@restaurant.com'
              required
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='partnerPassword'>
              Password
            </label>
            <input
              className='input'
              id='partnerPassword'
              name='password'
              type='password'
              placeholder='••••••••'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className='form-actions'>
            <button className='btn btn-primary' type='submit'>
              Sign In
            </button>
            <a className='btn btn-link' href='/foodpartner/register'>
              Become a partner
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FoodPartnerLogin;
