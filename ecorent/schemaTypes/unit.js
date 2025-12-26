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
        { name: "es", title: "Español", type: "string", validation: Rule => Rule.required() }
      ]
    },

    {
      name: "slug",
      type: "slug",
      options: { source: "title.en", maxLength: 96 },
      hidden: true,
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
      type: "object",
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Español", type: "string", validation: Rule => Rule.required() }
      ]
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
        { name: "es", title: "Español", type: "string", validation: Rule => Rule.required() }
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
        { name: "es", title: "Español", type: "string", validation: Rule => Rule.required() }
      ]
    },

    {
      name: "numberOfFloors",
      title: "Number of Floors",
      type: "number",
      validation: Rule => Rule.required()
    },

    {
      name: "parking",
      title: "Parking",
      type: "object",
      fields: [
        { name: "en", title: "English", type: "string", validation: Rule => Rule.required() },
        { name: "es", title: "Español", type: "string", validation: Rule => Rule.required() }
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
