import React from 'react';
import './reservation.css';

class Reservation extends React.Component {

    constructor(props) {
        super(props);
        this.state = { tickets: this.props.tickets, repertoire: this.props.repertoire, seats: this.props.seats, errors: [] };
    }

    onPreviousClicked = (event) => {
        if (!this.props.onPreviousClicked)
            return;
        this.props.onPreviousClicked();
    }

    onReserveClicked = (event) => {
        const tickets = this.state.tickets.filter(t => t.amount > 0);
        const ticketsIds = [];
        tickets.forEach(element => {
            for(let x = 0; x < element.amount; x++) {
                ticketsIds.push(element._id);
            }
        });
        console.log("wysylam");
        console.log(ticketsIds);
        const response = fetch("https://cinnemapplication.herokuapp.com/reservation", {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                firstName: this.name, 
                lastName: this.lastName, 
                email: this.email, 
                phoneNumber: this.phoneNumber, 
                repertoireId: 
                this.state.repertoire.repertoireId,  
                seats: this.state.seats,
                tickets: ticketsIds
            })
          })
          .then(resp => {
              if (resp.status !== 200 && resp.status !== 422) {
                return Promise.reject("Service is temporary unavailable.");
              }
              return resp.json();
          })
          .then(json => {
            if (json.status === "validationFailed") {
                this.setState({errors: json.errors});
            }
            else {
                if (this.props.onFinish){
                    this.props.onFinish();
                }
            }
          })
    }

    onNameChange = (event) => {
        this.name = event.target.value;
    }

    onLastNameChange = (event) => {
        this.lastName = event.target.value;
    }

    onEmailChange = (event) => {
        this.email = event.target.value;
    }

    onPhoneNumberChange = (event) => {
        this.phoneNumber = event.target.value;
    }
    
    render = () => {
        const generalErrors = this.state.errors.filter(e => e.param !== "firstName" && e.param !== "lastName" && e.param !== "email" && e.param !== "phoneNumber").map(e => <p className="reservation-error-text">{e.msg}</p>);
        const firstNamErrors = this.state.errors.filter(e => e.param === "firstName").map(e => <p className="reservation-error-text">{e.msg}</p>);
        const lastNameErrors = this.state.errors.filter(e => e.param === "lastName").map(e => <p className="reservation-error-text">{e.msg}</p>);
        const phoneNumberErrors = this.state.errors.filter(e => e.param === "phoneNumber").map(e => <p className="reservation-error-text">{e.msg}</p>);
        const emailErrors = this.state.errors.filter(e => e.param === "email").map(e => <p className="reservation-error-text">{e.msg}</p>);
        return (
            <div className="reservation-container" >
                <div>{generalErrors}</div>
                <div className="reservation-input-container">
                    <label htmlFor="name">First name</label>
                    <div>
                        <input className="reservation-input" id="name" type="text" onChange={this.onNameChange}/>
                    </div>
                    <div>{firstNamErrors}</div>
                </div>

                <div className="reservation-input-container">
                    <label htmlFor="surname">Last name</label>
                    <div>
                        <input className="reservation-input" id="surname" type="text" onChange={this.onLastNameChange}/>
                    </div>
                    <div>{lastNameErrors}</div> 
                </div>

                <div className="reservation-input-container">
                    <label htmlFor="email">Email</label>
                    <div>
                        <input className="reservation-input" id="email" type="text" onChange={this.onEmailChange}/>
                    </div>
                    <div>{emailErrors}</div>
                </div>

                <div className="reservation-input-container">
                    <label htmlFor="phoneNumber">Phone number</label>
                    <div>
                        <input className="reservation-input" id="phoneNumber" type="text" onChange={this.onPhoneNumberChange}/>
                    </div>
                    <div>{phoneNumberErrors}</div>
                </div>

                <div>
                    <div className="total-price">Total price: <span>{parseFloat(Math.round(this.state.tickets.reduce((val, el) => { val += Number(el.basePriceRatio) * Number(this.state.repertoire.baseTicketPrice) * Number(el.amount); return val; }, 0) * 100) / 100).toFixed(2)}</span> zł</div>   
                </div>
                
                <div className="reservation-wrapper">
                    <button className="button" onClick={this.onPreviousClicked}>Previous</button>
                    <button className="button" onClick={this.onReserveClicked}>Reserve</button>
                </div>
            </div>
        )
    }
}

export default Reservation;
