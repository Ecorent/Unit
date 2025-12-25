export default {
  name: 'unit',
  title: 'Rental Unit',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'price',
      title: 'Monthly Price',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string',
    },
    {
      name: 'sqft',
      title: 'Square Feet',
      type: 'number',
    },
    {
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
    },
    {
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    },
  ],
}
