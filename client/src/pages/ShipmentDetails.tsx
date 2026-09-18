import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import StatusBadge from "../components/StatusBadge";
import StatusTimeline from "../components/StatusTimeline";
import { getShipmentById, updateShipmentStatus } from "../services/api";
import type { Shipment, ShipmentStatus } from "../types/shipment";

const validNextStatuses: Record<ShipmentStatus, ShipmentStatus[]> = {
  BOOKED: ["IN_TRANSIT"],
  IN_TRANSIT: ["CUSTOMS_HOLD", "DELIVERED"],
  CUSTOMS_HOLD: ["IN_TRANSIT", "DELIVERED"],
  DELIVERED: [],
};

const statusLabels: Record<ShipmentStatus, string> = {
  BOOKED: "Booked",
  IN_TRANSIT: "In Transit",
  CUSTOMS_HOLD: "Customs Hold",
  DELIVERED: "Delivered",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const ShipmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus | "">("");
  const [note, setNote] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadShipment = useCallback(
    async (showLoading = true) => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }
        setNotFound(false);
        setError("");

        const data = await getShipmentById(id);
        setShipment(data);
      } catch (requestError: unknown) {
        if (axios.isAxiosError(requestError) && requestError.response?.status === 404) {
          setNotFound(true);
        } else {
          const backendMessage = axios.isAxiosError<{ message?: string }>(requestError)
            ? requestError.response?.data?.message
            : undefined;
          setError(backendMessage ?? "Failed to load shipment details. Please try again.");
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    void loadShipment();
  }, [loadShipment]);

  const handleStatusUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id || !selectedStatus) {
      setUpdateSuccess("");
      setUpdateError("Please select a status before updating the shipment.");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError("");
      setUpdateSuccess("");

      await updateShipmentStatus(id, {
        status: selectedStatus,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      await loadShipment(false);

      setSelectedStatus("");
      setNote("");
      setUpdateSuccess("Shipment status updated successfully.");
    } catch (requestError: unknown) {
      const backendMessage = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setUpdateError(backendMessage ?? "Unable to update shipment status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-slate-500">
        Loading shipment details...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Shipment not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The shipment may have been removed or the link is incorrect.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-900">Unable to load shipment</h1>
        <p className="mt-1 text-sm text-red-700">{error || "Shipment details are unavailable."}</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const history = [...(shipment.statusHistory ?? [])].sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
  );
  const nextStatuses = validNextStatuses[shipment.currentStatus];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            &larr; Return to Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Shipment Details</h1>
          <p className="mt-1 text-slate-500">View shipment information and its complete tracking history.</p>
        </div>
        <StatusBadge status={shipment.currentStatus} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reference Number</p>
            <p className="mt-1 break-words text-base font-semibold text-slate-900">{shipment.referenceNumber}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Origin</p>
            <p className="mt-1 text-base text-slate-900">{shipment.origin}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination</p>
            <p className="mt-1 text-base text-slate-900">{shipment.destination}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Status</p>
            <div className="mt-1"><StatusBadge status={shipment.currentStatus} /></div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expected Delivery Date</p>
            <p className="mt-1 text-base text-slate-900">{formatDate(shipment.expectedDeliveryDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Created At</p>
            <p className="mt-1 text-base text-slate-900">{formatDateTime(shipment.createdAt)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Update Status</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose the next status and optionally include a tracking note.
          </p>
        </div>

        {nextStatuses.length === 0 ? (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            Shipment has been delivered. No further status updates are available.
          </div>
        ) : (
          <form onSubmit={handleStatusUpdate} className="space-y-5">
            {updateError && (
              <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {updateError}
              </div>
            )}
            {updateSuccess && (
              <div role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
                {updateSuccess}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>New Status</span>
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value as ShipmentStatus | "")}
                  disabled={isUpdating}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Select the next status</option>
                  {nextStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Note <span className="font-normal text-slate-500">(optional)</span></span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={isUpdating}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  placeholder="Add a tracking update..."
                />
              </label>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex min-w-36 items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isUpdating ? "Updating status..." : "Update Status"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Status History</h2>
          <p className="mt-1 text-sm text-slate-500">Events are shown from oldest to newest.</p>
        </div>
        <StatusTimeline history={history} />
      </section>
    </div>
  );
};

export default ShipmentDetails;
