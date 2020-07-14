import React from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons'
 
library.add(faTrash, faEdit)

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
        schedule={appointment.schedule}
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
            schedule={this.props.schedule}
            comment={this.props.comment}
            onCancelClick={this.leaveEditMode}
            onFormSubmit={this.handleUpdate}
          />
        );
      }
      return (
        <Appointment
          patient={this.props.patient}
          schedule={this.props.schedule}
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
          {this.props.comment}
        </div>
        <div className="card-footer">
          <strong>Schedule:</strong>  {this.props.schedule}
        </div>
      </div>
    );
  }
}

class AppointmentForm extends React.Component {
  state = {
    patient: this.props.patient || '',
    schedule: this.props.schedule || '',
    comment: this.props.comment || ''
  }
  handleFormSubmit = (evt) => {
    evt.preventDefault();
    this.props.onFormSubmit({ ...this.state });
  }
  handlePatientUpdate = (evt) => {
    this.setState({ patient: evt.target.value });
  }
  handleScheduleUpdate = (evt) => {
    this.setState({ schedule: evt.target.value });
  }
  handleCommentUpdate = (evt) => {
    this.setState({ comment: evt.target.value });
  }
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
            Schedule
          </label>
          <input type="text" placeholder="Schedule's name"
            value={this.state.schedule} onChange={this.handleScheduleUpdate}
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