import { Router } from 'express';
import {
  createShipmentHandler,
  getShipmentByIdHandler,
  getShipmentsHandler,
  updateShipmentStatusHandler,
} from '../controllers/shipment.controller.js';

const router = Router();

// GET /api/shipments
router.get('/', getShipmentsHandler);

// GET /api/shipments/:id
router.get('/:id', getShipmentByIdHandler);

// POST /api/shipments
router.post('/', createShipmentHandler);

// PATCH /api/shipments/:id/status
router.patch('/:id/status', updateShipmentStatusHandler);

export default router;
