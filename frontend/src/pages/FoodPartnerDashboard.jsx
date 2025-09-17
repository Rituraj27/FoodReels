import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../styles/shared.css';

function FoodPartnerDashboard() {
  const location = useLocation();
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:8000/api/foodpartner/profile',
          { withCredentials: true }
        );
        if (mounted && data?.businessName) {
          setBusinessName(data.businessName);
        }
      } catch {
        // ignore; show fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className='dashboard-container'>
      <header className='dashboard-header'>
        <h2>{businessName || 'Food Partner'}</h2>
        <div className='nav-links'>
          <Link
            to='/foodpartner/dashboard/upload'
            className={`nav-link ${
              location.pathname.includes('/upload') ? 'active' : ''
            }`}
          >
            Upload Food Reel
          </Link>
          <Link
            to='/foodpartner/dashboard/profile'
            className={`nav-link ${
              location.pathname.includes('/profile') ? 'active' : ''
            }`}
          >
            Profile & Stats
          </Link>
        </div>
      </header>
      <main className='dashboard-content'>
        <Outlet />
      </main>
    </div>
  );
}

export default FoodPartnerDashboard;
