import { createTool } from '@mastra/core/tools'

const analyzeDamageImage = createTool({
  id: 'analyze_image',
  description: 'Phân tích ảnh hỏng (base64)',
  inputSchema: {
    type: 'object',
    properties: { imageBase64: String, moTa: String },
  },
  execute: async (input) => {
    // Tạm trả lời giả lập, sau này tích hợp Groq vision
    return `Ảnh cho thấy thiết bị bị ${input.moTa || 'hỏng nặng'}. Nên báo khẩn cấp.`
  },
})

export { analyzeDamageImage }
