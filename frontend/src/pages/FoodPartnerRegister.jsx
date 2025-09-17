import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/FoodPartnerRegister.css';

function FoodPartnerRegister() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [owner, setOwner] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/food-partner/register',
        {
          businessName,
          owner,
          businessEmail,
          phoneNumber,
          address: {
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
          password,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      // If registration is successful, redirect to dashboard
      if (response.status === 201) {
        alert(response.data.message);
        navigate('/foodpartner/dashboard');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Food-partner registration failed';
      setError(errorMessage);
      console.error('Registration error:', error);
    }
  };
  return (
    <div className='auth-screen'>
      <div className='auth-box card form-card'>
        <div className='auth-header'>
          <h1 className='page-title'>Become a Food Partner</h1>
          <p className='page-subtitle'>
            Register your restaurant or kitchen to start receiving orders.
          </p>
        </div>
        {error && (
          <div className='error-message alert alert-danger'>{error}</div>
        )}
        <form className='form' onSubmit={handleSubmit}>
          <div className='form-row'>
            <label className='label' htmlFor='businessName'>
              Business Name
            </label>
            <input
              className='input'
              id='businessName'
              // name='businessName'
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              type='text'
              placeholder='Acme Biryani House'
              required
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='contactPerson'>
              Owner
            </label>
            <input
              className='input'
              id='contactPerson'
              name='contactPerson'
              type='text'
              placeholder='Priya Sharma'
              required
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='partnerEmailReg'>
              Business Email
            </label>
            <input
              className='input'
              id='partnerEmailReg'
              name='email'
              type='email'
              placeholder='partner@restaurant.com'
              required
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
            />
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='phone'>
              Phone Number
            </label>
            <input
              className='input'
              id='phone'
              name='phone'
              type='tel'
              placeholder='+91 01234 56789'
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className='form-section'>
            <h3>Address</h3>
            <div className='form-row'>
              <label className='label' htmlFor='street'>
                Street Address
              </label>
              <input
                className='input'
                id='street'
                name='street'
                type='text'
                placeholder='123 Main St, Apartment 4B'
                value={address.street}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, street: e.target.value }))
                }
                required
              />
            </div>

            <div className='form-row'>
              <label className='label' htmlFor='city'>
                City
              </label>
              <input
                className='input'
                id='city'
                name='city'
                type='text'
                placeholder='Mumbai'
                value={address.city}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, city: e.target.value }))
                }
                required
              />
            </div>

            <div className='form-row'>
              <label className='label' htmlFor='state'>
                State
              </label>
              <input
                className='input'
                id='state'
                name='state'
                type='text'
                placeholder='Maharashtra'
                value={address.state}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, state: e.target.value }))
                }
                required
              />
            </div>

            <div className='form-row'>
              <label className='label' htmlFor='pincode'>
                PIN Code
              </label>
              <input
                className='input'
                id='pincode'
                name='pincode'
                type='text'
                placeholder='400001'
                value={address.pincode}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, pincode: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className='form-row'>
            <label className='label' htmlFor='partnerPasswordReg'>
              Password
            </label>
            <input
              className='input'
              id='partnerPasswordReg'
              name='password'
              type='password'
              placeholder='Create a strong password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className='form-actions'>
            <button className='btn btn-primary' type='submit'>
              Register
            </button>
          </div>
          <div className='form-links text-center'>
            <a className='btn btn-link' href='/foodpartner/login'>
              I already have an account
            </a>
            <a className='btn btn-link' href='/user/register'>
              Register as User
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FoodPartnerRegister;
