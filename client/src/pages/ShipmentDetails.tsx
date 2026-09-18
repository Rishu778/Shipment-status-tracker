import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const ShipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-blue-600">Shipments</Link>
        <span>&rarr;</span>
        <span className="text-slate-900 font-medium">{id}</span>
      </div>

      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shipment Details</h1>
        <p className="mt-1 text-sm text-slate-500">
          Showing complete tracking history and transition details for shipment ID: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{id}</code>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <p className="text-sm text-slate-500 text-center">
          Single shipment details, status timeline, and status update actions will be connected in the upcoming milestones.
        </p>
      </div>
    </div>
  );
};

export default ShipmentDetails;
