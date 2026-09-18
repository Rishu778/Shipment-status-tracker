import React from 'react';
import type { ShipmentStatus } from '../types/shipment';

interface StatusBadgeProps {
  status: ShipmentStatus;
}

const statusConfig: Record<ShipmentStatus, { label: string; className: string }> = {
  BOOKED: {
    label: 'Booked',
    className: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    className: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
  },
  CUSTOMS_HOLD: {
    label: 'Customs Hold',
    className: 'bg-red-50 text-red-700 border-red-200 ring-red-600/20',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
