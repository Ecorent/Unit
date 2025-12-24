import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'ecorent',

  projectId: 'uxragbo5',
  dataset: 'production',
  basePath: '/sanity',
  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  vite: {
    basePath: '/sanity',
  },
})