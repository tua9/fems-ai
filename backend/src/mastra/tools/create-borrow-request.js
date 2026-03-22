// src/mastra/tools/create-borrow-request.js
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import Equipment from '../../models/Equipment.js'
import BorrowRequest from '../../models/BorrowRequest.js'

export const createBorrowRequest = createTool({
  id: 'create_borrow_request',
  description:
    'Tạo đơn mượn thiết bị. Chỉ dùng sau khi đã kiểm tra thiết bị còn sẵn sàng bằng tool check_equipment.',

  inputSchema: z.object({
    equipment_id: z
      .string()
      .describe('ObjectId của thiết bị (lấy từ kết quả check_equipment)'),
    user_id: z.string().describe('ObjectId của người dùng muốn mượn'),
    borrow_date: z
      .string()
      .describe('Ngày bắt đầu mượn (định dạng ISO: YYYY-MM-DD)'),
    return_date: z
      .string()
      .describe('Ngày trả dự kiến (định dạng ISO: YYYY-MM-DD)'),
    note: z.string().optional().describe('Ghi chú / lý do mượn'),
  }),

  execute: async ({
    equipment_id,
    user_id,
    borrow_date,
    return_date,
    note,
  }) => {
    // 1. Kiểm tra thiết bị tồn tại
    const equipment = await Equipment.findById(equipment_id)
    if (!equipment) {
      throw new Error(`Không tìm thấy thiết bị với ID: ${equipment_id}`)
    }

    // 2. Validate ngày
    const start = new Date(borrow_date)
    const end = new Date(return_date)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new Error(
        'Ngày mượn hoặc trả không hợp lệ (phải là YYYY-MM-DD và borrow_date < return_date)',
      )
    }

    // 3. Tạo đơn
    const newRequest = new BorrowRequest({
      user_id,
      equipment_id,
      borrow_date: start,
      return_date: end,
      note: note || null,
      type: 'equipment',
      status: 'pending',
    })

    await newRequest.save()

    return {
      success: true,
      request_id: newRequest._id.toString(),
      message:
        `Đã tạo đơn mượn thành công (pending)\n` +
        `Thiết bị: ${equipment.name} (${equipment.code})\n` +
        `Thời gian: ${borrow_date} → ${return_date}\n` +
        `ID đơn: ${newRequest._id}`,
    }
  },
})
