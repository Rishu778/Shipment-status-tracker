import { Request, Response } from 'express';
import { Prisma, ShipmentStatus } from '../generated/prisma/client';
import {
  createShipment,
  getShipmentById,
  getShipments,
  updateShipmentStatus,
} from '../services/shipment.service';

const VALID_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.BOOKED,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.CUSTOMS_HOLD,
  ShipmentStatus.DELIVERED,
];

/**
 * Allowed status transitions:
 * - BOOKED -> IN_TRANSIT
 * - IN_TRANSIT -> CUSTOMS_HOLD, DELIVERED
 * - CUSTOMS_HOLD -> IN_TRANSIT, DELIVERED
 * - DELIVERED -> No transitions allowed (terminal state)
 */
const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  [ShipmentStatus.BOOKED]: [ShipmentStatus.IN_TRANSIT],
  [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.CUSTOMS_HOLD, ShipmentStatus.DELIVERED],
  [ShipmentStatus.CUSTOMS_HOLD]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED],
  [ShipmentStatus.DELIVERED]: [],
};

/**
 * Controller to handle retrieving shipments with optional search and status filtering.
 */
export const getShipmentsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    let search: string | undefined;
    let status: ShipmentStatus | undefined;

    // Validate and parse search parameter
    if (typeof req.query.search === 'string') {
      const trimmedSearch = req.query.search.trim();
      if (trimmedSearch) {
        search = trimmedSearch;
      }
    }

    // Validate and parse status parameter
    if (req.query.status !== undefined) {
      if (typeof req.query.status !== 'string') {
        res.status(400).json({
          message: `Invalid status parameter. Allowed statuses are: ${VALID_STATUSES.join(', ')}`,
        });
        return;
      }

      const trimmedStatus = req.query.status.trim();
      if (trimmedStatus) {
        if (!VALID_STATUSES.includes(trimmedStatus as ShipmentStatus)) {
          res.status(400).json({
            message: `Invalid status '${req.query.status}'. Allowed statuses are: ${VALID_STATUSES.join(', ')}`,
          });
          return;
        }
        status = trimmedStatus as ShipmentStatus;
      }
    }

    const shipments = await getShipments({ search, status });

    res.status(200).json({
      shipments,
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({
      message: 'Failed to fetch shipments',
    });
  }
};

/**
 * Controller to handle creation of a new shipment.
 */
export const createShipmentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referenceNumber, origin, destination, expectedDeliveryDate } = req.body || {};

    // Validate required fields
    if (!referenceNumber || typeof referenceNumber !== 'string' || !referenceNumber.trim()) {
      res.status(400).json({
        message: 'referenceNumber is required and must be a non-empty string',
      });
      return;
    }

    if (!origin || typeof origin !== 'string' || !origin.trim()) {
      res.status(400).json({
        message: 'origin is required and must be a non-empty string',
      });
      return;
    }

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      res.status(400).json({
        message: 'destination is required and must be a non-empty string',
      });
      return;
    }

    if (!expectedDeliveryDate || (typeof expectedDeliveryDate === 'string' && !expectedDeliveryDate.trim())) {
      res.status(400).json({
        message: 'expectedDeliveryDate is required',
      });
      return;
    }

    // Validate that expectedDeliveryDate is a valid date
    const parsedDeliveryDate = new Date(expectedDeliveryDate);
    if (isNaN(parsedDeliveryDate.getTime())) {
      res.status(400).json({
        message: 'expectedDeliveryDate must be a valid date',
      });
      return;
    }

    // Create the shipment with initial status BOOKED
    const shipment = await createShipment({
      referenceNumber: referenceNumber.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      expectedDeliveryDate: parsedDeliveryDate,
    });

    res.status(201).json({
      message: 'Shipment created successfully',
      shipment,
    });
  } catch (error: any) {
    // Handle unique constraint violation (duplicate referenceNumber)
    if (
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') ||
      error?.code === 'P2002'
    ) {
      res.status(409).json({
        message: `Shipment with reference number '${req.body?.referenceNumber}' already exists`,
      });
      return;
    }

    console.error('Error creating shipment:', error);
    res.status(500).json({
      message: 'Failed to create shipment',
    });
  }
};

/**
 * Controller to handle updating a shipment's status with transition enforcement.
 */
export const updateShipmentStatusHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== 'string' || !id.trim()) {
      res.status(400).json({
        message: 'Shipment ID is required',
      });
      return;
    }

    const { status, note } = req.body || {};

    // 1. Validate that status is provided and valid
    if (!status || typeof status !== 'string' || !VALID_STATUSES.includes(status as ShipmentStatus)) {
      res.status(400).json({
        message: `Invalid status '${status}'. Allowed statuses are: ${VALID_STATUSES.join(', ')}`,
      });
      return;
    }

    const targetStatus = status as ShipmentStatus;

    // 2. Find shipment by ID
    const shipment = await getShipmentById(id.trim());
    if (!shipment) {
      res.status(404).json({
        message: `Shipment with ID '${id}' not found`,
      });
      return;
    }

    // 3. Enforce valid status transition
    const allowedTransitions = ALLOWED_TRANSITIONS[shipment.currentStatus] || [];
    if (!allowedTransitions.includes(targetStatus)) {
      if (shipment.currentStatus === ShipmentStatus.DELIVERED) {
        res.status(400).json({
          message: `Cannot transition shipment from 'DELIVERED'. No transitions are allowed from DELIVERED.`,
        });
        return;
      }

      res.status(400).json({
        message: `Cannot transition shipment from '${shipment.currentStatus}' to '${targetStatus}'. Allowed transitions: ${allowedTransitions.join(', ')}`,
      });
      return;
    }

    // 4. Update shipment status and create status history entry via nested write
    const updatedShipment = await updateShipmentStatus(id.trim(), targetStatus, note);
    const newStatusHistory = updatedShipment.statusHistory[0];

    res.status(200).json({
      message: 'Shipment status updated successfully',
      shipment: updatedShipment,
      statusHistory: newStatusHistory,
    });
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({
      message: 'Failed to update shipment status',
    });
  }
};
