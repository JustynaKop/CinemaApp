import React from 'react';
import './ticket.css';

class Ticket extends React.Component {

    constructor(props) {
        super(props);
        this.state = { tickets: [], selectedTickets: {}, lastError: ""}
    }

    onTicketValueChanged = (event) => {
        const newTickets = {...this.state.selectedTickets};
        newTickets[event.target.id] = event.target.value;
        this.setState({selectedTickets: newTickets})
    }

    onNextClick = (event) => {
        const sum = Object.values(this.state.selectedTickets).reduce((sum, val) => Number(sum) + Number(val), 0);
        console.log(sum);
        if (sum > 20) {
            this.setState({lastError: "Maksimum number of total 20 tickets is allowed. If you need more please contact with our group reservations section."});
        }
        else if (sum === 0) {
            this.setState({lastError: "To continue you need to specify at least one ticket."});
        }
        else {
            if (this.props.onTicketsSelected) {
                this.props.onTicketsSelected([...this.state.tickets].map(val => { val.amount = this.state.selectedTickets[val._id] || 0; return val }));
            }
        }
    }

    componentDidMount= () => {
        fetch("https://cinnemapplication.herokuapp.com/ticket")
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

            if (this.props.selectedTickets !== null && this.props.selectedTickets !== undefined)
                this.setState({tickets : json.ticketsData, selectedTickets : this.props.selectedTickets.reduce((obj, el) => { obj[el._id] = el.amount; return obj; }, {}) })
            else {
                const selectedTickets = {};
                json.ticketsData.forEach(element => {
                    selectedTickets[element._id] = 0;
                });
                this.setState({tickets : json.ticketsData, selectedTickets : selectedTickets })
            }
        })
    }

    render = () => {
        if (!this.state.selectedTickets)
            return null;
        return (
            <div className="ticket-container" >
                <div className="ticket-table">
                    <table className="ticket-table-details" >
                        <thead className="ticket-table-header">
                            <tr>
                                <td className="ticket-table-td">Type</td>
                                <td className="ticket-table-td">Discount</td>
                                <td className="ticket-table-td">Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.tickets.map((ticket, index) => {
                                return (
                                    <tr key={index}>
                                        <td className="ticket-table-td">{ticket.name}</td>
                                        <td className="ticket-table-td">{100 - ticket.basePriceRatio * 100}</td>
                                        <td className="ticket-table-td">
                                            <input  className="ticket-input" id={ticket._id} onChange={this.onTicketValueChanged} type="number" min="0" max="20" value={this.state.selectedTickets[ticket._id]}/>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="error-text">{this.state.lastError || ""}</div>
                <div className="ticket-buttons">
                    <button onClick={this.onNextClick} className="button">Next</button>
                </div>
            </div>
        )
    }
}

export default Ticket;
