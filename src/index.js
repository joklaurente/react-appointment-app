import React from 'react';
import ReactDOM from 'react-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons'
 
library.add(faTrash, faEdit)

class AppointmentDashboard extends React.Component {
  state = {
    appointments: [
      {
        id: 1,
        patient: 'A simple appointment',
        schedule: 'Jude Ben',
        comment: `Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim
                    veniam, quis nostrud`
      },
      {
        id: 2,
        patient: 'A appointment of secrets',
        schedule: 'James John',
        comment: `Sed ut perspiciatis unde omnis iste natus
                    error sit voluptatem accusantium doloremque laudantium,
                    totam rem aperiam, eaque ipsa quae ab illo inventore
                    veritatis et quasi architecto beatae vitae dicta sunt
                    explicabo.`
      }
    ]
  }

  createNewAppointment = (appointment) => {
    appointment.id = Math.floor(Math.random() * 1000);
    this.setState({ appointments: this.state.appointments.concat([appointment]) });
  }

  updateAppointment = (newAppointment) => {
    const newAppointments = this.state.appointments.map(appointment => {
      if (appointment.id === newAppointment.id) {
        return Object.assign({}, newAppointment)
      } else {
        return appointment;
      }
    });

    this.setState({ appointments: newAppointments });
  }

  deleteAppointment = (appointmentId) => {
    this.setState({ appointments: this.state.appointments.filter(appointment => appointment.id !== appointmentId) })
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
            <strong>Title: </strong>{this.props.patient}
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
          <strong>Author:</strong>  {this.props.schedule}
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
  handleTitleUpdate = (evt) => {
    this.setState({ patient: evt.target.value });
  }
  handleAuthorUpdate = (evt) => {
    this.setState({ schedule: evt.target.value });
  }
  handleDescriptionUpdate = (evt) => {
    this.setState({ comment: evt.target.value });
  }
  render() {
    const buttonText = this.props.id ? 'Update Appointment' : 'Create Appointment';
    return (
      <form onSubmit={this.handleFormSubmit}>
        <div className="form-group">
          <label>
            Title
          </label>
          <input type="text" placeholder="Enter a patient"
            value={this.state.patient} onChange={this.handleTitleUpdate}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Author
          </label>
          <input type="text" placeholder="Author's name"
            value={this.state.schedule} onChange={this.handleAuthorUpdate}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>
            Description
          </label>
          <textarea className="form-control" placeholder="Appointment Description"
            rows="5" value={this.state.comment}
            onChange={this.handleDescriptionUpdate}
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