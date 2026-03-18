import { createTool } from '@mastra/core/tools'
import axios from 'axios'

export const findChairTool = createTool({
  id: 'find_chair',
  description: 'Tìm ghế theo tên hoặc loại',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: { type: 'string' },
    },
    required: ['keyword'],
  },
  execute: async ({ keyword }) => {
    const res = await axios.get('http://localhost:3001/chairs')

    const result = res.data
      .filter(
        (c) =>
          c.name.toLowerCase().includes(keyword.toLowerCase()) ||
          c.type.toLowerCase().includes(keyword.toLowerCase()),
      )
      .filter((c) => c.available)

    return JSON.stringify({
      count: result.length,
      chairs: result,
    })
  },
})
