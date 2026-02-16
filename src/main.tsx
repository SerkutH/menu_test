import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import DashboardLayout from './dashboard/DashboardLayout';
import OverviewPage from './dashboard/pages/OverviewPage';
import MenuPage from './dashboard/pages/MenuPage';
import SettingsPage from './dashboard/pages/SettingsPage';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
