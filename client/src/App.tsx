import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateShipment from './pages/CreateShipment';
import ShipmentDetails from './pages/ShipmentDetails';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        {/* Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                {/* Brand / Logo */}
                <Link
                  to="/"
                  className="flex items-center space-x-3 text-slate-900 font-semibold tracking-tight hover:opacity-90 transition-opacity"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-slate-900">Shipment Status Tracker</span>
                </Link>

                {/* Primary Nav Links */}
                <nav className="hidden sm:flex space-x-2">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/create"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    Create Shipment
                  </NavLink>
                </nav>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex items-center sm:hidden space-x-2">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 rounded-md text-xs font-medium ${
                      isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/create"
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 rounded-md text-xs font-medium ${
                      isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                    }`
                  }
                >
                  Create
                </NavLink>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateShipment />} />
            <Route path="/shipments/:id" element={<ShipmentDetails />} />
          </Routes>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          Shipment Status Tracker &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
