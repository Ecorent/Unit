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
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required().max(30) },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required().max(30) }
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
      name: "price",
      title: "Monthly Price",
      type: "number",
      validation: Rule => Rule.required().min(0)
    },

    {
      name: "address",
      title: "Address",
      type: "string",
      validation: Rule => Rule.required().max(40)
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
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required() }
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
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required() }
      ]
    },

    {
      name: "parking",
      title: "Parking",
      type: "object",
      validation: Rule => Rule.required(),
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required() }
      ]
    },

    {
      name: "deposit",
      title: "Security Deposit",
      description: "Amount required to move in.",
      type: "number",
      validation: Rule => Rule.required().min(0)
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
      title: "What is attractive about this location? (no more than 6 words)",
      description: "Example: schools nearby, walkability, hospitals, public transit",
      type: "object",
      validation: Rule => Rule.required(),
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required().max(39) },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required().max(39) }
      ]
    },

    {
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: Rule => Rule.required().min(1)
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
      media: "images.0"
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: `$${subtitle?.toLocaleString()} / month`,
        media
      };
    }
  }
};
