import { Router } from 'express';
import {
  createShipmentHandler,
  getShipmentsHandler,
  updateShipmentStatusHandler,
} from '../controllers/shipment.controller';

const router = Router();

// GET /api/shipments
router.get('/', getShipmentsHandler);

// POST /api/shipments
router.post('/', createShipmentHandler);

// PATCH /api/shipments/:id/status
router.patch('/:id/status', updateShipmentStatusHandler);

export default router;
