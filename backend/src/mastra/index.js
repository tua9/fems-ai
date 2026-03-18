// src/mastra/index.js
import { Mastra } from '@mastra/core'
import { furnitureAgent } from './agents/furniture-agent.js'

export const mastra = new Mastra({
  agents: { 'furniture-agent': furnitureAgent },
})
