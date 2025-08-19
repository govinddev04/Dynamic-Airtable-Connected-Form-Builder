import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  airtableId: string;
  email: string;
  name: string;
  airtableAccessToken: string;
  airtableRefreshToken?: string;
  tokenExpiresAt?: Date;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    airtableId: {
      type: String,
      required: true,
      unique: true, // unique automatically creates an index
    },
    email: {
      type: String,
      required: true,
      unique: true, // unique automatically creates an index
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    airtableAccessToken: {
      type: String,
      required: true,
    },
    airtableRefreshToken: {
      type: String,
    },
    tokenExpiresAt: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Correct export (hot-reload safe)
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
