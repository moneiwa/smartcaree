const caregiverModel = require("../models/caregiverModel"); // Update model import
const userModel = require("../models/userModels");

// Get all users
const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "Users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
      error,
    });
  }
};

// Get all caregivers
const getAllCaregiversController = async (req, res) => {
  try {
    const caregivers = await caregiverModel.find({});
    res.status(200).send({
      success: true,
      message: "Caregivers data list",
      data: caregivers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting caregivers data",
      error,
    });
  }
};

// Caregiver account status
const changeAccountStatusController = async (req, res) => {
  try {
    const { caregiverId, status } = req.body; // Updated to caregiverId
    const caregiver = await caregiverModel.findByIdAndUpdate(caregiverId, { status });
    const user = await userModel.findOne({ _id: caregiver.userId });
    const notification = user.notification; // Fixed typo in 'notification'
    notification.push({
      type: "caregiver-account-request-updated", // Updated notification type
      message: `Your Caregiver Account Request Has ${status}`,
      onClickPath: "/notification",
    });
    user.isCaregiver = status === "approved"; // Updated to isCaregiver
    await user.save();
    res.status(201).send({
      success: true,
      message: "Account Status Updated",
      data: caregiver,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Account Status",
      error,
    });
  }
};

module.exports = {
  getAllCaregiversController, // Updated export
  getAllUsersController,
  changeAccountStatusController,
};
