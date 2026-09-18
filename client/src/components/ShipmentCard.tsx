import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import type { Shipment } from "../types/shipment";

interface ShipmentCardProps {
  shipment: Shipment;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment }) => {
  return (
    <Link
      to={`/shipments/${shipment.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`View shipment ${shipment.referenceNumber}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reference Number</p>
          <p className="mt-1 truncate text-base font-semibold text-slate-900 group-hover:text-blue-700">
            {shipment.referenceNumber}
          </p>
        </div>
        <StatusBadge status={shipment.currentStatus} />
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-slate-500">Route</p>
          <p className="mt-1 text-slate-700">{shipment.origin} <span aria-hidden="true">&rarr;</span> {shipment.destination}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Expected delivery</p>
          <p className="mt-1 text-slate-700">{formatDate(shipment.expectedDeliveryDate)}</p>
        </div>
      </div>
    </Link>
  );
};

export default ShipmentCard;
