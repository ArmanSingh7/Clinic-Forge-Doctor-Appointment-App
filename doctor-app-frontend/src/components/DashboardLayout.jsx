import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="d-flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className="flex-grow-1 min-vh-100 bg-light"
        style={{
          marginLeft: collapsed ? 70 : 260,
          transition: 'margin-left 0.3s ease',
        }}
      >
        <TopNavbar collapsed={collapsed} />
        <main className="p-4" style={{ marginTop: 60 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
