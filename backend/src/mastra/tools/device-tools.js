import mongoose from 'mongoose'
import Equipment from '../../models/Equipment.js'
import Report from '../../models/Report.js'
import BorrowRequest from '../../models/BorrowRequest.js'
import User from '../../models/User.js'
import { createTool } from '@mastra/core/tools'

// Tool kiểm tra thiết bị
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

    const items = await Equipment.find(query)

    if (items.length === 0)
      return 'Không tìm thấy thiết bị nào đang sẵn sàng sử dụng với thông tin này.'

    const details = items
      .map((i) => {
        const roomInfo = i.room_id ? ` (Phòng: ${i.room_id.name})` : ''
        return `- ${i.name} [Mã: ${i.code}]${roomInfo}`
      })
      .join('\n')

    return `Tìm thấy ${items.length} thiết bị phù hợp:\n${details}`
  },
})

// Tool tạo phiếu mượn
const borrowEquipment = createTool({
  id: 'borrow_equipment',
  description:
    'Tạo phiếu mượn thiết bị. equipmentIdentifier có thể là _id, name, code hoặc qr_code.',
  inputSchema: {
    type: 'object',
    properties: {
      equipmentIdentifier: {
        type: 'string',
        description: 'ID, tên, mã (code) hoặc mã QR (qr_code) của thiết bị',
      },
      userIdentifier: {
        type: 'string',
        description: 'ID người dùng, username hoặc email của người mượn',
      },
      durationDays: {
        type: 'number',
        description: 'Số ngày mượn (mặc định là 1 ngày nếu không cung cấp)',
        default: 1,
      },
      note: {
        type: 'string',
        description: 'Ghi chú thêm cho phiếu mượn',
      },
    },
    required: ['equipmentIdentifier', 'userIdentifier'],
  },
  execute: async (input) => {
    const {
      equipmentIdentifier,
      userIdentifier,
      durationDays = 1,
      note,
    } = input

    userIdentifier = '69aa857a8964236799abee99'

    // 1. Tìm thiết bị
    let equip
    const equipQuery = {
      $or: [
        { name: { $regex: equipmentIdentifier, $options: 'i' } },
        { code: equipmentIdentifier },
        { qr_code: equipmentIdentifier },
      ],
    }
    if (mongoose.Types.ObjectId.isValid(equipmentIdentifier)) {
      equipQuery.$or.push({ _id: equipmentIdentifier })
    }
    equip = await Equipment.findOne(equipQuery)

    if (!equip) {
      return `Lỗi: Không tìm thấy thiết bị nào với thông tin: ${equipmentIdentifier}`
    }

    if (!equip.available || equip.status !== 'good' || equip.borrowed_by) {
      let reason = ''
      if (equip.status !== 'good')
        reason = `Trạng thái thiết bị là '${equip.status}' (cần là 'good').`
      else if (equip.borrowed_by) reason = 'Thiết bị đang được người khác mượn.'
      else reason = 'Thiết bị hiện không sẵn sàng.'

      return `Lỗi: Thiết bị ${equip.name} (${equip.code}) không thể mượn. Lý do: ${reason}`
    }

    // 2. Tìm người dùng
    let user
    const userQuery = {
      $or: [{ username: userIdentifier }, { email: userIdentifier }],
    }
    if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
      userQuery.$or.push({ _id: userIdentifier })
    }
    user = await User.findOne(userQuery)

    if (!user) {
      return `Lỗi: Không tìm thấy người dùng với thông tin: ${userIdentifier}`
    }

    // 3. Tạo BorrowRequest
    const borrowDate = new Date()
    const returnDate = new Date()
    returnDate.setDate(borrowDate.getDate() + durationDays)

    const request = new BorrowRequest({
      user_id: user._id,
      equipment_id: equip._id,
      type: 'equipment',
      status: 'pending',
      borrow_date: borrowDate,
      return_date: returnDate,
      note: note || `Mượn qua AI Assistant`,
    })

    await request.save()

    // Lưu ý: Chúng ta không cập nhật Equipment.borrowed_by ngay lập tức
    // vì status của request là 'pending'.
    // Khi được 'approved' hoặc 'handed_over' thì model Equipment sẽ cập nhật thực tế.
    // Tuy nhiên, để AI phản hồi chuẩn, ta có thể nói là đã tạo yêu cầu thành công.

    return `Đã tạo yêu cầu mượn thiết bị ${equip.name} (${equip.code}) cho người dùng ${user.displayName || user.username}. \nMã yêu cầu: ${request._id}. Vui lòng chờ quản trị viên phê duyệt.`
  },
})

// Tool báo hỏng
const reportDamage = createTool({
  id: 'report_damage',
  description: 'Tạo báo cáo hỏng thiết bị hoặc cơ sở hạ tầng',
  inputSchema: {
    type: 'object',
    properties: {
      equipmentIdentifier: {
        type: 'string',
        description:
          'Tên, mã (code) hoặc ID của thiết bị (để trống nếu báo hỏng hạ tầng)',
      },
      userIdentifier: {
        type: 'string',
        description: 'ID người dùng, username hoặc email người báo cáo',
      },
      description: {
        type: 'string',
        description: 'Mô tả chi tiết tình trạng hỏng',
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      type: {
        type: 'string',
        enum: ['equipment', 'infrastructure', 'other'],
        default: 'equipment',
      },
      img: { type: 'string', description: 'URL hoặc base64 ảnh minh họa' },
    },
    required: ['description'],
  },
  execute: async (input) => {
    const {
      equipmentIdentifier,
      userIdentifier,
      description,
      priority,
      type,
      img,
    } = input

    let equipId = null
    let user_id = null

    // Tìm thiết bị nếu có
    if (equipmentIdentifier) {
      const equipQuery = {
        $or: [
          { name: { $regex: equipmentIdentifier, $options: 'i' } },
          { code: equipmentIdentifier },
        ],
      }
      if (mongoose.Types.ObjectId.isValid(equipmentIdentifier)) {
        equipQuery.$or.push({ _id: equipmentIdentifier })
      }
      const equip = await Equipment.findOne(equipQuery)
      if (equip) {
        equipId = equip._id
        // Cập nhật trạng thái thiết bị sang 'broken'
        equip.status = 'broken'
        equip.available = false
        await equip.save()
      }
    }

    // Tìm người dùng nếu có
    if (userIdentifier) {
      const userQuery = {
        $or: [{ username: userIdentifier }, { email: userIdentifier }],
      }
      if (mongoose.Types.ObjectId.isValid(userIdentifier)) {
        userQuery.$or.push({ _id: userIdentifier })
      }
      const user = await User.findOne(userQuery)
      if (user) user_id = user._id
    }

    const report = new Report({
      user_id,
      equipment_id: equipId,
      type: type || (equipId ? 'equipment' : 'infrastructure'),
      status: 'pending',
      priority: priority || 'medium',
      description,
      img: img || null,
    })

    await report.save()

    const target = equipId
      ? `thiết bị mã ${equipmentIdentifier}`
      : 'cơ sở hạ tầng'
    return `Đã tiếp nhận báo cáo hỏng ${target}. \nMã ticket: ${report._id}. Đội ngũ kỹ thuật sẽ sớm kiểm tra.`
  },
})

export { checkEquipmentAvailability, borrowEquipment, reportDamage }
