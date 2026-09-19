import { prisma } from '../lib/prisma.js';
import { Prisma, ShipmentStatus } from '../generated/prisma/client.js';

export interface CreateShipmentInput {
  referenceNumber: string;
  origin: string;
  destination: string;
  expectedDeliveryDate: string | Date;
}

export interface GetShipmentsFilters {
  search?: string;
  status?: ShipmentStatus;
  page?: number;
  limit?: number;
}

/**
 * Creates a shipment and its initial status history entry.
 */
export const createShipment = async (data: CreateShipmentInput) => {
  const expectedDeliveryDate =
    typeof data.expectedDeliveryDate === 'string'
      ? new Date(data.expectedDeliveryDate)
      : data.expectedDeliveryDate;

  if (Number.isNaN(expectedDeliveryDate.getTime())) {
    throw new Error('Invalid expected delivery date');
  }

  const shipment = await prisma.shipment.create({
    data: {
      referenceNumber: data.referenceNumber,
      origin: data.origin,
      destination: data.destination,
      expectedDeliveryDate,
      currentStatus: 'BOOKED',

      statusHistory: {
        create: {
          status: 'BOOKED',
          note: 'Shipment created',
        },
      },
    },
    include: {
      statusHistory: true,
    },
  });

  return shipment;
};

/**
 * Fetches a paginated shipment list sorted by newest first, with optional search and status filtering.
 */
export const getShipments = async (filters: GetShipmentsFilters = {}) => {
  const { search, status, page = 1, limit = 10 } = filters;

  const where: Prisma.ShipmentWhereInput = {};

  // Case-insensitive partial match on referenceNumber
  if (search && search.trim()) {
    where.referenceNumber = {
      contains: search.trim(),
      mode: 'insensitive',
    };
  }

  // Exact match on currentStatus
  if (status) {
    where.currentStatus = status;
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shipment.count({ where }),
  ]);

  return { shipments, total };
};

/**
 * Finds a single shipment by its ID.
 */
export const getShipmentById = async (id: string) => {
  return await prisma.shipment.findUnique({
    where: { id },
  });
};

/**
 * Finds a single shipment by its ID with its complete status history ordered chronologically (oldest to newest).
 */
export const getShipmentByIdWithHistory = async (id: string) => {
  return await prisma.shipment.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
};

/**
 * Updates a shipment's current status and creates a new status history entry
 * using Prisma nested relation write (no interactive transaction).
 */
export const updateShipmentStatus = async (
  id: string,
  currentStatus: ShipmentStatus,
  status: ShipmentStatus,
  note?: string
) => {
  const trimmedNote = typeof note === 'string' && note.trim() ? note.trim() : null;

  return await prisma.shipment.update({
    where: {
      id,
      currentStatus,
    },
    data: {
      currentStatus: status,
      statusHistory: {
        create: {
          status,
          note: trimmedNote,
        },
      },
    },
    include: {
      statusHistory: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });
};