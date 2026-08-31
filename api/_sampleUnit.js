export const SAMPLE_UNIT_SLUG = "sample-seasonal-lake-house";

export const sampleUnit = {
  title: {
    en: "LOCAL PREVIEW — Seasonal Lake House",
    es: "VISTA LOCAL — Casa de lago por temporada"
  },
  slug: { current: SAMPLE_UNIT_SLUG },
  pricingType: "nightly",
  seasonalRates: [
    { startDate: "2026-09-01", endDate: "2026-10-31", nightlyRate: 145 },
    { startDate: "2026-11-01", endDate: "2026-12-19", nightlyRate: 120 },
    { startDate: "2026-12-20", endDate: "2027-01-05", nightlyRate: 225 },
    { startDate: "2027-01-06", endDate: "2027-04-30", nightlyRate: 110 },
    { startDate: "2027-05-01", endDate: "2027-08-31", nightlyRate: 175 }
  ],
  address: "100 Preview Lake Drive, Allegan, MI",
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1650,
  utilitiesIncluded: {
    en: "Water and internet included",
    es: "Agua e internet incluidos"
  },
  petFriendly: true,
  washerDryer: {
    en: "Private washer and dryer",
    es: "Lavadora y secadora privadas"
  },
  locationHighlights: {
    en: "Lake access, quiet setting, and nearby trails",
    es: "Acceso al lago, zona tranquila y senderos cercanos"
  },
  parking: {
    en: "Two private parking spaces",
    es: "Dos espacios de estacionamiento privados"
  },
  deposit: 300,
  availability: {
    availableFrom: "2026-09-01",
    availableNow: false
  },
  latitude: 42.5292,
  longitude: -85.8553,
  images: [
    { asset: { url: "/images/unit1/1.jpg" } },
    { asset: { url: "/images/unit1/2.jpg" } },
    { asset: { url: "/images/unit1/3.jpg" } }
  ]
};

export function canUseLocalSample() {
  return process.env.VERCEL_ENV !== "production";
}
