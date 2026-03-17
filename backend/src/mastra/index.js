import { Mastra } from '@mastra/core'
import { schoolAgent } from './agents/school-agent.js'

const mastra = new Mastra({
  agents: { schoolAgent },
})

export { mastra }
