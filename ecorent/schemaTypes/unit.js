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
      name: "sqft",
      title: "Square Feet",
      type: "number"
    },

    {
      name: "bedrooms",
      title: "Bedrooms",
      type: "number"
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
