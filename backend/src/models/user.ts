import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'vendor' ;
  createdAt: Date;
  updatedAt: Date;
  // comparePassword(candidatePassword: string): Promise<boolean>; // Uncomment when using bcrypt
}

// Schema definition
const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      // validate: [validator.isEmail, 'Please provide a valid email'], // Uncomment when using validator
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never show password in queries
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      // Add regex validation here later if needed
    },
    role: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving (commented out until bcrypt is added)
/*
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err as Error);
  }
});
*/

// Compare passwords method (commented out)
/*
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};
*/

// Export the model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
