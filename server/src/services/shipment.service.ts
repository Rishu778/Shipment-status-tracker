// import { prisma } from '../lib/prisma';

// export interface CreateShipmentInput {
//   referenceNumber: string;
//   origin: string;
//   destination: string;
//   expectedDeliveryDate: Date;
// }

// /**
//  * Creates a shipment and its initial status history entry atomically.
//  */
// export const createShipment = async (input: CreateShipmentInput) => {
//   return await prisma.$transaction(async (tx) => {
//     // 1. Create the Shipment record with initial status BOOKED
//     const shipment = await tx.shipment.create({
//       data: {
//         referenceNumber: input.referenceNumber,
//         origin: input.origin,
//         destination: input.destination,
//         currentStatus: 'BOOKED',
//         expectedDeliveryDate: input.expectedDeliveryDate,
//       },
//     });

//     // 2. Create the first ShipmentStatusHistory entry
//     await tx.shipmentStatusHistory.create({
//       data: {
//         shipmentId: shipment.id,
//         status: 'BOOKED',
//         note: 'Shipment created',
//       },
//     });

//     return shipment;
//   });
// };

import { prisma } from "../lib/prisma";

interface CreateShipmentInput {
  referenceNumber: string;
  origin: string;
  destination: string;
  expectedDeliveryDate: string;
}

export const createShipment = async (data: CreateShipmentInput) => {
  const expectedDeliveryDate = new Date(data.expectedDeliveryDate);

  if (Number.isNaN(expectedDeliveryDate.getTime())) {
    throw new Error("Invalid expected delivery date");
  }

  const shipment = await prisma.shipment.create({
    data: {
      referenceNumber: data.referenceNumber,
      origin: data.origin,
      destination: data.destination,
      expectedDeliveryDate,
      currentStatus: "BOOKED",

      statusHistory: {
        create: {
          status: "BOOKED",
          note: "Shipment created",
        },
      },
    },
    include: {
      statusHistory: true,
    },
  });

  return shipment;
};