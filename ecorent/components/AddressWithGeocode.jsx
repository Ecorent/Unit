import { useEffect } from "react";
import { set, unset } from "sanity";
import { TextInput, Stack, Text } from "@sanity/ui";

export default function AddressWithGeocode(props) {
  const { value, onChange } = props;

  useEffect(() => {
    if (!value || typeof value !== "string") return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
        );
        const data = await res.json();

        if (!data?.length) {
          onChange(unset(["location"]));
          return;
        }

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
      } catch (e) {
        console.error("Geocoding failed", e);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [value, onChange]);

  return (
    <Stack space={2}>
      <TextInput
        value={value || ""}
        onChange={e => onChange(set(e.currentTarget.value))}
        placeholder="123 Main St, Austin TX"
      />
      <Text size={1} muted>
        Location is generated automatically
      </Text>
    </Stack>
  );
}
