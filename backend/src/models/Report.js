import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null means it's a guest report from an unauthenticated user
    },

    equipment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      default: null,
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },

    type: {
      type: String,
      enum: ['equipment', 'infrastructure', 'other'],
      default: 'other',
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processing', 'fixed'],
      default: 'pending',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    img: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
)

// Default sort by newest first
reportSchema.pre('find', function () {
  this.sort({ createdAt: -1 })
})

const Report = mongoose.model('Report', reportSchema)

export default Report
