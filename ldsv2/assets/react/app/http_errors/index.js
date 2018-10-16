import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import Http400 from './http_400';
import Http401 from './http_401';
import Http403 from './http_403';
import Http404 from './http_404';
import Http405 from './http_405';
import Http409 from './http_409';
import Http423 from './http_423';
import Http500 from './http_500';
import NetErr from './net_err';

export default class HttpErrors extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <Switch>
                <Route path={`${this.props.match.path}/400`} component={Http400}/>
                <Route path={`${this.props.match.path}/401`} component={Http401}/>
                <Route path={`${this.props.match.path}/403`} component={Http403}/>
                <Route path={`${this.props.match.path}/404`} component={Http404}/>
                <Route path={`${this.props.match.path}/405`} component={Http405}/>
                <Route path={`${this.props.match.path}/409`} component={Http409}/>
                <Route path={`${this.props.match.path}/423`} component={Http423}/>
                <Route path={`${this.props.match.path}/500`} component={Http500}/>
                <Route path={`${this.props.match.path}/net_err`} component={NetErr}/>
            </Switch>
        );
    }
};
