import React from "react";
import StaffDonationManagement from "./StaffDonationManagement";

function DonationRequests({ onWalkInClick, userRole }) {

  return <StaffDonationManagement onWalkInClick={onWalkInClick} userRole={userRole} />;
}

export default DonationRequests;
