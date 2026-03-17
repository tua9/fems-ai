import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'student', 'lecturer', 'technician'],
      trim: true,
      required: true,
    },
    avatarUrl: {
      //CDN link
      type: String,
      trim: true,
    },
    avatarId: {
      //Cloudinary public_id
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

// Default sort by newest first
userSchema.pre('find', function () {
  this.sort({ createdAt: -1 })
})

const User = mongoose.model('User', userSchema)
export default User
