import classnames from 'classnames';
import React, {Component} from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import alertify from 'alertify.js';
import {Config} from 'js/util';
import Pattern from 'react/design/pattern';
import appConfig from '../config';
import {StateName} from '../types';
import AppContext from '../context/app';
import EditContext from '../context/edit';
import {lockCollectionResource, loadReadablePatternCollection, keepCollectionAlive} from '../actions';

const ref = {};

const editContext = {
    isReadOnly: () => ref.readOnly,
    getAlertify: () => ref.getAlertify(),
};

class Edit extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {pathname, state} = nextProps.location;
        const isNewPattern = state && state.isNewPattern;
        const {isPatternLocked, isPatternLoaded, isSaving, isSaveSucc} = nextProps.app;
        if(prevState.pathname != pathname) {
            return {
                loading: true,
                pathChanged: true,
                pathname,
                lockPatternStarted: false,
                loadPatternStarted: false,
            };
        }
        if(prevState.loading &&
            prevState.lockPatternStarted && isPatternLocked &&
            prevState.loadPatternStarted && (isNewPattern || isPatternLoaded)) {
            return {
                loading: false,
                patternLoadedAndLocked: true,
            };
        }
        if(isSaving && !prevState.showSav) {
            return {
                showSav: true,
                showSucc: false,
                showSuccTimeouted: false,
                clearShowSuccTimeout: true,
            };
        }
        if(isSaveSucc && !prevState.showSucc && !prevState.showSuccTimeouted) {
            return {
                showSav: false,
                showSucc: true,
                setShowSuccTimeout: true,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.setKeepAliveTimeout = this.setKeepAliveTimeout.bind(this);
        this.clearKeepAliveTimeout = this.clearKeepAliveTimeout.bind(this);
        this.setShowSuccTimeout = this.setShowSuccTimeout.bind(this);
        this.clearShowSuccTimeout = this.clearShowSuccTimeout.bind(this);
        this.initEcho = this.initEcho.bind(this);
        this.relEcho = this.relEcho.bind(this);
        this.onScrollTopClick = this.onScrollTopClick.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderAutoSaving = this.renderAutoSaving.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.renderScollTop = this.renderScollTop.bind(this);
        this.showSuccTimeout = null;
        this.state = {
            pathname: props.location.pathname,
            loading: true,
            showSav: false,
            showSucc: false,
            showSuccTimeouted: true,
            pathChanged: false,
            lockPatternStarted: false,
            loadPatternStarted: false,
            patternLoadedAndLocked: false,
            setShowSuccTimeout: false,
            clearShowSuccTimeout: false,
        };
        this.showSuccTimeout = null;
        this.warnTimeoutPopped = false;
        this.keepalive = null;
        this.userMap = null;
        this.join = null;
    }

    componentDidMount() {
        const locState = this.props.location.state;
        const collectId = this.props.match.params.collectId;
        const {lockPattern, loadPattern} = this.props;
        if((locState && locState.isNewPattern)) {
            lockPattern(collectId);
            this.setState({
                lockPatternStarted: true,
                loadPatternStarted: true,
            });
        } else {
            if(locState && locState.isTakeover) {
                loadPattern(collectId);
                this.setState({
                    lockPatternStarted: true,
                    loadPatternStarted: true,
                });
            } else {
                lockPattern(collectId);
                this.setState({lockPatternStarted: true});
            }
        }

        $(window).bind('scroll', () => {
            if($(window).scrollTop() > $(window).height() * 0.5)
                $('.scroll-to-top').fadeIn(300);
            else
                $('.scroll-to-top').fadeOut(300);
        });

        $(window).resize();
    }

    componentDidUpdate() {
        const {lockPatternStarted, loadPatternStarted, pathChanged, patternLoadedAndLocked, setShowSuccTimeout, clearShowSuccTimeout} = this.state;
        const {isPatternLocked} = this.props.app;

        if(lockPatternStarted && isPatternLocked && !loadPatternStarted) {
            const {collectId} = this.props.match.params;
            const {loadPattern} = this.props;
            loadPattern(collectId);
            this.setState({loadPatternStarted: true});
            return;
        }

        if(pathChanged) {
            this.clearKeepAliveTimeout();
            this.clearShowSuccTimeout();
            this.relEcho();
            this.warnTimeoutPopped = false;
            $('.alertify').remove();
            $('.alertify-logs').remove();
            const {collectId} = this.props.match.params;
            const {lockPattern} = this.props;
            lockPattern(collectId);
            this.setState({
                pathChanged: false,
                lockPatternStarted: true,
            });
            return;
        }

        if(patternLoadedAndLocked) {
            this.setKeepAliveTimeout();
            this.initEcho();
            const {readPatternOnly} = this.props.app;
            ref.readOnly = readPatternOnly;
            this.setState({patternLoadedAndLocked: false});
        }

        if(setShowSuccTimeout) {
            this.setShowSuccTimeout();
            this.setState({setShowSuccTimeout: false});
        }

        if(clearShowSuccTimeout) {
            this.clearShowSuccTimeout();
            this.setState({clearShowSuccTimeout: false});
        }

        if(lockPatternStarted && isPatternLocked && !this.warnTimeoutPopped) {
            const {patternMutexLastActiveOffset} = this.props.app;
            let lastActiveOffset = patternMutexLastActiveOffset * 1000;
            if(lastActiveOffset >= appConfig.editTimeout - appConfig.editRemainTime) {
                this.warnTimeoutPopped = true;
                $('.alertify-logs').remove();
                let msg = 'Your edit control will be released very soon.';
                msg += '&nbsp;&nbsp;&nbsp;';
                msg += '<button class="btn btn-sm btn-default" href="#" id="alertify-logs-edit-extend">Extend release time</button>';
                alertify
                    .theme('bootstrap')
                    .closeLogOnClick(false)
                    .delay(0)
                    .maxLogItems(1)
                    .log(msg);
                $('#alertify-logs-edit-extend').bind('click', e => {
                    e.preventDefault();
                    this.warnTimeoutPopped = false;
                    $('.alertify-logs').remove();
                    const {patternMutex, collectId} = this.props.app;
                    const {keepAlive} = this.props;
                    keepAlive(patternMutex, collectId, true);
                });
            }
        }
    }

    componentWillUnmount() {
        this.clearKeepAliveTimeout();
        this.clearShowSuccTimeout();
        this.warnTimeoutPopped = false;
        this.relEcho();
        $('.alertify').remove();
        $('.alertify-logs').remove();
        $(window).unbind('scroll');
        $(window).resize();
    }

    setKeepAliveTimeout() {
        this.clearKeepAliveTimeout();
        this.keepalive = setTimeout(() => {
            const {patternMutex, collectId} = this.props.app;
            const {keepAlive} = this.props;
            keepAlive(patternMutex, collectId);
            this.setKeepAliveTimeout();
        }, appConfig.heartbeat);
    }

    clearKeepAliveTimeout() {
        if(this.keepalive) {
            clearTimeout(this.keepalive);
            this.keepalive = null;
        }
    }

    setShowSuccTimeout() {
        this.clearShowSuccTimeout();
        this.showSuccTimeout = setTimeout(() => this.setState({
            showSucc: false,
            showSuccTimeouted: true,
        }), 3000);
    }

    clearShowSuccTimeout() {
        if(this.showSuccTimeout) {
            clearTimeout(this.showSuccTimeout);
            this.showSuccTimeout = null;
        }
    }

    initEcho() {
        const {collectId, user} = this.props.app;
        this.join = window.echo.join(`edit.collection.${collectId}`);
        this.join.here(us => {
                this.userMap = {};
                us.forEach(u => this.userMap[u.id] = u.name);
                this.join.whisper('takenOver', {
                    fromId: user.id,
                    fromName: this.userMap[user.id],
                });
            })
            .joining(u => this.userMap[u.id] = u.name)
            .leaving(u => delete this.userMap[u.id])
            .listenForWhisper('takeoverRequest', e => {
                let reqId = e.fromId;
                let reqName = e.fromName;
                const alertify = ref.getAlertify();
                alertify.confirm({
                    okLabel: 'ACCEPT',
                    cancelLabel: 'DENY',
                    iconClass: 'fa-info-circle info',
                    confirmAction: () => {
                        this.join.whisper('takeoverAccepted', {
                            toId: reqId,
                            fromId: user.id,
                            fromName: this.userMap[user.id],
                        });
                        this.props.history.push(`/pattern/preview/${collectId}`);
                    },
                    cancelAction: () => {
                        this.join.whisper('takeoverDenied', {
                            toId: reqId,
                            fromId: user.id,
                            fromName: this.userMap[user.id],
                        });
                    },
                    title: 'TAKEOVER REQUEST',
                    subTitle: `${reqName} would like to takeover your edit control.`,
                });
            })
            .listenForWhisper('takenOver', e => {
                this.clearKeepAliveTimeout();
                $('.alertify').remove();
                this.props.history.push(`/pattern/preview/${collectId}`);
                if(e.fromId == user.id) {
                    alertify.theme('bootstrap')
                        .okBtn('Got it!')
                        .alert(`You have opened an active view with another tab or window already.`);
                } else {
                    alertify.theme('bootstrap')
                        .okBtn('Got it!')
                        .alert(`${e.fromName} has taken over your edit control.`);
                }
            });
    }

    relEcho() {
        const {collectId} = this.props.app;
        if(window.echo) window.echo.leave(`edit.collection.${collectId}`);
    }

    onScrollTopClick(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: 0}, 300);
    }

    renderLoading() {
        return (
            <div>
                <div className="loading">
                    <i className="fa fa-spinner fa-spin fa-3x fa-fw"></i>
                </div>
            </div>
        );
    }

    renderAutoSaving() {
        const {showSav, showSucc} = this.state;
        if(showSav) {
            return (
                <div className="autosave">
                    <label>
                        <i className="fa fa-refresh fa-spin fa-fw"></i>
                        {' Saving...'}
                    </label>
                </div>
            );
        }
        if(showSucc) {
            return (
                <div className="autosave">
                    <label>
                        <i className="fa fa-check-circle"></i>
                        {' Autosaved'}
                    </label>
                </div>
            );
        }
        return null;
    }

    renderContent() {
        return (
            <div className="pc">
                <AppContext.Consumer>{
                    appCtx => (
                        <EditContext.Consumer>
                            {editCtx => {
                                let ctx = Object.assign({}, appCtx, editCtx);
                                return <Pattern {...ctx}/>;
                            }}
                        </EditContext.Consumer>
                    )
                }</AppContext.Consumer>
            </div>
        );
    }

    renderScollTop() {
        return <span className="scroll-to-top" style={{display: 'none'}} onClick={e => this.onScrollTopClick(e)} title="Scroll to top"></span>;
    }

    render() {
        const {loading} = this.state;
        if(loading) {
            return this.renderLoading();
        } else {
            return (
                <AppContext.Consumer>{
                    ({getAlertify}) => {
                        ref.getAlertify = getAlertify;
                        return (
                            <EditContext.Provider value={editContext}>
                                <div>
                                    {this.renderAutoSaving()}
                                    {this.renderContent()}
                                    {this.renderScollTop()}
                                </div>
                            </EditContext.Provider>
                        )
                    }
                }</AppContext.Consumer>
            );
        }
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    lockPattern: collectId => dispatch(lockCollectionResource(collectId)),
    loadPattern: collectId => dispatch(loadReadablePatternCollection(collectId)),
    keepAlive: (mutexId, collectId, resetLastActive) => dispatch(keepCollectionAlive(mutexId, collectId, resetLastActive)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Edit);
