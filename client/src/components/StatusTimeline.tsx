import React from "react";
import StatusBadge from "./StatusBadge";
import type { ShipmentStatusHistory } from "../types/shipment";

interface StatusTimelineProps {
  history?: ShipmentStatusHistory[];
}

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ history = [] }) => {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
        No status history has been recorded yet.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, index) => {
          const isLatest = index === history.length - 1;

          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {!isLatest && (
                  <span
                    className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-8 ring-white ${
                    isLatest ? "bg-blue-600" : "bg-slate-100"
                  }`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${isLatest ? "bg-white" : "bg-blue-600"}`} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        {isLatest && (
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Latest</span>
                        )}
                      </div>
                      <time dateTime={item.createdAt} className="text-xs text-slate-500">
                        {formatTimestamp(item.createdAt)}
                      </time>
                    </div>
                    {item.note && (
                      <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StatusTimeline;
