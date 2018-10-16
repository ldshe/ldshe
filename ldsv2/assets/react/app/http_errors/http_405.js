import React, {Component} from 'react';

export default class Http405 extends Component {

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
                    <p className="code">405</p>
                    <p className="title">Method Not Allowed</p>
                    <p className="message">The request cannot be processed because an invalid request method is being used.</p>
                    <p className="link">Go back to {
                        query && query.home ?
                        <a href="#" onClick={this.redirectSpecificHome}>{query.home.name}</a> :
                        <a href="#" onClick={this.redirectGenericHome}>HOME</a>
                    }.</p>
                </div>
            </div>
        );
    }
}
