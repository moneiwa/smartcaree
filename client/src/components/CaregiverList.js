import React from "react";
import { useNavigate } from "react-router-dom";

const CaregiverList = ({ caregiver }) => {
  const navigate = useNavigate();
  return (
    <div
      className="card m-2"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/caregiver/book-service/${caregiver._id}`)}
    >
      <div className="card-header">
        {caregiver.firstName} {caregiver.lastName}
      </div>
      <div className="card-body">
        <p>
          <b>Service Type:</b> {caregiver.serviceType}
        </p>
        <p>
          <b>Experience:</b> {caregiver.experience} years
        </p>
        <p>
          <b>Fees Per Service:</b> {caregiver.feesPerService}
        </p>
        <p>
          <b>Availability:</b> {caregiver.availability[0]} - {caregiver.availability[1]}
        </p>
      </div>
    </div>
  );
};

export default CaregiverList;
