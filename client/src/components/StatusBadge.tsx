import React from "react";
import type { ShipmentStatus } from "../types/shipment";

interface StatusBadgeProps {
  status: ShipmentStatus;
}

const statusConfig: Record<ShipmentStatus, { label: string; className: string }> = {
  BOOKED: {
    label: "Booked",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  IN_TRANSIT: {
    label: "In Transit",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  CUSTOMS_HOLD: {
    label: "Customs Hold",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  DELIVERED: {
    label: "Delivered",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
