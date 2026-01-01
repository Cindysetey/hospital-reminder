import React from 'react';
import AppointmentCard from './AppointmentCard';
import '../../styles/components/AppointmentList.css';

const AppointmentList = ({ appointments, onConfirm, onCancel, showActions = false }) => {
  if (!appointments || appointments.length === 0) {
    return <div className="no-appointments">No appointments found</div>;
  }

  return (
    <div className="appointment-list">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          onConfirm={onConfirm}
          onCancel={onCancel}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default AppointmentList;

