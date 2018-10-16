import React, {Component} from 'react';
import {connect} from 'react-redux';
import alertify from 'alertify.js';
import Echo from 'laravel-echo';
import io from 'socket.io-client';
import {Config} from 'js/util';
import Alertify from 'react/components/alertify';
import {StateName} from '../types';
import {clearInfoLogs, clearSuccessLogs, clearErrorLogs} from '../actions/base';
import AppContext from '../context/app';

const ref = {};

export const context = {
    getAlertify: () => ref.alertify,
    getHistory: () => ref.history,
};

class Base extends Component {

    constructor(props, context) {
        super(props, context);
        ref.history = props.history;
        this.initEcho = this.initEcho.bind(this);
        this.relEcho = this.relEcho.bind(this);
        this.alertInfos = this.alertInfos.bind(this);
        this.alertSuccess = this.alertSuccess.bind(this);
        this.alertErrors = this.alertErrors.bind(this);
    }

    componentDidMount() {
        ref.alertify = this.alertify;
        this.initEcho();
    }

    componentDidUpdate() {
        this.alertInfos();
        this.alertErrors();
        this.alertSuccess();
    }

    componentWillUnmount() {
        this.relEcho();
    }

    initEcho() {
        window.io = io;
        window.echo = new Echo({
            broadcaster: 'socket.io',
        });
    }

    relEcho() {
        if(window.echo) {
            window.echo.disconnect();
            window.echo = null;
            window.io = null;
        }
    }

    alertInfos() {
        const {infos} = this.props.app;
        const {clearInfoLogs} = this.props;
        if(infos.length > 0) {
            infos.forEach(({message}) => alertify.theme('bootstrap').closeLogOnClick(true).delay(5000).maxLogItems(2).log(message));
            clearInfoLogs();
        }
    }

    alertSuccess() {
        const {success} = this.props.app;
        const {clearSuccessLogs} = this.props;
        if(success.length > 0) {
            success.forEach(({message}) => alertify.theme('bootstrap').closeLogOnClick(true).delay(5000).maxLogItems(2).success(message));
            clearSuccessLogs();
        }
    }

    alertErrors() {
        const {errors} = this.props.app;
        const {clearErrorLogs} = this.props;
        if(errors.length > 0) {
            errors.forEach(({message}) => alertify.theme('bootstrap').closeLogOnClick(true).delay(5000).maxLogItems(2).error(message));
            clearErrorLogs();
        }
    }

    render() {
        const {children} = this.props;
        return (
            <div className="lds">
                <AppContext.Provider value={context}>{children}</AppContext.Provider>
                <Alertify ref={alertify => this.alertify = alertify}/>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    clearInfoLogs: () => dispatch(clearInfoLogs()),
    clearSuccessLogs: () => dispatch(clearSuccessLogs()),
    clearErrorLogs: () => dispatch(clearErrorLogs()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Base);
