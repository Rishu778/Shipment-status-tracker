import axios from "axios";
import type { Shipment, ShipmentStatus } from "../types/shipment";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getShipments = async (
  search?: string,
  status?: ShipmentStatus | ""
): Promise<Shipment[]> => {
  const response = await api.get("/shipments", {
    params: {
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    },
  });

  return response.data.shipments;
};

export default api;