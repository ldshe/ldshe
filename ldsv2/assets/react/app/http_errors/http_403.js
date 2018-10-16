import React, {Component} from 'react';

export default class Http403 extends Component {

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
                    <p className="code">403</p>
                    <p className="title">Forbidden</p>
                    <p className="message">You do not have permission to access the resource using the supplied credentials.</p>
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
