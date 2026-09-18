import axios from "axios";
import type { CreateShipmentInput, Shipment, ShipmentStatus } from "../types/shipment";

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

export const getShipmentById = async (id: string): Promise<Shipment> => {
  const response = await api.get(`/shipments/${id}`);
  return response.data.shipment;
};

export const createShipment = async (shipment: CreateShipmentInput): Promise<Shipment> => {
  const response = await api.post("/shipments", shipment);
  return response.data.shipment;
};

export default api;
