const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId for better referencing
      required: true,
      ref: 'User', // Reference to the User model
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId, // Changed to ObjectId for better referencing
      required: true,
      ref: 'Caregiver', // Reference to the Caregiver model
    },
    doctorInfo: {
      type: Object, // Changed to Object for structured data
      required: true,
    },
    userInfo: {
      type: Object, // Changed to Object for structured data
      required: true,
    },
    date: {
      type: Date, // Changed to Date type for better date handling
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'], // Added enum for predefined status values
      default: "pending",
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;
