import mongoose from 'mongoose'

const roomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ['classroom', 'lab', 'office', 'meeting', 'other'],
      default: 'classroom',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
    },
    building_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      default: null,
    },
  },
  { timestamps: true },
)

// Default sort by newest first
roomSchema.pre('find', function () {
  this.sort({ createdAt: -1 })

})

const Room = mongoose.model('Room', roomSchema)
export default Room
