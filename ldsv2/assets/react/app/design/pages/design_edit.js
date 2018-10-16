import classnames from 'classnames';
import React, {Component} from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import alertify from 'alertify.js';
import {Config} from 'js/util';
import DesignWizard from 'react/design/design_wizard';
import Dashboard from 'react/design/dashboard';
import appConfig from '../config';
import {StateName, EditTabType} from '../types';
import AppContext from '../context/app';
import EditContext from '../context/edit';
import {lockDesignResource, loadReadableDesign, keepDesignAlive, changeEditTab} from '../actions';

const ref = {};

const editContext = {
    isReadOnly: () => ref.readOnly,
    getAlertify: () => ref.getAlertify(),
};

class Edit extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {pathname, state} = nextProps.location;
        const isNewDesign = state && state.isNewDesign;
        const {isDesignLocked, isDesignLoaded, isSaving, isSaveSucc} = nextProps.app;
        if(prevState.pathname != pathname) {
            return {
                loading: true,
                pathChanged: true,
                pathname,
                lockDesignStarted: false,
                loadDesignStarted: false,
            };
        }
        if(prevState.loading &&
            prevState.lockDesignStarted && isDesignLocked &&
            prevState.loadDesignStarted && (isNewDesign || isDesignLoaded)) {
            return {
                loading: false,
                designLoadedAndLocked: true,
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
        this.onTabClick = this.onTabClick.bind(this);
        this.onScrollTopClick = this.onScrollTopClick.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderAutoSaving = this.renderAutoSaving.bind(this);
        this.renderScollTop = this.renderScollTop.bind(this);
        this.renderControl = this.renderControl.bind(this);
        this.renderTabs = this.renderTabs.bind(this);
        this.renderTabContent = this.renderTabContent.bind(this);
        this.state = {
            pathname: props.location.pathname,
            loading: true,
            showSav: false,
            showSucc: false,
            showSuccTimeouted: true,
            pathChanged: false,
            lockDesignStarted: false,
            loadDesignStarted: false,
            designLoadedAndLocked: false,
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
        const courseId = this.props.match.params.courseId;
        const {lockDesign, loadDesign} = this.props;
        if((locState && locState.isNewDesign)) {
            lockDesign(courseId);
            this.setState({
                lockDesignStarted: true,
                loadDesignStarted: true,
            });
        } else {
            if(locState && locState.isTakeover) {
                loadDesign(courseId);
                this.setState({
                    lockDesignStarted: true,
                    loadDesignStarted: true,
                });
            } else {
                lockDesign(courseId);
                this.setState({lockDesignStarted: true});
            }
        }

        $(document).on('keydown', e => {
            if(e.ctrlKey && e.which == 80) {
                e.preventDefault();
                this.printBtn.click();
            }
        });

        $(window).bind('scroll', () => {
            if($(window).scrollTop() > $(window).height() * 0.5)
                $('.scroll-to-top').fadeIn(300);
            else
                $('.scroll-to-top').fadeOut(300);
        });

        $(window).resize();
    }

    componentDidUpdate() {
        const {lockDesignStarted, loadDesignStarted, pathChanged, designLoadedAndLocked, setShowSuccTimeout, clearShowSuccTimeout} = this.state;
        const {isDesignLocked} = this.props.app;

        if(lockDesignStarted && isDesignLocked && !loadDesignStarted) {
            const {courseId} = this.props.match.params;
            const {loadDesign} = this.props;
            loadDesign(courseId);
            this.setState({loadDesignStarted: true});
            return;
        }

        if(pathChanged) {
            this.clearKeepAliveTimeout();
            this.clearShowSuccTimeout();
            this.relEcho();
            this.warnTimeoutPopped = false;
            $('.alertify').remove();
            $('.alertify-logs').remove();
            const {courseId} = this.props.match.params;
            const {lockDesign} = this.props;
            lockDesign(courseId);
            this.setState({
                pathChanged: false,
                lockDesignStarted: true,
            });
            return;
        }

        if(designLoadedAndLocked) {
            this.setKeepAliveTimeout();
            this.initEcho();
            const {readDesignOnly} = this.props.app;
            ref.readOnly = readDesignOnly;
            this.setState({designLoadedAndLocked: false});
        }

        if(setShowSuccTimeout) {
            this.setShowSuccTimeout();
            this.setState({setShowSuccTimeout: false});
        }

        if(clearShowSuccTimeout) {
            this.clearShowSuccTimeout();
            this.setState({clearShowSuccTimeout: false});
        }

        if(lockDesignStarted && isDesignLocked && !this.warnTimeoutPopped) {
            const {designMutexLastActiveOffset} = this.props.app;
            let lastActiveOffset = designMutexLastActiveOffset * 1000;
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
                    const {designMutex, courseId} = this.props.app;
                    const {keepAlive} = this.props;
                    keepAlive(designMutex, courseId, true);
                });
            }
        }
    }

    componentWillUnmount() {
        this.clearKeepAliveTimeout();
        this.clearShowSuccTimeout();
        this.relEcho();
        this.warnTimeoutPopped = false;
        $('.alertify').remove();
        $('.alertify-logs').remove();
        $(document).off('keydown');
        $(window).unbind('scroll');
        $(window).resize();
    }

    setKeepAliveTimeout() {
        this.clearKeepAliveTimeout();
        this.keepalive = setTimeout(() => {
            const {designMutex, courseId} = this.props.app;
            const {keepAlive} = this.props;
            keepAlive(designMutex, courseId);
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
        const {courseId, user} = this.props.app;
        this.join = window.echo.join(`edit.design.${courseId}`);
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
                        this.props.history.push(`/preview/${courseId}`);
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
                this.props.history.push(`/preview/${courseId}`);
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
        const {courseId} = this.props.app;
        if(window.echo) window.echo.leave(`edit.design.${courseId}`);
    }

    onTabClick(e, editTab) {
        e.preventDefault();
        const {handleTabClick} = this.props;
        handleTabClick(editTab);
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

    renderScollTop() {
        return <span className="scroll-to-top" style={{display: 'none'}} onClick={e => this.onScrollTopClick(e)} title="Scroll to top"></span>;
    }

    renderControl() {
        const courseId = this.props.match.params.courseId;
        return (
            <div className="tabbed-control pull-right">
                <Link to={`/printable/${courseId}`} target="_blank">
                    <button ref={btn => this.printBtn = btn} type="button" className="btn btn-default btn-xs">
                        <i className="fa fa-print"></i>
                        {' Print'}
                    </button>
                </Link>
            </div>
        );
    }

    renderTabs() {
        const {editTab} = this.props.app;
        let dashboardCls = classnames({'active': editTab == EditTabType.DASHBOARD});
        let designCls = classnames({'active': editTab == EditTabType.DESIGN});
        return (
            <div className="tabbed">
                {this.renderControl()}
                <ul>
                    <li className={dashboardCls} onClick={e => this.onTabClick(e, EditTabType.DASHBOARD)}>
                        <i className="fa fa-dashboard"></i>{' '}
                        <span>{` Designer's Dashboard`}</span>
                    </li>
                    <li className={designCls} onClick={e => this.onTabClick(e, EditTabType.DESIGN)}>
                        <i className="fa fa-pencil"></i>{' '}
                        <span>{' Learning Design'}</span>
                    </li>
                </ul>
            </div>
        );
    }

    renderTabContent() {
        const {editTab} = this.props.app;
        return (
            <div className="tabbed-content">{
                (editTab == EditTabType.DASHBOARD) ?
                <Dashboard/> :
                <DesignWizard/>
            }</div>
        );
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
                                    {this.renderTabs()}
                                    {this.renderTabContent()}
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
    lockDesign: courseId => dispatch(lockDesignResource(courseId)),
    loadDesign: courseId => dispatch(loadReadableDesign(courseId)),
    keepAlive: (mutexId, courseId, resetLastActive) => dispatch(keepDesignAlive(mutexId, courseId, resetLastActive)),
    handleTabClick: editTab => dispatch(changeEditTab(editTab)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Edit);
