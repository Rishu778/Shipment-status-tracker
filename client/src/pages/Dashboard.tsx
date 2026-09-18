import React from 'react';
import SearchBar from '../components/SearchBar';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shipments Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor and track live shipments across all operational statuses.
          </p>
        </div>
      </div>

      {/* Search & Filter section placeholder */}
      <SearchBar />

      {/* Shipments List placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-900">Shipment List Ready</h3>
          <p className="mt-1 text-sm text-slate-500">
            Backend API integration for fetching and filtering shipments will be connected in the upcoming milestone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
