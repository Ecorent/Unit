import sanityClient from "@sanity/client";

const client = sanityClient({
  projectId: "uxragbo5",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function fixAddresses() {
  const docs = await client.fetch(`
    *[_type == "unit" && defined(address.location)]{
      _id
    }
  `);

  console.log(`Fixing ${docs.length} documents`);

  for (const doc of docs) {
    await client
      .patch(doc._id)
      .unset(["address"])
      .commit();
  }

  console.log("Done.");
}

fixAddresses().catch(console.error);
