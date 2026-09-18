import { useEffect, useState } from "react";
import type { Shipment, ShipmentStatus } from "../types/shipment";
import { getShipments } from "../services/api";
import ShipmentCard from "../components/ShipmentCard";

const statuses: ShipmentStatus[] = [
  "BOOKED",
  "IN_TRANSIT",
  "CUSTOMS_HOLD",
  "DELIVERED",
];

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
    } catch (err) {
      console.error(err);
      setError("Failed to load shipments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadShipments();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Shipment Dashboard
        </h1>
        <p className="mt-1 text-slate-500">
          Track and manage shipment status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <input
          type="text"
          placeholder="Search by reference number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as ShipmentStatus | "")
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
        >
          <option value="">All statuses</option>

          {statuses.map((item) => (
            <option key={item} value={item}>
              {item.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500">
          Loading shipments...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && shipments.length === 0 && (
        <div className="rounded-lg bg-white p-8 text-center text-slate-500">
          No shipments found.
        </div>
      )}

      {!loading && !error && shipments.length > 0 && (
        <div className="grid gap-4">
          {shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;