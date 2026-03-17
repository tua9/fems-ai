// src/mastra/agents/equipment-agent.js
import { Agent } from '@mastra/core/agent'
import { groq } from '@ai-sdk/groq'
import checkEquipmentAvailability from '../tools/check-equipment.js'
import { createBorrowRequest } from '../tools/create-borrow-request.js'

export const equipmentAgent = new Agent({
  id: 'equipment-agent',
  name: 'Trợ lý Quản lý Thiết bị',

  instructions: `
Bạn là trợ lý thông minh quản lý thiết bị của trường học.

QUY TRÌNH BẮT BUỘC KHI NGƯỜI DÙNG MUỐN MƯỢN THIẾT BỊ:
1. LUÔN kiểm tra tình trạng thiết bị trước bằng tool "check_equipment" với tên hoặc mã thiết bị người dùng cung cấp.
2. Nếu tool trả về "Không tìm thấy" hoặc không có thiết bị sẵn sàng → thông báo rõ ràng và KHÔNG tạo đơn.
3. Nếu có thiết bị sẵn sàng → hỏi xác nhận thông tin (tên thiết bị, thời gian mượn/trả, lý do nếu có).
4. Khi người dùng xác nhận → dùng tool "create_borrow_request" để tạo đơn.
5. Sau khi tạo đơn thành công → trả về ID đơn, tên thiết bị, thời gian và trạng thái pending.
6. Luôn trả lời bằng tiếng Việt, lịch sự, rõ ràng.

Không tự ý tạo đơn nếu chưa kiểm tra hoặc chưa được xác nhận.
  `,

  model: groq('llama-3.3-70b-versatile'), // hoặc model khác bạn thích

  tools: {
    checkEquipmentAvailability,
    createBorrowRequest,
  },
})
