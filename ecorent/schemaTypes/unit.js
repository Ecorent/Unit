export default {
  name: "unit",
  title: "Rental Unit",
  type: "document",

  fields: [
    {
      name: "title",
      title: "Title",
      type: "object",
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required() }
      ]
    },

    {
      name: "slug",
      title: "Slug",
      description: "Click the Generate button to create the URL from the English title.",
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
      validation: Rule => Rule.required()
    },

    { name: "bedrooms", title: "Bedrooms", type: "number", validation: Rule => Rule.required() },
    { name: "bathrooms", title: "Bathrooms", type: "number", validation: Rule => Rule.required() },
    { name: "sqft", title: "Square Feet", type: "number", validation: Rule => Rule.required() },

    {
      name: "utilitiesIncluded",
      title: "Utilities Included",
      type: "object",
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required() }
      ]
    },

    {
      name: "petFriendly",
      title: "Pet Friendly",
      type: "boolean",
      validation: Rule => Rule.required()
    },

    {
      name: "washerDryer",
      title: "Washer & Dryer",
      type: "object",
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required() }
      ]
    },

    {
      name: "parking",
      title: "Parking",
      type: "object",
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required() }
      ]
    },

    {
      name: "locationHighlights",
      title: "What is attractive about this location? (no more than 6 words)",
      description: "Example: schools nearby, walkability, hospitals, public transit",
      type: "object",
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Spanish", type: "string", validation: Rule => Rule.required() }
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
