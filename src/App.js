import React, { useState, useEffect } from 'react';
import './App.css';
import { forwardRef } from 'react';
import Avatar from 'react-avatar';
import Grid from '@material-ui/core/Grid'

import MaterialTable from "material-table";
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import Alert from '@material-ui/lab/Alert';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

function checkIfSunday(datetime){
    var dt = new Date(datetime);
    console.log("DAY!!! " + dt)
    if (dt.getDay() === 0){
        console.log("DATE IS SUNDAY")
        return true
    } else{
        console.log("DATE IS NOT SUNDAY")
        return false
    }
}

function checkStartTime(datetime){
    var min_time = new Date();
    min_time.setHours(9, 0, 0); 

    var start_time = new Date(datetime)
    console.log(start_time)
    start_time.setFullYear(min_time.getFullYear())
    start_time.setMonth(min_time.getMonth())
    start_time.setDate(min_time.getDate())

    console.log("INPUT TIME!!! " + start_time)
    console.log("MIN TIME!!! " + min_time)
    if (start_time < min_time){
        console.log("START TIME IS INVALID")
        return true
    } else {
        console.log("START TIME IS VALID")
        return false
    }
}

function checkEndTime(datetime) {
    var max_time = new Date();
    max_time.setHours(17, 0, 59);

    var end_time = new Date(datetime)
    console.log(end_time)
    end_time.setFullYear(max_time.getFullYear())
    end_time.setMonth(max_time.getMonth())
    end_time.setDate(max_time.getDate())

    console.log("INPUT TIME!!! " + end_time)
    console.log("MAX TIME!!! " + max_time)
    if (end_time > max_time) {
        console.log("END TIME IS INVALID")
        return true
    } else {
        console.log("END TIME IS VALID")
        return false
    }
}

function checkValidTime(start_time, end_time) {
    var st = new Date(start_time)
    var et = new Date(end_time)
    console.log("CHECK START TIME!!! " + st)
    console.log("CHECK END TIME!!! " + et)
    if (st > et) {
        console.log("TIME RANGE IS INVALID")
        return true
    } else {
        console.log("TIME RANGE IS VALID")
        return false
    }
}

function App() {
    const current = new Date()
    const [value, changeDate] = useState([new Date(current.getFullYear(), current.getMonth(), 1), new Date(current.getFullYear(), current.getMonth()+1, 1)]);
    console.log("VALUE DATE!!!")
    console.log(value)

    var columns = [
        { title: "ID", field: "id", editable: "never", initialEditValue: "0"},
        { title: "Avatar", render: rowData => <Avatar maxInitials={1} size={40} round={true} name={rowData === undefined ? " " : rowData.patient} /> },
        { title: "Patient", field: "patient" },
        { title: "Date", field: "appt_date", type: "date"},
        { title: "From", field: "start_time", type: "time"},
        { title: "To", field: "end_time", type: "time"},
        { title: "Comment", field: "comment" }
    ]
    const [data, setData] = useState([]); //table data

    //for error handling
    const [iserror, setIserror] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])

    useEffect(() => {
        fetch(`http://localhost:8000/api/appointments/?appt_date__gte=${value[0].toISOString()}&appt_date__lte=${value[1].toISOString()}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setData(data)
            })
            .catch(error => {
                console.log(error)
            })
    }, [value[0].toISOString()], value[1].toISOString())

    const handleRowUpdate = (newData, oldData, resolve) => {
        //validation
        let errorList = []
        if (newData.patient === "") {
            errorList.push("Please enter patient name")
        }
        if (newData.appt_date === "") {
            errorList.push("Please enter date")
        } else if (checkIfSunday(newData.appt_date)) {
            errorList.push("Invalid date! Appointments are only allowed from 9:00AM - 5:00 PM Mon - Sat.")
        }

        if (newData.comment === "") {
            errorList.push("Please enter comment")
        }
        if (newData.start_time === "") {
            errorList.push("Please enter start time")
        } else if (checkStartTime(newData.start_time)) {
            errorList.push("Invalid time! Appointments are only allowed from 9:00AM - 5:00 PM Mon - Sat.")
        }

        if (newData.end_time === "") {
            errorList.push("Please enter end time")
        } else if (checkEndTime(newData.end_time)) {
            errorList.push("Invalid time! Appointments are only allowed from 9:00AM - 5:00 PM Mon - Sat.")
        }
        
        if (newData.start_time !== undefined && newData.end_time !== undefined) {
            if (checkValidTime(newData.start_time, newData.end_time)) {
                errorList.push("Invalid time! Start time must be earlier than end time.")
            }
        }


        if (errorList.length < 1) {
            // api.patch("/appointments/" + newData.id, newData)
            fetch(`http://localhost:8000/api/appointments/${newData.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
                }).then(response => {
                if (response.status === 400) {
                    console.log(response.status);
                    throw new Error("Selected schedule is already taken! Please choose another date.");
                }
                })
                .then(res => {
                    const dataUpdate = [...data];
                    const index = oldData.tableData.id;
                    dataUpdate[index] = newData;
                    setData([...dataUpdate]);
                    resolve()
                    setIserror(false)
                    setErrorMessages([])
                })
                .catch(error => {
                    setErrorMessages([error.toString()])
                    setIserror(true)
                    resolve()
                })
        } else {
            setErrorMessages(errorList)
            setIserror(true)
            resolve()

        }

    }

    const handleRowAdd = (newData, resolve) => {
        //validation
        let errorList = []
        if (newData.patient === undefined) {
            errorList.push("Please enter patient name")
        }
        if (newData.appt_date === undefined) {
            errorList.push("Please enter date")
        } else if (checkIfSunday(newData.appt_date)) {
            errorList.push("Invalid date! Appointments are only allowed from 9:00AM - 5:00 PM Mon - Sat.")
        }

        if (newData.comment === undefined) {
            errorList.push("Please enter comment")
        }
        if (newData.start_time === undefined) {
            errorList.push("Please enter start time")
        } else if (checkStartTime(newData.start_time)) {
            errorList.push("Invalid time! Appointments are only allowed from 9:00AM - 5:00 PM Mon - Sat.")
        }

        if (newData.end_time === undefined) {
            errorList.push("Please enter end time")
        } else if (checkEndTime(newData.end_time)){
            errorList.push("Invalid time! Appointments are only allowed from 9:00AM - 5:00 PM Mon - Sat.")
        }

        if (newData.start_time !== undefined && newData.end_time !== undefined) {
            if (checkValidTime(newData.start_time, newData.end_time))
            {
                errorList.push("Invalid time! Start time must be earlier than end time.")
            }
        }

        if (errorList.length < 1) { //no error
            // api.post(`/appointments`, newData)
            fetch('http://localhost:8000/api/appointments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
                }).then(response => {
                if (response.status === 400) {
                    console.log(response.status);
                    throw new Error("Selected schedule is already taken! Please choose another date.");
                }
                })
                .then(res => {
                    let dataToAdd = [...data];
                    dataToAdd.push(newData);
                    setData(dataToAdd);
                    resolve()
                    setErrorMessages([])
                    setIserror(false)
                    window.location.reload(false);
                })
                .catch(error => {
                    setErrorMessages([error.toString()])
                    setIserror(true)
                    resolve()
                })
        } else {
            setErrorMessages(errorList)
            setIserror(true)
            resolve()
        }


    }

    const handleRowDelete = (oldData, resolve) => {
        fetch(`http://localhost:8000/api/appointments/${oldData.id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(res => {
                const dataDelete = [...data];
                const index = oldData.tableData.id;
                dataDelete.splice(index, 1);
                setData([...dataDelete]);
                resolve()
            })
            .catch(error => {
                setErrorMessages(["Delete failed! Server error"])
                setIserror(true)
                resolve()
            })
    }

    return (
        <div className="App">

            <Grid container spacing={1}>
                <Grid item xs={3}></Grid>
                <Grid item xs={6}>
                    <div>
                        {iserror &&
                            <Alert severity="error">
                                {errorMessages.map((msg, i) => {
                                    return <div key={i}>{msg}</div>
                                })}
                            </Alert>
                        }
                    </div>
                    <MaterialTable
                        title="Doctors’ appointments"
                        columns={columns}
                        data={data}
                        icons={tableIcons}
                        editable={{
                            onRowUpdate: (newData, oldData) =>
                                new Promise((resolve) => {
                                    handleRowUpdate(newData, oldData, resolve);

                                }),
                            onRowAdd: (newData) =>
                                new Promise((resolve) => {
                                    handleRowAdd(newData, resolve)
                                }),
                            onRowDelete: (oldData) =>
                                new Promise((resolve) => {
                                    handleRowDelete(oldData, resolve)
                                }),
                        }}
                    />
                    <div>
                        <DateRangePicker
                            onChange={changeDate}
                            value={value}
                            clearIcon={null}
                        />
                    </div>
                </Grid>
                <Grid item xs={3}></Grid>
            </Grid>
        </div>
    );
}

export default App;