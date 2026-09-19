import axios from "axios";
import type {
  CreateShipmentInput,
  PaginatedShipmentsResponse,
  Shipment,
  ShipmentStatus,
  UpdateShipmentStatusInput,
} from "../types/shipment";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getShipments = async (
  search?: string,
  status?: ShipmentStatus | "",
  page = 1,
  limit = 10
): Promise<PaginatedShipmentsResponse> => {
  const response = await api.get("/shipments", {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    },
  });

  return {
    shipments: response.data.shipments,
    pagination: response.data.pagination,
  };
};

export const getShipmentById = async (id: string): Promise<Shipment> => {
  const response = await api.get(`/shipments/${id}`);
  return response.data.shipment;
};

export const createShipment = async (shipment: CreateShipmentInput): Promise<Shipment> => {
  const response = await api.post("/shipments", shipment);
  return response.data.shipment;
};

export const updateShipmentStatus = async (
  id: string,
  update: UpdateShipmentStatusInput
): Promise<Shipment> => {
  const response = await api.patch(`/shipments/${id}/status`, update);
  return response.data.shipment;
};

export default api;
