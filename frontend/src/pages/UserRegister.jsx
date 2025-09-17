import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserRegister() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8000/api/auth/user/register',
        {
          fullName: `${firstName} ${lastName}`,
          email,
          password,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      alert('Registration successful!');
      navigate('/home');
    } catch (error) {
      console.error('somthing went wrong', error);
      alert(
        error?.response?.data?.message ||
          `Registration failed. Please try again.`
      );
    }
  };

  return (
    <div className='auth-screen'>
      <div className='auth-box card form-card'>
        <div className='auth-header'>
          <h1 className='page-title'>Create User Account</h1>
          <p className='page-subtitle'>
            Join FoodReels to explore and order delicious meals.
          </p>
        </div>
        <form className='form' onSubmit={handleSubmit}>
          <div className='form-row'>
            <label className='label' htmlFor='firstName'>
              First Name
            </label>
            <input
              className='input'
              id='firstName'
              name='firstName'
              value={firstName}
              type='text'
              placeholder='John'
              required
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='lastName'>
              Last Name
            </label>
            <input
              className='input'
              id='lastName'
              name='lastName'
              type='text'
              value={lastName}
              placeholder='Deo'
              required
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='userEmailReg'>
              Email
            </label>
            <input
              className='input'
              id='userEmailReg'
              name='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              required
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='userPasswordReg'>
              Password
            </label>
            <input
              className='input'
              id='userPasswordReg'
              name='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Create a strong password'
              required
            />
          </div>

          <div className='form-actions'>
            <button className='btn btn-primary' type='submit'>
              Create Account
            </button>
          </div>
          <div className='form-links text-center'>
            <a className='btn btn-link' href='/user/login'>
              I already have an account
            </a>
            <a className='btn btn-link' href='/foodpartner/register'>
              Register as Food Partner
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserRegister;
