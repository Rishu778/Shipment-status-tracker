import React from "react";
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateShipment from "./pages/CreateShipment";
import ShipmentDetails from "./pages/ShipmentDetails";

const navigationClassName = (isActive: boolean) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
    isActive
      ? "bg-blue-50 text-blue-700"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3 sm:gap-8">
                <Link
                  to="/"
                  aria-label="Shipment Status Tracker dashboard"
                  className="flex min-w-0 items-center gap-3 font-semibold tracking-tight text-slate-900 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <span className="hidden truncate text-lg font-bold sm:inline">Shipment Status Tracker</span>
                </Link>

                <nav className="hidden items-center gap-2 sm:flex" aria-label="Primary navigation">
                  <NavLink to="/" end className={({ isActive }) => navigationClassName(isActive)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/create" className={({ isActive }) => navigationClassName(isActive)}>
                    Create Shipment
                  </NavLink>
                </nav>
              </div>

              <nav className="flex items-center gap-1 sm:hidden" aria-label="Mobile navigation">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/create"
                  className={({ isActive }) =>
                    `rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600"
                    }`
                  }
                >
                  Create
                </NavLink>
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateShipment />} />
            <Route path="/shipments/:id" element={<ShipmentDetails />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          Shipment Status Tracker &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
