/**
 * Status of a shipment in the tracking system.
 */
export type ShipmentStatus = 'BOOKED' | 'IN_TRANSIT' | 'CUSTOMS_HOLD' | 'DELIVERED';

/**
 * Historical record of a status change for a shipment.
 */
export interface ShipmentStatusHistory {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  note: string | null;
  createdAt: string;
}

/**
 * Core shipment entity.
 */
export interface Shipment {
  id: string;
  referenceNumber: string;
  origin: string;
  destination: string;
  currentStatus: ShipmentStatus;
  expectedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: ShipmentStatusHistory[];
}

/**
 * Data required to create a new shipment.
 */
export interface CreateShipmentInput {
  referenceNumber: string;
  origin: string;
  destination: string;
  expectedDeliveryDate: string;
}

/**
 * Data required to update a shipment's status.
 */
export interface UpdateShipmentStatusInput {
  status: ShipmentStatus;
  note?: string;
}
