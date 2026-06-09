const SANITY_PROJECT_ID = "uxragbo5";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2023-10-01";

const query = `
  *[_type == "unit" && slug.current == $slug][0]{
    title{en, es},
    price,
    address,
    bedrooms,
    bathrooms,
    sqft,
    utilitiesIncluded{en, es},
    petFriendly,
    washerDryer{en, es},
    locationHighlights{en, es},
    parking{en, es},
    deposit,
    availability {
      availableFrom,
      availableNow
    },
    images[]{asset->{url}}
  }
`;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = typeof req.query.slug === "string" ? req.query.slug.trim() : "";

  if (!slug) {
    return res.status(400).json({ error: "Missing slug" });
  }

  const params = new URLSearchParams({ query });
  params.set("$slug", JSON.stringify(slug));

  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Sanity request failed" });
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ result: data.result || null });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load unit" });
  }
}
