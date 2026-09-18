import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createShipment } from "../services/api";
import type { CreateShipmentInput } from "../types/shipment";

const initialFormData: CreateShipmentInput = {
  referenceNumber: "",
  origin: "",
  destination: "",
  expectedDeliveryDate: "",
};

export const CreateShipment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateShipmentInput>(initialFormData);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const shipment = {
      referenceNumber: formData.referenceNumber.trim(),
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      expectedDeliveryDate: formData.expectedDeliveryDate,
    };

    if (Object.values(shipment).some((value) => !value)) {
      setSuccess("");
      setError("Please complete all fields before creating the shipment.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const createdShipment = await createShipment(shipment);
      setSuccess("Shipment created successfully. Redirecting to its details...");

      window.setTimeout(() => {
        navigate(`/shipments/${createdShipment.id}`);
      }, 600);
    } catch (requestError: unknown) {
      const backendMessage = axios.isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined;

      setError(backendMessage ?? "Unable to create the shipment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Shipment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Register a new shipment in the tracking system with initial status BOOKED.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Reference Number</span>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(event) =>
                setFormData((current) => ({ ...current, referenceNumber: event.target.value }))
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="e.g. SHP-2026-001"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Expected Delivery Date</span>
            <input
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={(event) =>
                setFormData((current) => ({ ...current, expectedDeliveryDate: event.target.value }))
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Origin</span>
            <input
              type="text"
              value={formData.origin}
              onChange={(event) =>
                setFormData((current) => ({ ...current, origin: event.target.value }))
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="City or facility"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Destination</span>
            <input
              type="text"
              value={formData.destination}
              onChange={(event) =>
                setFormData((current) => ({ ...current, destination: event.target.value }))
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="City or facility"
            />
          </label>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-w-40 items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isSubmitting ? "Creating shipment..." : "Create Shipment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateShipment;
