import React from 'react';
import Slider from "react-slick";
import Movie from "./Movie";
import Ticket from "./Ticket";
import CinemaHall from "./CinemaHall";
import Reservation from "./Reservation";

import './App.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { movies: [], stage: 0 }
    this.cards = [];
    this.reset();
  }

  reset = () => {
    this.setState({stage: 0});
    this.reservationDateTime = 0;
    this.movieToReserve = null;
    this.repertoiresAvailableToReserve = null;
    this.selectedTickets = null;
    this.selectedSeats = null;
    this.selectedCinemaHall = null;
    this.selectedRepertoire = null;
  }

  alignCards = () => {
    if (this.cards.length === 0)
      return;
    for (let x = 0; x < this.cards.length; x++) {
      this.cards[x].setMinHeight(0);
    }
    const min = this.cards.reduce((max, el) => el.ref.current.offsetHeight > max ? el.ref.current.offsetHeight : max, 0);
    if (min > 0) {
      for (let x = 0; x < this.cards.length; x++) {
        this.cards[x].setMinHeight(min);
      }
    }
  }

  componentDidMount = () => {
    window.addEventListener('resize', (event) => {
      setTimeout(() => { 
        this.alignCards();
      }, 100);
    });
    fetch("https://cinnemapplication.herokuapp.com/repertoire")
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
        this.setState({ movies : json.movies })
        setTimeout(() => { 
          this.alignCards();this.alignCards();
        }, 200);
    })
  }

  onMakeReservation = (dateTime, movieData) => {
    this.reservationDateTime = dateTime;
    this.movieToReserve = movieData;
    this.setState({ dateTime, stage: 1 });
  }

  onTicketsSelected = (tickets) => {
    this.selectedTickets = tickets;
    this.repertoiresAvailableToReserve = this.movieToReserve.displayDates.find(movie => movie.displayDateTime === this.reservationDateTime).repertoires;
    this.setState({ stage: 2 });
  }

  onSeatsSelected = (seats, cinemaHall, repertoire) => {
    this.selectedSeats = seats;
    this.selectedCinemaHall = cinemaHall;
    this.selectedRepertoire = repertoire;
    this.setState({stage: 3});
  }

  onCloseModal = () => {
    this.reset();
    this.setState({stage: 0});
  }

  onPreviousClicked = () => {
    this.setState({stage: this.state.stage - 1});
  }

  getModal() {
    if (this.state.stage === 1) {
      return (
        <div style={{display : this.state.stage === 1 ? "block" : "none"}} className="modal">
          <div className="modal-content modal-content-tickets">
            <div className="close" onClick={() => this.onCloseModal()}>&times;</div>
            <h1 className="dialog-header">Please specify tickets you want to buy</h1>
            <div className="modal-custom-area">
              <Ticket selectedTickets={this.selectedTickets} onTicketsSelected={this.onTicketsSelected}></Ticket>
            </div>
          </div>
        </div>
      );
    } else if (this.state.stage === 2) {
      return (
        <div style={{display : this.state.stage === 2 ? "block" : "none"}} className="modal">
          <div className="modal-content modal-content-seats">
            <div className="close" onClick={() => this.onCloseModal()}>&times;</div>
            <h1 className="dialog-header">Please select your seats</h1>
            <div className="modal-custom-area">
              <CinemaHall selectedCinemaHall={this.selectedCinemaHall} tickets={this.selectedTickets} selectedSeats= {this.selectedSeats} repertoires={this.repertoiresAvailableToReserve} onPreviousClicked={this.onPreviousClicked} onSeatsSelected={this.onSeatsSelected}></CinemaHall>
            </div>
          </div>
        </div>
      );
    } else if (this.state.stage === 3) {
      return (
        <div style={{display : this.state.stage === 3 ? "block" : "none"}} className="modal">
          <div className="modal-content modal-content-reservation">
            <div className="close" onClick={() => this.onCloseModal()}>&times;</div>
            <h1 className="dialog-header">Please insert reservation data</h1>
            <div className="modal-custom-area">
              <Reservation tickets={this.selectedTickets} repertoire={this.selectedRepertoire} seats={this.selectedSeats} onPreviousClicked={this.onPreviousClicked} onFinish={this.onCloseModal}></Reservation>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  render = () => {
    var settings = {
      dots: false,
      infinite: false,
      speed: 900,
      slidesToShow: 3,
      slidesToScroll: 1,
      slidesPerRow: 1,
      swipeToSlide: true,
      responsive: [
        {
          breakpoint: 1750,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 1100,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        }]
    };
    return (
      <div className="main-container">
        <Slider {...settings}>
          {this.state.movies.map((data, index) => <Movie key={index} movieData={data} onReserveClicked={this.onMakeReservation}  ref={(instance)=> this.cards[index] = instance}/>)}
        </Slider>
        {this.getModal()}
      </div>
    );
  }
}

export default App;
