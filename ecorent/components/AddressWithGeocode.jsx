import { useEffect } from "react";
import { Stack, TextInput } from "@sanity/ui";
import { PatchEvent, set, unset } from "sanity";

export default function AddressWithGeocode(props) {
  const { value, onChange } = props;

  useEffect(() => {
    if (!value || typeof value !== "string") return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(
            value
          )}`
        );

        const data = await res.json();
        if (!data?.length) return;

        const { lat, lon } = data[0];

        onChange(
          PatchEvent.from(
            set(value),
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
  }, [value, onChange]);

  return (
    <Stack space={2}>
      <TextInput
        value={value || ""}
        onChange={e =>
          onChange(PatchEvent.from(set(e.currentTarget.value)))
        }
        placeholder="123 Main St, Grand Rapids, MI"
      />
    </Stack>
  );
}

