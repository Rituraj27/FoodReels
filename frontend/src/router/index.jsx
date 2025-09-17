import { createBrowserRouter, Navigate } from 'react-router-dom';
import UserLogin from '../pages/UserLogin.jsx';
import UserRegister from '../pages/UserRegister.jsx';
import FoodPartnerLogin from '../pages/FoodPartnerLogin.jsx';
import FoodPartnerRegister from '../pages/FoodPartnerRegister.jsx';
import FoodPartnerDashboard from '../pages/FoodPartnerDashboard.jsx';
import FoodUploadForm from '../pages/FoodUploadForm.jsx';
import FoodPartnerProfile from '../pages/FoodPartnerProfile.jsx';
import FoodPartnerPublicProfile from '../pages/FoodPartnerPublicProfile.jsx';
import Home from '../pages/Home.jsx';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to='/user/login' replace /> },
  { path: '/user/login', element: <UserLogin /> },
  { path: '/user/register', element: <UserRegister /> },
  { path: '/foodpartner/login', element: <FoodPartnerLogin /> },
  { path: '/foodpartner/register', element: <FoodPartnerRegister /> },
  { path: '/home', element: <Home /> },
  {
    path: '/foodpartner/public/:partnerId',
    element: <FoodPartnerPublicProfile />,
  },
  {
    path: '/foodpartner/dashboard',
    element: <FoodPartnerDashboard />,
    children: [
      { path: '', element: <Navigate to='upload' replace /> },
      { path: 'upload', element: <FoodUploadForm /> },
      { path: 'profile', element: <FoodPartnerProfile /> },
    ],
  },
  { path: '*', element: <Navigate to='/user/login' replace /> },
]);
