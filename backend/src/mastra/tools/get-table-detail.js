import { createTool } from '@mastra/core/tools'
import axios from 'axios'

export const getTableDetailTool = createTool({
  id: 'get_table_detail',
  description: 'Lấy thông tin chi tiết một bàn theo ID hoặc tên bàn',
  inputSchema: {
    type: 'object',
    properties: {
      identifier: {
        type: 'string',
        description: 'ID (số) hoặc tên bàn (ví dụ: "Bàn gỗ", "1", "gỗ")',
      },
    },
    required: ['identifier'],
  },
  execute: async ({ identifier }) => {
    console.log('-----------------------------------------------------')
    console.log('identifier', identifier)
    console.log('-----------------------------------------------------')
    console.log('get_table_detail')
    console.log('-----------------------------------------------------')

    const res = await axios.get('http://localhost:3001/tables')
    const tables = res.data

    let table

    // 1. Tìm theo ID - thử cả string và number
    const idNum = Number(identifier)
    if (!isNaN(idNum)) {
      table = tables.find(
        (t) =>
          t.id === idNum ||
          t.id === identifier || // nếu id trong db là string "1"
          String(t.id) === identifier,
      )
    }

    // 2. Nếu chưa tìm thấy → tìm theo tên/type (partial, case-insensitive)
    if (!table) {
      table = tables.find(
        (t) =>
          t.name.toLowerCase().includes(identifier.toLowerCase()) ||
          t.type.toLowerCase().includes(identifier.toLowerCase()),
      )
    }

    if (!table) {
      return JSON.stringify({
        found: false,
        message: `Không tìm thấy bàn nào khớp với "${identifier}"`,
      })
    }
    console.log('-----------------------------------------------------')
    console.log('table: ', table)
    console.log('-----------------------------------------------------')

    return JSON.stringify({
      found: true,
      table: {
        id: table.id,
        name: table.name,
        type: table.type,
        available: table.available,
        status: table.available ? 'Còn hàng - có thể đặt' : 'Hết hàng',
      },
    })
  },
})
