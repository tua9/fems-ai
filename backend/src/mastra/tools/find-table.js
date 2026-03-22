import { createTool } from '@mastra/core/tools'
import axios from 'axios'

export const findTableTool = createTool({
  id: 'find_table',
  description: 'Tìm bàn học theo tên hoặc loại',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: { type: 'string' },
    },
    required: ['keyword'],
  },
  execute: async ({ keyword }) => {
    const res = await axios.get('http://localhost:3001/tables')

    const result = res.data
      .filter(
        (t) =>
          t.name.toLowerCase().includes(keyword.toLowerCase()) ||
          t.type.toLowerCase().includes(keyword.toLowerCase()),
      )
      .filter((t) => t.available)

    return JSON.stringify({
      count: result.length,
      tables: result,
    })
  },
})
