import { Router } from 'express';
import { createShipmentHandler } from '../controllers/shipment.controller';

const router = Router();

// POST /api/shipments
router.post('/', createShipmentHandler);

export default router;
