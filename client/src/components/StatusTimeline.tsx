import React from 'react';
import type { ShipmentStatusHistory } from '../types/shipment';
import StatusBadge from './StatusBadge';

interface StatusTimelineProps {
  history?: ShipmentStatusHistory[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic py-4">
        No status history recorded yet.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, index) => (
          <li key={item.id || index}>
            <div className="relative pb-8">
              {index !== history.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {item.note && (
                    <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusTimeline;
