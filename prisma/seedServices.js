import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Mirrors the services already configured on the local/dev database at
// the time this was written (including real prices set via /admin/services
// for some of them — not just the original ₦0 placeholder template).
// Upserted by slug, so running this again later is safe and just updates
// existing rows rather than duplicating them.
const services = [
  // Home Care — per-unit steppers
  { name: "Windows", slug: "windows", category: "HOME_CARE", pricingType: "PER_UNIT", unitPrice: 4000, unitLabel: "window", order: 1 },
  { name: "Bedroom", slug: "bedroom", category: "HOME_CARE", pricingType: "PER_UNIT", unitPrice: 65000, unitLabel: "bedroom", order: 2 },
  { name: "Livingroom", slug: "livingroom", category: "HOME_CARE", pricingType: "PER_UNIT", unitPrice: 25000, unitLabel: "livingroom", order: 3 },
  { name: "Kitchen", slug: "kitchen", category: "HOME_CARE", pricingType: "PER_UNIT", unitPrice: 6500, unitLabel: "kitchen", order: 4 },
  { name: "Veranda", slug: "veranda", category: "HOME_CARE", pricingType: "PER_UNIT", unitPrice: 450000, unitLabel: "veranda", order: 5 },
  { name: "Bathroom", slug: "bathroom", category: "HOME_CARE", pricingType: "PER_UNIT", unitPrice: 0, unitLabel: "bathroom", order: 6 },
  { name: "Storage", slug: "storage", category: "HOME_CARE", pricingType: "PER_UNIT", unitPrice: 0, unitLabel: "storage", order: 7 },

  // Home Care — flat add-ons
  { name: "Lobby", slug: "lobby", category: "HOME_CARE", pricingType: "FLAT", unitPrice: 0, order: 8 },
  { name: "Hall", slug: "hall", category: "HOME_CARE", pricingType: "FLAT", unitPrice: 0, order: 9 },
  { name: "One-time Regular Cleaning", slug: "one-time-regular-cleaning", category: "HOME_CARE", pricingType: "FLAT", unitPrice: 0, order: 10 },
  { name: "One-time Deep Cleaning", slug: "one-time-deep-cleaning", category: "HOME_CARE", pricingType: "FLAT", unitPrice: 0, order: 11 },
  { name: "Post Construction", slug: "post-construction", category: "HOME_CARE", pricingType: "FLAT", unitPrice: 0, order: 12 },
  { name: "Recurring (Monthly subscription)", slug: "recurring-monthly", category: "HOME_CARE", pricingType: "FLAT", unitPrice: 0, order: 13 },

  // Car Care — frequency tiers
  { name: "Car Wash", slug: "car-wash-2x", category: "CAR_CARE", pricingType: "PER_UNIT", unitPrice: 0, unitLabel: "car", tierLabel: "2 times /week", order: 1 },
  { name: "Car Wash", slug: "car-wash-3x", category: "CAR_CARE", pricingType: "PER_UNIT", unitPrice: 0, unitLabel: "car", tierLabel: "3 times /week", order: 2 },
  { name: "Car Wash", slug: "car-wash-4x", category: "CAR_CARE", pricingType: "PER_UNIT", unitPrice: 0, unitLabel: "car", tierLabel: "4 times /week", order: 3 },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }
  console.log(`Seeded ${services.length} services`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
