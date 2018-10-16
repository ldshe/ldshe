import React, {Component} from 'react';

export default class NetErr extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <div className="lds">
                <div className="http-error">
                    <p className="title">Network Error</p>
                    <p className="message">No network connection or server cannot be reached at the moment.</p>
                </div>
            </div>
        );
    }
}
