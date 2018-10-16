import React, {Component} from 'react';

export default class Http400 extends Component {

    constructor(props, context) {
        super(props, context);
        this.redirectSpecificHome = this.redirectSpecificHome.bind(this);
        this.redirectGenericHome = this.redirectGenericHome.bind(this);
    }

    redirectSpecificHome(e) {
        e.preventDefault();
        const {query} = this.props.location;
        location.replace(query.home.link);
    }

    redirectGenericHome(e) {
        e.preventDefault();
        location.replace('/');
    }

    render() {
        const {query} = this.props.location;
        return (
            <div className="lds">
                <div className="http-error">
                    <p className="code">400</p>
                    <p className="title">Bad Request</p>
                    <p className="message">The request could not be understood by the server.</p>
                    <p className="link">Please try again later or go back to {
                        query && query.home ?
                        <a href="#" onClick={this.redirectSpecificHome}>{query.home.name}</a> :
                        <a href="#" onClick={this.redirectGenericHome}>HOME</a>
                    }.</p>
                </div>
            </div>
        );
    }
}
