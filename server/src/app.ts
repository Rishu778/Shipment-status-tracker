import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import shipmentRoutes from './routes/shipment.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Shipment Tracker API is running',
  });
});

// Shipment routes
app.use('/api/shipments', shipmentRoutes);

export default app;
