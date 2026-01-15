import { useEffect } from "react";
import { set } from "sanity";
import { TextInput, Stack, Text } from "@sanity/ui";

export default function AddressWithGeocode(props) {
  const { value, onChange, document } = props;

  useEffect(() => {
    if (!value) return;
    if (document?.location?.lat && document?.location?.lng) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`,
          {
            headers: {
              "User-Agent": "Ecorent Sanity Studio"
            }
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        if (!data.length) return;

        const { lat, lon } = data[0];

        onChange(
          set(
            {
              lat: Number(lat),
              lng: Number(lon)
            },
            ["location"]
          )
        );
      } catch (err) {
        console.error("Address geocoding failed:", err);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Stack space={2}>
      <TextInput
        value={value || ""}
        onChange={e => onChange(set(e.currentTarget.value))}
        placeholder="123 Main St, City, State"
      />
      <Text size={1} muted>
        Map location will be set automatically
      </Text>
    </Stack>
  );
}
