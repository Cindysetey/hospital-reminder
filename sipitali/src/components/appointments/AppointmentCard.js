import React from 'react';
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '../../utils/helpers';
import '../../styles/components/AppointmentCard.css';

const AppointmentCard = ({ appointment, onConfirm, onCancel, showActions = false }) => {
  const statusColor = getStatusColor(appointment.status);

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <h3>
          {appointment.patient?.name || 'Patient'} - {appointment.doctor?.name || 'Doctor'}
        </h3>
        <span className="status-badge" style={{ backgroundColor: statusColor }}>
          {getStatusLabel(appointment.status)}
        </span>
      </div>
      <div className="appointment-body">
        <p><strong>Date:</strong> {formatDate(appointment.appointmentDate)}</p>
        <p><strong>Time:</strong> {formatTime(appointment.appointmentTime)}</p>
        <p><strong>Reason:</strong> {appointment.reason}</p>
        {appointment.confirmedBy && (
          <p><strong>Confirmed by:</strong> {appointment.confirmedBy.name}</p>
        )}
        {appointment.confirmedAt && (
          <p><strong>Confirmed at:</strong> {formatDate(appointment.confirmedAt)}</p>
        )}
      </div>
      {showActions && (
        <div className="appointment-actions">
          {appointment.status === 'pending' && onConfirm && (
            <button onClick={() => onConfirm(appointment._id)} className="btn-confirm">
              Confirm
            </button>
          )}
          {onCancel && appointment.status !== 'cancelled' && (
            <button onClick={() => onCancel(appointment._id)} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;

