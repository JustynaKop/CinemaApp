import React from 'react';
import 'react-dropdown/style.css'

import './cinemaHall.css'

class CinemaHall extends React.Component {

  constructor(props) {
    super(props);
    this.state = {  repertoires : props.repertoires || [], cinemaHallsData: [], selectedCinemaHall: this.props.selectedCinemaHall, selectedSeats: this.props.selectedSeats || [], lastError: "" };
  }

  onPreviousClicked = (event) => {
    if (!this.props.onPreviousClicked)
        return;
    this.props.onPreviousClicked();
  }

  onNextClicked = (event) => {
      if (this.state.selectedSeats.length === 0) {
        this.setState({lastError: "Before you can continue you need to select seats, by clicking on them."})
        return;
      }
      else if (this.props.tickets) {
        const toSelect = this.props.tickets.reduce((sum, val) => sum + Number(val.amount), 0);
        if (toSelect !== this.state.selectedSeats.length) {
            this.setState({lastError: `You need to select execly ${toSelect} seats.`});
            return;
        }
      }
      if (!this.props.onSeatsSelected()) {
        this.props.onSeatsSelected(this.state.selectedSeats, this.state.selectedCinemaHall, this.state.repertoires.find(r => r.cinemaHall._id === this.state.selectedCinemaHall.cinemaHall._id));
      }
  }

  onSeatClicked = (event) => {
    const seat = this.state.selectedCinemaHall.seats.find(seat => event.target.id === seat._id);
    if (!seat || seat.reserved)
        return;

    const selectedSeats = [...this.state.selectedSeats];
    if (selectedSeats.includes(seat._id)) {
        selectedSeats.splice(selectedSeats.indexOf(seat._id), 1);
    }
    else if (!this.props.tickets || this.props.tickets.reduce((sum, val) => sum + Number(val.amount), 0) > selectedSeats.length) {
        selectedSeats.push(seat._id);
    }
    this.setState({selectedSeats: selectedSeats});
  }

  ensureInputIsValid = (hallJson, reservedSeatsJson) => {
    hallJson.cinemaHallData.seats.forEach(seat => {
        const val = reservedSeatsJson.reservedSeatsIds.find(i => i === seat._id);
        seat.reserved = val !== null && val !== undefined ? true : false;
    });
    const newHallData = [...this.state.cinemaHallsData, hallJson.cinemaHallData];
    if (this.state.selectedSeats.length > 0 && this.state.selectedCinemaHall && this.state.selectedCinemaHall.cinemaHall._id === hallJson.cinemaHallData.cinemaHall._id) {
        let reducedSelectedSeats = [...this.state.selectedSeats];
        if (this.props.tickets) {
            let toRemoveCount = reducedSelectedSeats.length - this.props.tickets.reduce((sum, val) => sum + Number(val.amount), 0);
            for(let x = 0; x < toRemoveCount; x++) {
                reducedSelectedSeats.pop();
            }
        }
        let fixedSelectedSeats = [...reducedSelectedSeats];
        reducedSelectedSeats.forEach(id => { 
            const seat = hallJson.cinemaHallData.seats.find(seat => id === seat._id);
            if (seat.reserved) {
                fixedSelectedSeats.splice(fixedSelectedSeats.indexOf(seat._id), 1);
            }
        });
        this.setState({selectedSeats: fixedSelectedSeats});
    }
    this.setState({cinemaHallsData: newHallData, selectedCinemaHall: this.state.selectedCinemaHall || hallJson.cinemaHallData });
  }

  fetchReservedSeatsData = (repertoire, hallJson) => {
    fetch("https://cinnemapplication.herokuapp.com/reservation/reservedSeats/" + repertoire.repertoireId)
    .then(resp => {
        if (resp.status !== 200){
          return Promise.reject("Service is temporary unavailable.");
        }
        return resp.json();
    })
    .then(json => {
        if (json.status !== "sucess") {
          return Promise.reject("Service is temporary unavailable.");
        }
        this.ensureInputIsValid(hallJson, json);
    });
  }

  componentDidMount = () => {
    this.props.repertoires.forEach(repertoire => {
        fetch("https://cinnemapplication.herokuapp.com/hall/" + repertoire.cinemaHall._id)
        .then(resp => {
            if (resp.status !== 200){
              return Promise.reject("Service is temporary unavailable.");
            }
            return resp.json();
        })
        .then(hallJson => {
            if (hallJson.status !== "sucess") {
              return Promise.reject("Service is temporary unavailable.");
            }
            this.fetchReservedSeatsData(repertoire, hallJson);
        });
    });
  }

  renderSeats = () => {
    const seats = [];
    let maxRow = this.state.selectedCinemaHall.seats.reduce((max, seat) => max = Number(seat.renderingRowNumber) > max ? Number(seat.renderingRowNumber) : max, 0); 
    let maxCol = this.state.selectedCinemaHall.seats.reduce((max, seat) => max = Number(seat.renderingColumnNumber) > max ? Number(seat.renderingColumnNumber) : max, 0); 
    for (let x = 0; x < maxRow; x++) {
        for(let y = 0; y < maxCol; y++) {
            const seat = this.state.selectedCinemaHall.seats.find(s => s.renderingRowNumber === x && s.renderingColumnNumber === y);
            if (seat)
            {
                let className = "seat-available";
                if (seat.reserved) {
                    className = "seat-reserved";
                }
                else if (this.state.selectedSeats.includes(seat._id)) {
                    className = "seat-selected";
                }
                seats.push(<div className={"seat " + className} key= {"row" + x + "col" + y} id = {seat._id} style={{gridColumnStart: y, gridColumnEnd: y, gridRowStart: x, gridRowEnd: x}} onClick = {this.onSeatClicked}></div>);
            }
            else {
                seats.push(<div className="seat" key= {"row" + x + "col" + y} style={{gridColumnStart: y, gridColumnEnd: y, gridRowStart: x, gridRowEnd: x}}></div>);
            }
        }
    }
    return seats;
  }

  render = () => {
    if (this.state.cinemaHallsData.length === 0) {
        return null;
    }
    return (
        <div className="cinema-hall-main-container">
            <div className="cinema-hall-screen-container"><h1>SCREEN</h1></div>
            <div className="seats-container">
                {this.renderSeats()}
            </div>
            <div className="error-text">{this.state.lastError}</div>
            <div className="cinema-hall-buttons">
                <button className="button" onClick={this.onPreviousClicked}>Previous</button>
                <button className="button" onClick={this.onNextClicked}>Next</button>
            </div>
        </div>
    );
  }
}

export default CinemaHall;
