import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShipmentCard from "../components/ShipmentCard";
import SearchBar from "../components/SearchBar";
import { getShipments } from "../services/api";
import type { Shipment, ShipmentStatus } from "../types/shipment";

const Dashboard = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ShipmentStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadShipments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getShipments(search, status);
      setShipments(data);
    } catch (requestError) {
      console.error(requestError);
      setError("We could not load shipments. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadShipments();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Operations overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Shipment Dashboard</h1>
          <p className="mt-1 text-slate-500">Search, review, and manage your shipment statuses.</p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Shipment
        </Link>
      </div>

      <section aria-label="Shipment filters" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <SearchBar
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={(value) => setStatus(value as ShipmentStatus | "")}
        />
      </section>

      {loading && (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-600">Loading shipments...</p>
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-semibold">Unable to load shipments</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-base font-semibold text-slate-900">No shipments found</h2>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or filter, or create a new shipment to get started.
          </p>
        </div>
      )}

      {!loading && !error && shipments.length > 0 && (
        <section aria-label="Shipment results" className="grid gap-4 lg:grid-cols-2">
          {shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
