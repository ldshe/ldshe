import React, {Component} from 'react';

export default class Http401 extends Component {

    constructor(props, context) {
        super(props, context);
        this.redirectLogin = this.redirectLogin.bind(this);
    }

    redirectLogin(e) {
        e.preventDefault;
        const {query} = this.props.location;
        location.replace(`/users/login.php?dest=${query.dest}`);
    }

    render() {
        const {query} = this.props.location;
        return (
            <div className="lds">
                <div className="http-error">
                    <p className="code">401</p>
                    <p className="title">Not Authorized</p>
                    <p className="message">User authentication is required for the requested resource.</p>
                    <p className="link">
                        Go to <a href="#" onClick={this.redirectLogin}>Login</a>.
                    </p>
                </div>
            </div>
        );
    }
}
