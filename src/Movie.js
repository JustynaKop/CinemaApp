import React from 'react';
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import './movie.css';

class Movie extends React.Component {
  constructor(props) {
    super(props);

    this.displayDates = props.movieData.displayDates.sort().map(d => new Date(d.displayDateTime).toLocaleDateString("pl-PL"))
        .filter((element, index, array) => array.indexOf(element) === index);
    this.availableHours = [];
    this.selectedDateTime = undefined;
    
    this.state = { movieData : props.movieData, selectedDate: this.displayDates[0], minHeight: this.props.minHeight || 0 };

    this.ref = React.createRef();
  }

  filterAvailableHours = (date) => {
    this.availableHours = this.state.movieData.displayDates.filter((element) => new Date(element.displayDateTime).toLocaleDateString("pl-PL") === date)
    .map(val => { 
        const dateTime = new Date(val.displayDateTime).toLocaleDateString("pl-PL",  { hour: 'numeric', minute: 'numeric' });
        return { 
            label: dateTime.split(",")[1], 
            value: val.displayDateTime
        }
    })
    .sort(v => v.value); 
    this.selectedDateTime = this.availableHours[0].value;
  }

  onDateChanged = (item) => {
    this.filterAvailableHours(item.value);
    this.setState({selectedDate: item.value});
  }

  onSelectedDateTimeChanged = (item) => {
    this.selectedDateTime = item.value;
  }

  onReserveClicked = (event) => {
      console.log(this.selectedDateTime);
    this.props.onReserveClicked(this.selectedDateTime, this.state.movieData);
  }

  setMinHeight = (height) => {
      this.setState({ minHeight: height});
  }

  componentDidMount = () => {
    this.filterAvailableHours(this.state.selectedDate);
  }

  render = () => {
    return (
        <div style={{minHeight: this.state.minHeight + "px"}} className="movie-container" ref={this.ref}>
            <h1 style={{color: "orange"}}>{this.state.movieData.movie.title}</h1>
            <div className="movie-data-container">
                <div className="image-poster-container">
                    <img className="image-poster" src={this.state.movieData.movie.poster} alt={""}/>
                </div>
                <div className="movie-details-container">
                    <div>
                        <h3 className="date-header"> Display date</h3>
                        <Dropdown options={this.displayDates} onChange={this.onDateChanged} value={this.state.selectedDate} placholder={"Select date"}></Dropdown>
                    </div>
                    <div>
                        <h3 className="hour-header">Display hour</h3>
                        <Dropdown options={this.availableHours} onChange={this.onSelectedDateTimeChanged} value={this.availableHours[0]} placholder={"Select hour"}></Dropdown>
                    </div>
                    <button className="reservation-button" onClick={this.onReserveClicked}>Make reservation</button>
                    <div>
                        <h3>Director</h3><span className="movie-details-text">{this.state.movieData.movie.director}</span>
                    </div>
                    <div>
                        <h3>Actors</h3><span className="movie-details-text">{this.state.movieData.movie.actors}</span>
                    </div>
                </div>
            </div>
            <div>
                <h3>Description</h3>
                <p className="movie-details-text">{this.state.movieData.movie.description}</p>
            </div>
        </div>
    );
  }
}

export default Movie;
