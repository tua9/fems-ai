import mongoose from 'mongoose'

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    available: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ['good', 'broken', 'maintenance'],
      required: true,
      default: 'good',
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },

    borrowed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    qr_code: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// If equipment is assigned to a room or borrowed, it's not available
assetSchema.pre('save', function () {
  if (this.room_id || this.borrowed_by) {
    this.available = false
  } else {
    this.available = true
  }
})

// Default sort by newest first
assetSchema.pre('find', function () {
  this.sort({ createdAt: -1 })
})

const Equipment = mongoose.model('Equipment', assetSchema, 'equipment')
export default Equipment
