const appointmentModel = require("../models/appointmentModel");
const caregiverModel = require("../models/caregiverModel"); // Updated model import
const userModel = require("../models/userModels");

// Get caregiver info
const getCaregiverInfoController = async (req, res) => {
  try {
    const caregiver = await caregiverModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Caregiver data fetched successfully",
      data: caregiver,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching caregiver details",
    });
  }
};

// Update caregiver profile
const updateProfileController = async (req, res) => {
  try {
    const caregiver = await caregiverModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true } // Return the updated document
    );
    res.status(201).send({
      success: true,
      message: "Caregiver profile updated",
      data: caregiver,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Caregiver profile update issue",
      error,
    });
  }
};

// Get single caregiver
const getCaregiverByIdController = async (req, res) => {
  try {
    const caregiver = await caregiverModel.findOne({ _id: req.body.caregiverId });
    res.status(200).send({
      success: true,
      message: "Single caregiver info fetched",
      data: caregiver,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching single caregiver info",
    });
  }
};

// Get caregiver appointments
const caregiverAppointmentsController = async (req, res) => {
  try {
    const caregiver = await caregiverModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel.find({
      caregiverId: caregiver._id, // Changed to caregiverId
    });
    res.status(200).send({
      success: true,
      message: "Caregiver appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching caregiver appointments",
    });
  }
};

// Update appointment status
const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status },
      { new: true } // Return the updated document
    );
    const user = await userModel.findOne({ _id: appointment.userId });
    const notification = user.notification; // Fixed typo in 'notification'
    notification.push({
      type: "status-updated",
      message: `Your appointment has been updated to ${status}`,
      onClickPath: "/caregiver-appointments", // Updated path
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment status updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating status",
    });
  }
};

module.exports = {
  getCaregiverInfoController, // Updated export
  updateProfileController,
  getCaregiverByIdController, // Updated export
  caregiverAppointmentsController, // Updated export
  updateStatusController,
};
