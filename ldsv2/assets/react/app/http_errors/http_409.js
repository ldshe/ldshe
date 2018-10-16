import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {EditPage} from 'react/app/design/types';

export default class Http409 extends Component {

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
                    <p className="code">409</p>
                    <p className="title">Conflict</p>
                    <p className="message">Request conflicts with current state of resource.</p>
                    <p className="message">
                        The content that you are editing may be out-of-date.
                        This can be happened if you edit your design from different browsers or from multiple tabs.
                    </p>
                    <p className="link">
                        {query && query.editPage == EditPage.DESIGN ? <Link to={`/edit/${query.courseId}`} replace>Refresh</Link> : null}
                        {query && query.editPage == EditPage.PATTERN ? <Link to={`/pattern/edit/${query.collectId}`} replace>Refresh</Link> : null}
                        {query && (query.courseId || query.collectId) ? ' the content to continue editing or go back to ' : 'Go back to '}
                        {query && query.home ?
                            <a href="#" onClick={this.redirectSpecificHome}>{query.home.name}</a> :
                            <a href="#" onClick={this.redirectGenericHome}>HOME</a>}
                        .
                    </p>
                </div>
            </div>
        );
    }
}
