import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { Toaster } from 'sonner';
import ReconnectToastManager from '../system/ReconnectToastManager';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" />
      
      {/* Global reconnect toast manager */}
      <ReconnectToastManager />
    </div>
  );
}
