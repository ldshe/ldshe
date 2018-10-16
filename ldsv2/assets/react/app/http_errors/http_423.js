import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import alertify from 'alertify.js';
import Echo from 'laravel-echo';
import io from 'socket.io-client';
import appConfig from 'react/app/design/config';
import {EditPage} from 'react/app/design/types';


export default class Http423 extends Component {

    constructor(props, context) {
        super(props, context);
        this.initEcho = this.initEcho.bind(this);
        this.relEcho = this.relEcho.bind(this);
        this.clearTimer = this.clearTimer.bind(this);
        this.onTakeover = this.onTakeover.bind(this);
        this.onTakeoverForcefully = this.onTakeoverForcefully.bind(this);
        this.redirectSpecificHome = this.redirectSpecificHome.bind(this);
        this.redirectGenericHome = this.redirectGenericHome.bind(this);
        this.renderGeneral = this.renderGeneral.bind(this);
        this.renderTakeoverRequest = this.renderTakeoverRequest.bind(this);
        this.renderTakeover = this.renderTakeover.bind(this);
        this.renderReacquireLock = this.renderReacquireLock.bind(this);
        this.renderTakenover = this.renderTakenover.bind(this);
        this.state = {
            takeover: null,
            takeoverBy: null,
        };
        this.join = null;
        this.timeout = null;
        this.interval = null;
        this.userMap = {};
    }

    componentDidMount() {
        const {query} = this.props.location;
        if(query && query.code == 1) this.initEcho();
    }

    componentWillUnmount() {
        this.clearTimer();
        this.relEcho();
        $('.alertify').remove();
    }

    initEcho() {
        const {query} = this.props.location;

        if(query.editPage == EditPage.DESIGN)
            this.join = window.echo.join(`edit.design.${query.courseId}`);
        else
            this.join = window.echo.join(`edit.collection.${query.collectId}`);

        this.join.here(us => {
                this.userMap = {};
                us.forEach(u => this.userMap[u.id] = u.name);
            })
            .joining(u => this.userMap[u.id] = u.name)
            .leaving(u => delete this.userMap[u.id])
            .listenForWhisper('takeoverAccepted', e => {
                if(query.user.id == e.toId) {
                    this.clearTimer();
                    if(query.editPage == EditPage.DESIGN)
                        this.props.history.replace(`/takeover/${query.courseId}`);
                    else
                        this.props.history.replace(`/pattern/takeover/${query.collectId}`);
                }
            })
            .listenForWhisper('takeoverDenied', e => {
                if(query.user.id == e.toId) {
                    this.clearTimer();
                    this.setState({
                        takeover: 'denied',
                        takeoverBy: e.fromName,
                    });
                    $('.alertify').remove();
                    alertify.theme('bootstrap')
                        .okBtn('Got it!')
                        .alert(`${e.fromName} denied your takeover request.`);
                }
            })
            .listenForWhisper('takenOver', e => {
                this.clearTimer();
                this.setState({
                    takeover: 'denied',
                    takeoverBy: e.fromName,
                });
                $('.alertify').remove();
                alertify.theme('bootstrap')
                    .okBtn('Got it!')
                    .alert(`${e.fromName} has taken over the edit control.`);
            });
    }

    relEcho() {
        const {query} = this.props.location;
        if(query.editPage == EditPage.DESIGN)
            window.echo.leave(`edit.design.${query.courseId}`);
        else
            window.echo.leave(`edit.collection.${query.collectId}`);
    }

    clearTimer() {
        if(this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    onTakeover(e) {
        e.preventDefault();
        const {query} = this.props.location;
        this.join.whisper('takeoverRequest', {
            fromId: query.user.id,
            fromName: this.userMap[query.user.id],
        });
        this.setState({takeover: 'pending'});
        this.timeout = setTimeout(() => {
            this.setState({takeover: 'timeout'});
        }, appConfig.takeoverTimeout);
        let countdown = appConfig.takeoverTimeout - 1000;
        this.interval = setInterval(() => {
            $('#http-423-countdown').text(`Takeover forcefully (${countdown/1000}s remaining).`);
            countdown -= 1000;
            if(countdown < 0 && this.interval) clearInterval(this.interval);
        }, 1000);
    }

    onTakeoverForcefully(e) {
        e.preventDefault();
        const {query} = this.props.location;
        this.join.whisper('takeoverForcefully', {
            fromId: query.user.id,
            fromName: this.userMap[query.user.id],
        });
        let path = query.editPage == EditPage.DESIGN ? `/takeover/${query.courseId}` : `/pattern/takeover/${query.collectId}`;
        this.props.history.replace(path);
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

    renderGeneral() {
        return [
            <p key="p1" className="message">The resource that is being accessed is locked.</p>,
            <p key="p2" className="link">
                {'Go back to '}
                <a href="#" onClick={this.redirectGenericHome}>HOME</a>.
            </p>
        ];
    }

    renderTakeoverRequest() {
        const {query} = this.props.location;
        const {takeover} = this.state;
        if(takeover == null || takeover == 'denied') {
            return <button className="btn btn-primary" onClick={this.onTakeover}>Takeover</button>;
        } else if(takeover == 'pending') {
            return <button id="http-423-countdown" className="btn btn-primary" disabled>{`Takeover forcefully (${appConfig.takeoverTimeout/1000}s remaining).`}</button>;
        } else if(takeover == 'timeout') {
            return <button className="btn btn-primary" onClick={this.onTakeoverForcefully}>Takeover forcefully</button>;
        } else {
            return null;
        }
    }

    renderTakeover() {
        const {query} = this.props.location;
        const {takeover, takeoverBy} = this.state;
        let Preview = withRouter(({history}) => {
            let path = query.editPage == EditPage.DESIGN ? `/preview/${query.courseId}` : `/pattern/preview/${query.collectId}`;
            return <button className="btn btn-default" onClick={() => history.replace(path)}>Preview</button>;
        });
        let msg = query.message;
        if(takeoverBy)
            msg = `The resource is currently locked by ${takeoverBy}.`;
        return [
            <p key="p1" className="message">{msg}</p>,
            <p key="p2" className="link">
                {this.renderTakeoverRequest()}
                {' to regain the edit control, '}
                <Preview/>{' the readonly content'}
            </p>,
            <p key="p3" className="link">
                 {'or go back to '}<a href="#" onClick={this.redirectSpecificHome}>{query.home.name}</a>.
            </p>
        ];
    }

    renderReacquireLock() {
        const {query} = this.props.location;
        let Reacquire = withRouter(({history}) => {
            let path = query.editPage == EditPage.DESIGN ? `/edit/${query.courseId}` : `/pattern/edit/${query.collectId}`;
            return <button className="btn btn-primary" onClick={() => history.replace(path)}>Reacquire</button>;
        });
        return [
            <p key="p1" className="message">
                You are blocked from editing due to lock timeout.
                Please reacquire a lock before editing.
            </p>,
            <p key="p2" className="link">
                <Reacquire/>
                {' a lock or'} go back to <a href="#" onClick={this.redirectSpecificHome}>{query.home.name}</a>.
            </p>
        ];
    }

    renderTakenover() {
        const {query} = this.props.location;
        return [
            <p key="p1" className="message">{query.message}</p>,
            <p key="p2" className="link">
                Go back to <a href="#" onClick={this.redirectSpecificHome}>{query.home.name}</a>.
            </p>
        ];
    }

    render() {
        const {query} = this.props.location;
        return (
            <div className="lds">
                <div className="http-error">
                    <p className="code">423</p>
                    <p className="title">Locked</p>
                    {
                        query ?
                            query.code == 1 ?
                            this.renderTakeover() :
                                query.code == 2 ?
                                this.renderReacquireLock() :
                                this.renderTakenover()
                        : this.renderGeneral()
                    }
                </div>
            </div>
        );
    }
}
