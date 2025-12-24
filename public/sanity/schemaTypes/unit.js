export default {
  name: 'unit',
  title: 'Rental Unit',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Unit Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'price',
      title: 'Monthly Price',
      type: 'number'
    },
    {
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number'
    },
    {
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number'
    },
    {
      name: 'squareFeet',
      title: 'Square Feet',
      type: 'number'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }]
    }
  ]
}
