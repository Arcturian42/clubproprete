import { prisma } from "@/lib/prisma";

const CITY_COORDINATES: Record<string, [number, number]> = {
  Paris: [48.8566, 2.3522],
  Lyon: [45.764, 4.8357],
  Marseille: [43.2965, 5.3698],
  Bordeaux: [44.8378, -0.5792],
  Lille: [50.6292, 3.0573],
  Toulouse: [43.6047, 1.4442],
  Nantes: [47.2184, -1.5536],
  Strasbourg: [48.5734, 7.7521],
  Nice: [43.7102, 7.262],
  Rennes: [48.1173, -1.6778],
};

function getRandomParisOffset(): [number, number] {
  // Random offset around Paris (~10km radius)
  const lat = 48.8566 + (Math.random() - 0.5) * 0.18;
  const lng = 2.3522 + (Math.random() - 0.5) * 0.25;
  return [lat, lng];
}

function getCoordinatesForCity(city: string | null): [number, number] | null {
  if (!city) return null;
  const normalized = city.trim();
  for (const [name, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.toLowerCase() === name.toLowerCase()) {
      return coords;
    }
  }
  return null;
}

async function main() {
  const companies = await prisma.company.findMany({
    where: { latitude: null, longitude: null },
    select: { id: true, city: true },
  });

  console.log(`Found ${companies.length} companies without coordinates.`);

  for (const company of companies) {
    const coords = getCoordinatesForCity(company.city);
    if (coords) {
      await prisma.company.update({
        where: { id: company.id },
        data: { latitude: coords[0], longitude: coords[1] },
      });
      console.log(`Updated ${company.id} (${company.city}) → [${coords[0]}, ${coords[1]}]`);
    } else {
      const [lat, lng] = getRandomParisOffset();
      await prisma.company.update({
        where: { id: company.id },
        data: { latitude: lat, longitude: lng },
      });
      console.log(`Updated ${company.id} (${company.city || "no city"}) → random around Paris`);
    }
  }

  console.log("Done seeding coordinates.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
