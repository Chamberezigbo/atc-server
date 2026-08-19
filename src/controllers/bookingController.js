import prisma from "../db/prismaClient.js";

export async function createBooking(req, res) {
  const { name, email, phone, location, category, lineItems } = req.body;

  if (!name || !email || !phone || !location || !category) {
    return res.status(400).json({
      error: "name, email, phone, location, and category are required",
    });
  }

  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one line item is required" });
  }

  // Never trust prices (or even descriptions) from the client — look up
  // each service live and price the booking from what's actually in the
  // database right now, same principle as invoiceController.createInvoice.
  const serviceIds = lineItems.map((item) => item.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
  });
  const serviceById = new Map(services.map((s) => [s.id, s]));

  const resolvedLineItems = [];
  for (const item of lineItems) {
    const service = serviceById.get(item.serviceId);
    if (!service) {
      return res.status(400).json({
        error: `Service ${item.serviceId} is not available`,
      });
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ error: `Invalid quantity for ${service.name}` });
    }
    if (service.pricingType === "FLAT" && quantity !== 1) {
      return res
        .status(400)
        .json({ error: `${service.name} can only be booked once` });
    }

    resolvedLineItems.push({
      serviceId: service.id,
      description: service.tierLabel
        ? `${service.name} — ${service.tierLabel}`
        : service.name,
      quantity,
      unitPrice: service.unitPrice,
    });
  }

  const totalAmount = resolvedLineItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0,
  );

  // A booking is also a customer contact reaching out — mirror it into
  // Leads too (source: "booking" distinguishes it from the WhatsApp CTA
  // form's "whatsapp_cta") so all inbound contacts are visible in one
  // place regardless of how they came in. Transaction so a booking never
  // gets recorded without its matching lead, or vice versa.
  const [booking] = await prisma.$transaction([
    prisma.booking.create({
      data: {
        name,
        email,
        phone,
        location,
        category,
        totalAmount,
        lineItems: { create: resolvedLineItems },
      },
      include: { lineItems: true },
    }),
    prisma.lead.create({
      data: { name, email, phone, source: "booking" },
    }),
  ]);

  res.status(201).json(booking);
}

export async function getAllBookings(req, res) {
  const bookings = await prisma.booking.findMany({
    include: { lineItems: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(bookings);
}

export async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!["new", "contacted", "invoiced"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { lineItems: true },
  });
  res.json(booking);
}
