import { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client';
import { createShipment } from '../services/shipment.service';

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
