import classnames from 'classnames';
import React, {Component} from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import alertify from 'alertify.js';
import {Config} from 'js/util';
import DesignWizard from 'react/design/design_wizard';
import Dashboard from 'react/design/dashboard';
import {StateName as PatternStateName} from 'react/design/learning_unit/design_panel/types';
import appConfig from '../config';
import {StateName as AppStateName, EditTabType} from '../types';
import AppContext from '../context/app';
import EditContext from '../context/edit';
import {loadReadableDesign, changeEditTab, setLastDesignRead, setPartialUpdate, designContentUpdated} from '../actions';

const ref = {};

const editContext = {
    isReadOnly: () => ref.readOnly,
    getAlertify: () => ({confirm: ()=>{}}),
};

class Preview extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {pathname} = nextProps.location;
        const {isDesignLoaded} = nextProps.app;
        if(prevState.pathname != pathname) {
            return {
                loading: true,
                pathChanged: true,
                pathname,
                loadDesignStarted: false,
            };
        }
        if(prevState.loading && prevState.loadDesignStarted && isDesignLoaded) {
            return {
                loading: false,
                designLoaded: true,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.initEcho = this.initEcho.bind(this);
        this.relEcho = this.relEcho.bind(this);
        this.initTimer = this.initTimer.bind(this);
        this.clearTimer = this.clearTimer.bind(this);
        this.onTabClick = this.onTabClick.bind(this);
        this.onScrollTopClick = this.onScrollTopClick.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderScollTop = this.renderScollTop.bind(this);
        this.renderControl = this.renderControl.bind(this);
        this.renderTabs = this.renderTabs.bind(this);
        this.renderTabContent = this.renderTabContent.bind(this);
        this.state = {
            pathname: props.location.pathname,
            loading: true,
            pathChanged: false,
            loadDesignStarted: false,
            designLoaded: false,
        };
        this.interval = null;
    }

    componentDidMount() {
        const courseId = this.props.match.params.courseId;
        const {loadDesign} = this.props;
        loadDesign(courseId);
        this.setState({loadDesignStarted: true});

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
    }

    componentDidUpdate() {
        const {pathChanged, designLoaded} = this.state;
        if(pathChanged) {
            const courseId = this.props.match.params.courseId;
            const {loadDesign} = this.props;
            $('.alertify-logs').remove();
            this.clearTimer();
            this.relEcho();
            loadDesign(courseId);
            this.setState({
                pathChanged: false,
                loadDesignStarted: true,
            });
        }

        if(designLoaded) {
            const {setLastRead} = this.props;
            setLastRead();
            this.initEcho();
            this.initTimer();
            ref.readOnly = this.props.app.readDesignOnly;
            this.setState({designLoaded: false});
        }
    }

    componentWillUnmount() {
        $(document).off('keydown');
        $(window).unbind('scroll');
        $('.alertify-logs').remove();
        this.clearTimer();
        this.relEcho();
    }

    initEcho() {
        const courseId = this.props.match.params.courseId;
        window.echo
              .private(`preview.design.${courseId}`)
              .listen('DesignContentUpdated', e => {
                  const {designContentUpdated} = this.props;
                  designContentUpdated(e.design);
              });
    }

    relEcho() {
        const courseId = this.props.match.params.courseId;
        if(window.echo) window.echo.leave(`preview.design.${courseId}`);
    }

    initTimer() {
        const courseId = this.props.match.params.courseId;
        const {setPartialUpdate, loadDesign} = this.props;

        this.interval = setInterval(() => {
            const {timestamp} = this.props.app;
            if((Date.now() - timestamp) > appConfig.readOnlyTimeout) {
                this.clearTimer();
                this.relEcho();
                let msg = 'Auto update is disabled due to inactivity.';
                msg += '&nbsp;&nbsp;&nbsp;';
                msg += '<button class="btn btn-sm btn-default" href="#" id="alertify-logs-readonly-resume">Resume auto update</button>';
                alertify.theme('bootstrap')
                    .closeLogOnClick(false)
                    .delay(0)
                    .maxLogItems(1)
                    .log(msg);
                $('#alertify-logs-readonly-resume').bind('click', e => {
                    e.preventDefault();
                    $('.alertify-logs').remove();
                    loadDesign(courseId);
                    this.setState({
                        loading: true,
                        loadDesignStarted: true,
                    });
                });
                this.setState({loadDesignStarted: false});
            }
        }, 1000);
    }

    clearTimer() {
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
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

    renderScollTop() {
        return <span className="scroll-to-top" style={{display: 'none'}} onClick={e => this.onScrollTopClick(e)} title="Scroll to top"></span>;
    }

    renderControl() {
        const courseId = this.props.match.params.courseId;
        const isEditable = this.props.app.isDesignEditable;
        return (
            <div className="tabbed-control btn-toolbar pull-right">
                {
                    isEditable ?
                    <div className="btn-group">
                        <Link to={`/edit/${courseId}`}>
                            <button type="button" className="btn btn-primary btn-xs">
                                <i className="fa fa-pencil"></i>
                                {' Edit'}
                            </button>
                        </Link>
                    </div> :
                    null
                }
                <div className="btn-group">
                    <Link to={`/printable/${courseId}`} target="_blank">
                        <button ref={btn => this.printBtn = btn} type="button" className="btn btn-default btn-xs">
                            <i className="fa fa-print"></i>
                            {' Print'}
                        </button>
                    </Link>
                </div>
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
            <div className="tabbed-content">
                {(editTab == EditTabType.DASHBOARD) ?
                <Dashboard/> :
                <DesignWizard/>}
                <div className="readonly">
                    <label>
                        <i className="fa fa-eye"></i>
                        {' Read Only'}
                    </label>
                </div>
            </div>
        );
    }

    render() {
        const {loading} = this.state;
        if(loading) {
            return this.renderLoading();
        } else {
            return (
                <EditContext.Provider value={editContext}>
                    <div>
                        {this.renderTabs()}
                        {this.renderTabContent()}
                        {this.renderScollTop()}
                    </div>
                </EditContext.Provider>
            );
        }
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, AppStateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    loadDesign: courseId => dispatch(loadReadableDesign(courseId, true)),
    handleTabClick: editTab => dispatch(changeEditTab(editTab)),
    setLastRead: () => dispatch(setLastDesignRead()),
    setPartialUpdate: update => dispatch(setPartialUpdate(update)),
    designContentUpdated: content => dispatch(designContentUpdated(content)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Preview);
