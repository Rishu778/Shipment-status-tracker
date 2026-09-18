import React from 'react';

export const CreateShipment: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Shipment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register a new shipment in the tracking system with initial status BOOKED.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <p className="text-sm text-slate-500 text-center">
          Shipment creation form inputs and submission logic will be implemented in the next milestone.
        </p>
      </div>
    </div>
  );
};

export default CreateShipment;
