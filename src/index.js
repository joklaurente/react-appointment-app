import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons'
import DayPicker from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

class AppointmentDashboard extends React.Component {
  state = {
    appointments: []
  }

  componentDidMount() {
    fetch('http://localhost:8000/api/appointments/')
      .then(response => response.json())
      .then(data => {
        this.setState({ appointments: data });
      });
  }

  createNewAppointment = (appointment) => {
    fetch('http://localhost:8000/api/appointments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    })
      .then(response => response.json())
      .then(appointment => {
        this.setState({ appointments: this.state.appointments.concat([appointment]) });
      });
  }

  updateAppointment = (newAppointment) => {
    fetch(`http://localhost:8000/api/appointments/${newAppointment.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAppointment),
    }).then(response => response.json())
      .then(newAppointment => {
        const newAppointments = this.state.appointments.map(appointment => {
          if (appointment.id === newAppointment.id) {
            return Object.assign({}, newAppointment)
          } else {
            return appointment;
          }
        });
        this.setState({ appointments: newAppointments });
      });
  }

  deleteAppointment = (appointmentId) => {
    fetch(`http://localhost:8000/api/appointments/${appointmentId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => {
        this.setState({ appointments: this.state.appointments.filter(appointment => appointment.id !== appointmentId) })
      });
  }

  render() {
    return (
      <main className="d-flex justify-content-center my-4">
        <div className="col-5">
          <AppointmentList
            appointments={this.state.appointments}
            onDeleteClick={this.deleteAppointment}
            onUpdateClick={this.updateAppointment}
          />
          <ToggleableAppointmentForm
            onAppointmentCreate={this.createNewAppointment}
          />
        </div>
      </main>
    )
  }
}

class AppointmentList extends React.Component {
  render() {
    const appointments = this.props.appointments.map(appointment => (
      <EditableAppointment
        key={appointment.id}
        id={appointment.id}
        patient={appointment.patient}
        appt_date={appointment.appt_date}
        start_time={appointment.start_time}
        end_time={appointment.end_time}
        comment={appointment.comment}
        onDeleteClick={this.props.onDeleteClick}
        onUpdateClick={this.props.onUpdateClick}
      ></EditableAppointment>
    ));
    return (
      <div>
        {appointments}
      </div>
    );
  }
}

class EditableAppointment extends React.Component {
  state = {
    inEditMode: false
  };
  enterEditMode = () => {
    this.setState({ inEditMode: true });
  }
  leaveEditMode = () => {
    this.setState({ inEditMode: false });
  }
  handleDelete = () => {
    this.props.onDeleteClick(this.props.id);
  }
  handleUpdate = (appointment) => {
    this.leaveEditMode()
    appointment.id = this.props.id;
    this.props.onUpdateClick(appointment);
  }
  render() {
    const component = () => {
      if (this.state.inEditMode) {
        return (
          <AppointmentForm
            id={this.props.id}
            patient={this.props.patient}
            appt_date={this.props.appt_date}
            start_time={this.props.start_time}
            end_time={this.props.end_time}
            comment={this.props.comment}
            onCancelClick={this.leaveEditMode}
            onFormSubmit={this.handleUpdate}
          />
        );
      }
      return (
        <Appointment
          patient={this.props.patient}
          appt_date={this.props.appt_date}
          start_time={this.props.start_time}
          end_time={this.props.end_time}
          comment={this.props.comment}
          onEditClick={this.enterEditMode}
          onDeleteClick={this.handleDelete}
        />
      )
    }
    return (
      <div className="mb-3 p-4" style={{ boxShadow: '0 0 10px #ccc' }} >
        {component()}
      </div>
    )
  }
}

class Appointment extends React.Component {
  render() {
    return (
      <div className="card" /* style="width: 18rem;" */>
        <div className="card-header d-flex justify-content-between">
          <span>
            <strong>Patient: </strong>{this.props.patient}
          </span>
          <div>
            <span onClick={this.props.onEditClick} className="mr-2"><FontAwesomeIcon icon={faEdit} /></span>
            <span onClick={this.props.onDeleteClick}><FontAwesomeIcon icon={faTrash} /></span>
          </div>
        </div>
        <div className="card-body">
          <strong>Schedule: </strong> {this.props.appt_date}, {this.props.start_time} - {this.props.end_time}
        </div>
        <div className="card-footer">
          {this.props.comment}
        </div>
      </div>
    );
  }
}

class AppointmentForm extends React.Component {
  state = {
    patient: this.props.patient || '',
    appt_date: this.props.appt_date || '',
    start_time: this.props.start_time || '',
    end_time: this.props.end_time || '',
    comment: this.props.comment || ''
  }
  handleFormSubmit = (evt) => {
    evt.preventDefault();
    this.props.onFormSubmit({ ...this.state });
  }
  handlePatientUpdate = (evt) => {
    this.setState({ patient: evt.target.value });
  }
  handleScheduleDateUpdate = (evt) => {
    this.setState({ appt_date: evt.target.value });
  }
  handleScheduleStartUpdate = (evt) => {
    this.setState({ start_time: evt.target.value });
  }
  handleScheduleEndUpdate = (evt) => {
    this.setState({ end_time: evt.target.value });
  }
  handleCommentUpdate = (evt) => {
    this.setState({ comment: evt.target.value });
  }

  // onChange = appt_date => this.setState({ appt_date })
  render() {
    const buttonText = this.props.id ? 'Update Appointment' : 'Create Appointment';
    return (
      <form onSubmit={this.handleFormSubmit}>
        <div className="form-group">
          <label>
            Patient
          </label>
          <input type="text" placeholder="Enter a patient"
            value={this.state.patient} onChange={this.handlePatientUpdate}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Schedule From
          </label>
          <div>
            {/* <DayPickerInput
              value={this.state.appt_date}
              onChange={this.handleScheduleStartUpdate}
              dayPickerProps={{
                disabledDays: {
                  daysOfWeek: [0, 7],
                },
              }}
              className="form-control"
            /> */}
            <input type="date" placeholder="Enter a patient"
              value={this.state.appt_date} onChange={this.handleScheduleDateUpdate}
              className="form-control"
            />
            </div>
        </div>

        <div className="form-group">
          <label>
            From
          </label>
          <input type="time" min="09:00" max="16:59" required placeholder="From"
            value={this.state.start_time} onChange={this.handleScheduleStartUpdate}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            To
          </label>
          <input type="time" min="09:01" max="17:00" required placeholder="To"
            value={this.state.end_time} onChange={this.handleScheduleEndUpdate}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Comment
          </label>
          <textarea className="form-control" placeholder="Appointment Comment"
            rows="5" value={this.state.comment}
            onChange={this.handleCommentUpdate}
          >
            {this.state.comment}
          </textarea>
        </div>
        <div className="form-group d-flex justify-content-between">
          <button type="submit" className="btn btn-md btn-primary">
            {buttonText}
          </button>
          <button type="button" className="btn btn-md btn-secondary" onClick={this.props.onCancelClick}>
            Cancel
          </button>
        </div>
      </form>
    )
  }
}

class ToggleableAppointmentForm extends React.Component {
  state = {
    inCreateMode: false
  }
  handleCreateClick = () => {
    this.setState({ inCreateMode: true });
  }
  leaveCreateMode = () => {
    this.setState({ inCreateMode: false });
  }
  handleCancleClick = () => {
    this.leaveCreateMode();
  }
  handleFormSubmit = (appointment) => {
    this.leaveCreateMode();
    this.props.onAppointmentCreate(appointment);
  }
  render() {
    if (this.state.inCreateMode) {
      return (
        <div className="mb-3 p-4" style={{ boxShadow: '0 0 10px #ccc' }} >
          <AppointmentForm
            onFormSubmit={this.handleFormSubmit}
            onCancelClick={this.handleCancleClick}></AppointmentForm>
        </div>

      )
    }
    return (
      <button onClick={this.handleCreateClick} className="btn btn-secondary">
        <FontAwesomeIcon icon={faPlus} />
      </button>
    );
  }
}

ReactDOM.render(<AppointmentDashboard />, document.getElementById('root'));