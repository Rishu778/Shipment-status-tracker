import React from 'react';
import type { Shipment } from '../types/shipment';
import StatusBadge from './StatusBadge';

interface ShipmentCardProps {
  shipment?: Shipment;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment }) => {
  if (!shipment) {
    return (
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm text-slate-500 text-sm">
        Shipment card placeholder
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-slate-900">{shipment.referenceNumber}</span>
        <StatusBadge status={shipment.currentStatus} />
      </div>
      <div className="text-sm text-slate-600 space-y-1">
        <div>
          <span className="text-slate-400">Route:</span> {shipment.origin} &rarr; {shipment.destination}
        </div>
        <div>
          <span className="text-slate-400">Expected:</span>{' '}
          {new Date(shipment.expectedDeliveryDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
