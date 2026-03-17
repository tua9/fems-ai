import { Agent } from '@mastra/core/agent'
import { createGroq } from '@ai-sdk/groq'
import * as equipmentTools from '../tools/device-tools.js'
import * as vision from '../tools/vision-tool.js'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

const schoolAgent = new Agent({
  id: 'school-helper',
  name: 'school-helper',
  instructions: `
Bạn là trợ lý thân thiện giúp sinh viên/giảng viên mượn thiết bị hoặc báo hỏng.
Hiểu tiếng Việt tự nhiên.
Hỏi lại nếu thiếu thông tin.
Dùng tool khi cần tạo phiếu hoặc kiểm tra.
Kết thúc bằng lời xác nhận rõ ràng.
  `,
  model: groq('llama-3.3-70b-versatile'), // hoặc llama-3.1-70b-versatile
  tools: { ...equipmentTools, ...vision },
  //   enableMemory: true,
})

export { schoolAgent }
