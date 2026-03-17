import mongoose from 'mongoose'

const borrowRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
      enum: ['equipment', 'infrastructure'],
      default: 'other',
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'handed_over', 'returned'],
      default: 'pending',
    },

    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    borrow_date: {
      type: Date,
      required: true,
    },

    return_date: {
      type: Date,
      required: true,
    },

    note: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
)

// Default sort by newest first
borrowRequestSchema.pre('find', function () {
  this.sort({ createdAt: -1 })
})

const BorrowRequest = mongoose.model('BorrowRequest', borrowRequestSchema)

export default BorrowRequest
