export default {
  name: "units",
  title: "Rental Units",
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
      options: {
        source: "title",
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },

    {
      name: "price",
      title: "Price",
      type: "string",
      description: "Example: $2,400 / month"
    },

    {
      name: "address",
      title: "Address",
      type: "string",
      description: "Used for Google Maps embed"
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
      of: [
        {
          type: "image",
          options: {
            hotspot: true
          }
        }
      ]
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
