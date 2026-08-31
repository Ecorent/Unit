function validateWidth(value, maxWidth = 25) {
  if (!value) return true;

  const charWidths = {
    i: 0.5, l: 0.5, j: 0.5, t: 0.6, f: 0.6,
    m: 1.5, w: 1.5, q: 1.4, g: 1.3,
    a: 1, b: 1, c: 1, d: 1, e: 1, h: 1, k: 1, n: 1, o: 1, p: 1, r: 1, s: 1, u: 1, v: 1, x: 1, y: 1, z: 1,
    "0": 1, "1": 0.8, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 0.9, "8": 1, "9": 1,
    " ": 0.5, ",": 0.4, ".": 0.4, "?": 1, "!": 0.5, ":": 0.4, ";": 0.4, "-": 0.6, "_": 1, "'": 0.3, '"': 0.5,
    "(": 0.5, ")": 0.5, "[": 0.5, "]": 0.5, "{": 0.6, "}": 0.6, "/": 0.5, "\\": 0.5, "&": 1.2, "@": 1.5, "#": 1, "$": 1, "%": 1.5, "^": 0.8, "*": 0.8, "+": 0.8, "=": 1
  };

  const defaultWidth = 1;

  let width = 0;
  for (let char of value.toLowerCase()) {
    width += charWidths[char] || defaultWidth;
  }

  if (width > maxWidth) return `Text too wide for display (approx. width ${width.toFixed(1)} > ${maxWidth})`;
  return true;
}

function validateSeasonalRates(rates, context) {
  if (context.document?.pricingType !== "nightly") return true;
  if (!rates?.length) return "Add at least one seasonal rate";
  if (rates.length > 5) return "You can add up to 5 seasonal rates";

  const ranges = rates.map((rate, index) => ({
    index,
    start: rate?.startDate ? new Date(`${rate.startDate}T00:00:00Z`) : null,
    end: rate?.endDate ? new Date(`${rate.endDate}T00:00:00Z`) : null
  }));

  for (const range of ranges) {
    if (!range.start || !range.end) return `Season ${range.index + 1} needs start and end dates`;
    if (range.end <= range.start) return `Season ${range.index + 1} must end after it starts`;
  }

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].start <= sorted[index - 1].end) {
      return "Seasonal date ranges cannot overlap";
    }
  }

  return true;
}

export default {
  name: "unit",
  title: "Rental Unit",
  type: "document",

  fields: [
    {
      name: "order",
      title: "Display Order",
      description: "Lower numbers appear first (1 = first)",
      type: "number",
      initialValue: 100
    },

    {
      name: "title",
      title: "Title",
      type: "object",
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 26)) },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 26)) }
      ]
    },

    {
      name: "slug",
      title: "Slug",
      description: "Click the Generate button to create the URL for this specific unit.",
      type: "slug",
      options: {
        source: "title.en",
        maxLength: 96,
        slugify: input =>
          input
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
      },
      validation: Rule => Rule.required()
    },

    {
      name: "pricingType",
      title: "Pricing Type",
      description: "Existing units are treated as monthly until changed here.",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Monthly", value: "monthly" },
          { title: "Nightly (seasonal)", value: "nightly" }
        ]
      },
      initialValue: "monthly"
    },

    {
      name: "price",
      title: "Monthly Price",
      type: "number",
      hidden: ({ document }) => document?.pricingType === "nightly",
      validation: Rule => Rule.min(0).custom((value, context) => {
        if (context.document?.pricingType === "nightly") return true;
        return typeof value === "number" ? true : "Monthly price is required";
      })
    },

    {
      name: "seasonalRates",
      title: "Seasonal Nightly Rates",
      description: "Add exact start and end dates with the nightly price. Maximum 5 seasons.",
      type: "array",
      hidden: ({ document }) => document?.pricingType !== "nightly",
      of: [
        {
          name: "seasonalRate",
          title: "Seasonal Rate",
          type: "object",
          fields: [
            {
              name: "startDate",
              title: "Start Date",
              type: "date",
              options: { dateFormat: "MMMM D, YYYY" },
              validation: Rule => Rule.required()
            },
            {
              name: "endDate",
              title: "End Date",
              description: "This date is included in the season.",
              type: "date",
              options: { dateFormat: "MMMM D, YYYY" },
              validation: Rule => Rule.required()
            },
            {
              name: "nightlyRate",
              title: "Price Per Night",
              type: "number",
              validation: Rule => Rule.required().positive()
            }
          ],
          preview: {
            select: { startDate: "startDate", endDate: "endDate", rate: "nightlyRate" },
            prepare({ startDate, endDate, rate }) {
              return {
                title: startDate && endDate ? `${startDate} – ${endDate}` : "Incomplete date range",
                subtitle: typeof rate === "number" ? `$${rate.toLocaleString()} / night` : "Add nightly price"
              };
            }
          }
        }
      ],
      validation: Rule => Rule.max(5).custom(validateSeasonalRates)
    },

    {
      name: "address",
      title: "Address",
      type: "string",
      validation: Rule => Rule.required().custom(value => validateWidth(value, 30))
    },

    {
      name: "latitude",
      title: "Latitude",
      type: "number",
      description: "Example: 42.9634",
      validation: Rule => Rule.required().min(-90).max(90)
    },
    {
      name: "longitude",
      title: "Longitude",
      type: "number",
      description: "Example: -85.6681",
      validation: Rule => Rule.required().min(-180).max(180)
    },

    { name: "bedrooms", title: "Bedrooms", type: "number", validation: Rule => Rule.required() },
    { name: "bathrooms", title: "Bathrooms", type: "number", validation: Rule => Rule.required() },
    { name: "sqft", title: "Square Feet", type: "number", validation: Rule => Rule.required() },

    {
      name: "utilitiesIncluded",
      title: "Utilities Included",
      type: "object",
      validation: Rule => Rule.required(),
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 33)) },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 33)) }
      ]
    },

    {
      name: "petFriendly",
      title: "Pet Friendly",
      description: "Leave unchecked if pets are not allowed.",
      type: "boolean",
      initialValue: false
    },

    {
      name: "washerDryer",
      title: "Washer & Dryer",
      type: "object",
      validation: Rule => Rule.required(),
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 33)) },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 33)) }
      ]
    },

    {
      name: "parking",
      title: "Parking",
      type: "object",
      validation: Rule => Rule.required(),
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 33)) },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 33)) }
      ]
    },

    {
      name: "deposit",
      title: "Security Deposit",
      description: "If no deposit required, leave blank.",
      type: "number",
    },

    {
      name: "availability",
      title: "Availability",
      type: "object",
      fields: [
        {
          name: "availableFrom",
          title: "Available From",
          type: "date",
          options: {
            dateFormat: "YYYY-MM-DD"
          }
        },
        {
          name: "availableNow",
          title: "Available Now",
          type: "boolean",
          description: "Check this if the unit is available immediately."
        }
      ],
      validation: Rule =>
        Rule.custom(value => {
          if (!value?.availableFrom && !value?.availableNow) {
            return "Either pick a date or check Available Now";
          }
          return true;
        })
    },

    {
      name: "locationHighlights",
      title: "What is attractive about this location?",
      description: "Example: schools nearby, walkability, hospitals, public transit",
      type: "object",
      validation: Rule => Rule.required(),
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 33)) },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required().custom(value => validateWidth(value, 33)) }
      ]
    },

    {
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: Rule => Rule.required().min(2)
    },

    {
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: true,
      validation: Rule => Rule.required()
    }
  ],

  preview: {
    select: {
      title: "title.en",
      subtitle: "price",
      pricingType: "pricingType",
      media: "images.0"
    },
    prepare({ title, subtitle, pricingType, media }) {
      return {
        title,
        subtitle: pricingType === "nightly"
          ? "Seasonal nightly rates"
          : `$${subtitle?.toLocaleString()} / month`,
        media
      };
    }
  }
};
