import mongoose from 'mongoose'

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên tòa nhà là bắt buộc'],
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
)

// Default sort by newest first
buildingSchema.pre('find', function () {
  this.sort({ createdAt: -1 })
})

const Building = mongoose.model('Building', buildingSchema)
export default Building
