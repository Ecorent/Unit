export default {
  name: "unit",
  title: "Rental Unit",
  type: "document",

  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: Rule => Rule.required()
    },

    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: Rule => Rule.required()
    },

    {
      name: "price",
      title: "Price",
      type: "string"
    },

    {
      name: "address",
      title: "Address",
      type: "string"
    },

    {
      name: "bedrooms",
      title: "Bedrooms",
      type: "number"
    },

    {
      name: "bathrooms",
      title: "Bathrooms",
      type: "number"
    },

    {
      name: "sqft",
      title: "Square Feet",
      type: "number"
    },

    {
      name: "utilitiesIncluded",
      title: "Utilities Included",
      type: "string",
      description: "Example: Gas, water, and heating included"
    },

    {
      name: "petFriendly",
      title: "Pet Friendly",
      type: "boolean",
      initialValue: false
    },

    {
      name: "washerDryer",
      title: "Washer & Dryer",
      type: "string",
      description: "Example: In building, In unit, None"
    },

    {
      name: "storage",
      title: "Storage",
      type: "string",
      description: "Example: Basement storage"
    },

    {
      name: "parking",
      title: "Parking",
      type: "string",
      description: "Example: Street parking available"
    },

    {
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }]
    },

    {
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: true
    }
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "price",
      media: "images.0"
    }
  }
};
