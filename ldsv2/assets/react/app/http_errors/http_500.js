import React, {Component} from 'react';

export default class Http500 extends Component {

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
                    <p className="code">500</p>
                    <p className="title">Internal Server Error</p>
                    <p className="message">There is a problem with the resource you are looking for.</p>
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
