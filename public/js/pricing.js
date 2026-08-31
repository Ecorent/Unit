const DAY_MS = 24 * 60 * 60 * 1000;

export function isNightly(unit) {
  return unit?.pricingType === "nightly";
}

export function formatListingPrice(unit, t) {
  if (isNightly(unit)) return t("seasonal_rates");
  return `$${Number(unit?.price).toLocaleString()} / ${t("per_month")}`;
}

export function formatMapPrice(unit, t) {
  if (isNightly(unit)) return t("seasonal_marker");
  return `$${Number(unit?.price).toLocaleString()}`;
}

export function getSeasonBounds(rates = []) {
  const valid = rates.filter(rate => rate?.startDate && rate?.endDate);
  if (!valid.length) return null;
  return {
    firstDate: valid.reduce((min, rate) => rate.startDate < min ? rate.startDate : min, valid[0].startDate),
    lastCheckout: addDays(valid.reduce((max, rate) => rate.endDate > max ? rate.endDate : max, valid[0].endDate), 1)
  };
}

export function calculateNightlyQuote(rates, checkIn, checkOut) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  if (!start || !end || end <= start) return { error: "invalid_dates" };

  const normalizedRates = (rates || [])
    .filter(rate => rate?.startDate && rate?.endDate && Number(rate?.nightlyRate) > 0)
    .map(rate => ({
      ...rate,
      start: parseDate(rate.startDate),
      endExclusive: new Date(parseDate(rate.endDate).getTime() + DAY_MS),
      nightlyRate: Number(rate.nightlyRate)
    }));

  const segments = [];
  let total = 0;
  let nights = 0;

  for (let date = start; date < end; date = new Date(date.getTime() + DAY_MS)) {
    const season = normalizedRates.find(rate => date >= rate.start && date < rate.endExclusive);
    if (!season) return { error: "unpriced_dates", missingDate: formatDate(date) };

    total += season.nightlyRate;
    nights += 1;
    const previous = segments[segments.length - 1];

    if (previous?.nightlyRate === season.nightlyRate) {
      previous.nights += 1;
      previous.endDate = formatDate(new Date(date.getTime() + DAY_MS));
      previous.subtotal += season.nightlyRate;
    } else {
      segments.push({
        startDate: formatDate(date),
        endDate: formatDate(new Date(date.getTime() + DAY_MS)),
        nightlyRate: season.nightlyRate,
        nights: 1,
        subtotal: season.nightlyRate
      });
    }
  }

  return { total, nights, segments };
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value, days) {
  const date = parseDate(value);
  return formatDate(new Date(date.getTime() + days * DAY_MS));
}
