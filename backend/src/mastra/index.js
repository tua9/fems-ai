// src/mastra/index.js
import { Mastra } from '@mastra/core'
import { equipmentAgent } from './agents/equipment-agent.js'

export const mastra = new Mastra({
  agents: {
    'equipment-agent': equipmentAgent,
  },
})
