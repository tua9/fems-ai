import { createTool } from '@mastra/core/tools'
import axios from 'axios'

const DB_URL = 'http://localhost:3001'

export const orderTableTool = createTool({
  id: 'order_table',
  description: 'Đặt mua một bàn với hình thức ship COD. Lưu đơn hàng vào database.',
  inputSchema: {
    type: 'object',
    properties: {
      tableId: {
        type: 'number',
        description: 'ID của bàn muốn mua (phải là số thực từ database)',
      },
      customerName: {
        type: 'string',
        description: 'Tên người đặt hàng',
      },
      phone: {
        type: 'string',
        description: 'Số điện thoại liên hệ',
      },
      address: {
        type: 'string',
        description: 'Địa chỉ giao hàng',
      },
      quantity: {
        type: 'number',
        description: 'Số lượng (mặc định 1)',
        default: 1,
      },
    },
    required: ['tableId', 'customerName', 'phone', 'address'],
  },
  execute: async ({ tableId, customerName, phone, address, quantity = 1 }) => {
    // 1. Lấy thông tin bàn từ json-server
    const tableRes = await axios.get(`${DB_URL}/tables/${tableId}`)
    const table = tableRes.data

    if (!table) {
      return JSON.stringify({
        success: false,
        message: `Không tìm thấy bàn có ID ${tableId}`,
      })
    }

    if (!table.available) {
      return JSON.stringify({
        success: false,
        message: `Bàn "${table.name}" hiện đã hết hàng, không thể đặt`,
      })
    }

    // 2. Tạo object đơn hàng
    const order = {
      tableId: table.id,
      tableName: table.name,
      tableType: table.type,
      quantity,
      customerName,
      phone,
      address,
      payment: 'COD',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // 3. Lưu đơn hàng vào db.json (POST → json-server tự tạo id)
    const orderRes = await axios.post(`${DB_URL}/orders`, order)
    const savedOrder = orderRes.data

    // 4. Cập nhật trạng thái bàn → hết hàng
    await axios.patch(`${DB_URL}/tables/${tableId}`, { available: false })

    console.log(`[Order] Tạo đơn thành công #${savedOrder.id} cho bàn "${table.name}"`)

    return JSON.stringify({
      success: true,
      message: `Đặt hàng thành công! Mã đơn hàng: #${savedOrder.id}`,
      orderDetails: savedOrder,
    })
  },
})

