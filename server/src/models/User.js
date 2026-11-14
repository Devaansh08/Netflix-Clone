/**
 * @file User.js
 * @description Mongoose User model with pre-save password hashing and embedded myList schema.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & PRODUCTION:
 * 1. Password Exclusion (`select: false`): By default, Mongoose query projections omit the `password` field.
 *    This prevents accidental credential leakage when serializing user profiles or returning user lists.
 * 2. Pre-Save Password Hashing: Hashing in the Mongoose schema ensures passwords are never stored in plaintext,
 *    even if a controller forgets to hash before invoking `.save()`. The `isModified('password')` check prevents
 *    re-hashing an already-hashed string when updating unrelated fields like `name` or `myList`.
 * 3. Bcrypt Work Factor: Using a salt work factor of 10 balances CPU security against hash brute-forcing (approx 100ms per hash),
 *    sufficient to resist rainbow table and offline GPU attacks without causing event loop starvation.
 * 4. Embedded Documents for My List: Storing `myList` inside the User document eliminates N+1 join queries
 *    when rendering personalized home screens, leveraging MongoDB's document-model strengths for read-heavy apps.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

// Schema for individual items saved in user's personal watchlist
const MyListItemSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: [true, 'TMDB ID is required for list items']
  },
  mediaType: {
    type: String,
    enum: ['movie', 'tv'],
    default: 'movie'
  },
  title: {
    type: String,
    required: [true, 'Title is required for list items'],
    trim: true
  },
  posterPath: {
    type: String,
    default: null
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // Disable separate _id for embedded items to save storage

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Crucial: Never include password hash in queries unless explicitly requested via .select('+password')
  },
  myList: [MyListItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Pre-save middleware: Hashes plaintext password before saving to database.
 * Note: Modern Mongoose async hooks return promises directly without needing the `next` callback.
 */
UserSchema.pre('save', async function () {
  // Only hash the password if it has been modified or newly created
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compares candidate password against the stored bcrypt hash.
 * @param {string} candidatePassword - Plaintext password provided by user during login.
 * @returns {Promise<boolean>} True if matching, false otherwise.
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generates signed JSON Web Token (JWT) for the user.
 * @returns {string} Signed JWT string.
 */
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, name: this.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

export const User = mongoose.model('User', UserSchema);
export default User;
