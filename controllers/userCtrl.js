const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const caregiverModel = require("../models/caregiverModel"); // Updated model import
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

// Register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ message: "User Already Exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Registered Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// Login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid Email or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

// Auth callback
const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    } else {
      res.status(200).send({ success: true, data: user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Auth error", success: false, error });
  }
};

// Apply caregiver callback
const applyCaregiverController = async (req, res) => {
  try {
    const newCaregiver = new caregiverModel({ ...req.body, status: "pending" }); // Updated to caregiver
    await newCaregiver.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = adminUser.notification; // Fixed typo
    notification.push({
      type: "apply-caregiver-request",
      message: `${newCaregiver.firstName} ${newCaregiver.lastName} has applied for a caregiver account`,
      data: {
        caregiverId: newCaregiver._id,
        name: newCaregiver.firstName + " " + newCaregiver.lastName,
        onClickPath: "/admin/caregivers", // Updated path
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({ success: true, message: "Caregiver Account Applied Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error While Applying For Caregiver" });
  }
};

// Notification controller
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seenNotification = user.seenNotification; // Fixed typo
    const notification = user.notification;
    seenNotification.push(...notification);
    user.notification = [];
    user.seenNotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({ success: true, message: "All notifications marked as read", data: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error in notification", success: false, error });
  }
};

// Delete notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seenNotification = []; // Fixed typo
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({ success: true, message: "Notifications Deleted Successfully", data: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Unable to delete all notifications", error });
  }
};

// Get all caregivers
const getAllCaregiversController = async (req, res) => {
  try {
    const caregivers = await caregiverModel.find({ status: "approved" }); // Updated to caregiver
    res.status(200).send({ success: true, message: "Caregivers List Fetched Successfully", data: caregivers });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error While Fetching Caregivers" });
  }
};

// Book appointment
const bookAppointmentController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.caregiverInfo.userId }); // Updated to caregiverInfo
    user.notification.push({
      type: "New-appointment-request",
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments", // Fixed typo
    });
    await user.save();
    res.status(200).send({ success: true, message: "Appointment booked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error While Booking Appointment" });
  }
};

// Booking availability controller
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString(); // Fixed date format
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const caregiverId = req.body.caregiverId; // Updated to caregiverId
    const appointments = await appointmentModel.find({
      caregiverId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });
    if (appointments.length > 0) {
      return res.status(200).send({ message: "Appointments not available at this time", success: true });
    } else {
      return res.status(200).send({ success: true, message: "Appointments available" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error In Booking" });
  }
};

// User appointments controller
const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ userId: req.body.userId });
    res.status(200).send({ success: true, message: "User's Appointments Fetched Successfully", data: appointments });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error In User Appointments" });
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  applyCaregiverController, // Updated export
  getAllNotificationController,
  deleteAllNotificationController,
  getAllCaregiversController, // Updated export
  bookAppointmentController, // Updated export
  bookingAvailabilityController,
  userAppointmentsController,
};
