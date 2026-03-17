// src/mastra/tools/check-equipment.js
import { createTool } from '@mastra/core/tools'
import mongoose from 'mongoose'
import Equipment from '../../models/Equipment.js'

const checkEquipmentAvailability = createTool({
  id: 'check_equipment',
  description: 'Kiểm tra thiết bị còn hay hết, theo tên hoặc mã code',
  inputSchema: {
    type: 'object',
    properties: {
      nameOrCode: { type: 'string', description: 'Tên, mã thiết bị (code)' },
    },
    required: ['nameOrCode'],
  },
  execute: async (input) => {
    const query = {
      $or: [
        { name: { $regex: input.nameOrCode, $options: 'i' } },
        { code: input.nameOrCode },
        { qr_code: input.nameOrCode },
      ],
      available: true,
      status: 'good',
      borrowed_by: null,
      room_id: null,
    }

    if (mongoose.Types.ObjectId.isValid(input.nameOrCode)) {
      query.$or.push({ _id: input.nameOrCode })
    }

    const items = await Equipment.find(query).lean()

    if (items.length === 0) {
      return 'Không tìm thấy thiết bị nào đang sẵn sàng sử dụng với thông tin này.'
    }

    const devices = items.map((i) => ({
      _id: i._id.toString(), // ObjectId thật dưới dạng string
      name: i.name,
      code: i.code || 'Không có mã',
      available: i.available,
      status: i.status,
    }))

    return JSON.stringify({
      found: true,
      count: items.length,
      devices,
      message: `Tìm thấy ${items.length} thiết bị phù hợp.`,
    })
  },
})

export default checkEquipmentAvailability
