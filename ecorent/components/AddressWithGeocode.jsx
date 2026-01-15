import { useEffect } from "react";
import { Stack, TextInput } from "@sanity/ui";
import { PatchEvent, set } from "sanity";

export default function AddressWithGeocode(props) {
  const { value, onChange } = props;

  // ✅ HARD normalize: address can ONLY be a string
  const safeValue = typeof value === "string" ? value : "";

  useEffect(() => {
    if (!safeValue) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(
            safeValue
          )}`,
          {
            headers: {
              "User-Agent": "ecorentusa.com (admin@ecorentusa.com)"
            }
          }
        );

        const data = await res.json();
        if (!data?.length) return;

        const { lat, lon } = data[0];

        onChange(
          PatchEvent.from(
            set(
              {
                lat: Number(lat),
                lng: Number(lon)
              },
              ["location"]
            )
          )
        );
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [safeValue, onChange]);

  return (
    <Stack space={2}>
      <TextInput
        value={safeValue}
        onChange={e =>
          onChange(
            PatchEvent.from(
              set(e.currentTarget.value, ["address"])
            )
          )
        }
        placeholder="123 Main St, Grand Rapids, MI"
      />
    </Stack>
  );
}
