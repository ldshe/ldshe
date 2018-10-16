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
import {loadReadablePatternCollection, setLastCollectionRead, setPartialUpdate, collectionContentUpdated} from '../actions';

const ref = {};

const context = {
    isReadOnly: () => ref.readOnly,
    getAlertify: () => ({confirm: ()=>{}}),
};

class Preview extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {pathname} = nextProps.location;
        const {isPatternLoaded} = nextProps.app;
        if(prevState.pathname != pathname) {
            return {
                loading: true,
                pathChanged: true,
                pathname,
                loadPatternStarted: false,
            };
        }
        if(prevState.loading && prevState.loadPatternStarted && isPatternLoaded) {
            return {
                loading: false,
                patternLoaded: true,
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
        this.onScrollTopClick = this.onScrollTopClick.bind(this);
        this.renderControl = this.renderControl.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.renderScollTop = this.renderScollTop.bind(this);
        this.state = {
            pathname: props.location.pathname,
            loading: true,
            pathChanged: false,
            loadPatternStarted: false,
            patternLoaded: false,
        };
        this.interval = null;
    }

    componentDidMount() {
        const collectId = this.props.match.params.collectId;
        const {loadPattern} = this.props;
        loadPattern(collectId);
        this.setState({loadPatternStarted: true});

        $(window).bind('scroll', () => {
            if($(window).scrollTop() > $(window).height() * 0.5)
                $('.scroll-to-top').fadeIn(300);
            else
                $('.scroll-to-top').fadeOut(300);
        });
    }

    componentDidUpdate() {
        const {pathChanged, patternLoaded} = this.state;
        if(pathChanged) {
            const collectId = this.props.match.params.collectId;
            const {loadPattern} = this.props;
            $('.alertify-logs').remove();
            this.clearTimer();
            this.relEcho();
            loadPattern(collectId);
            this.setState({
                pathChanged: false,
                loadPatternStarted: true,
            });
        }

        if(patternLoaded) {
            const {setLastRead} = this.props;
            setLastRead();
            this.initEcho();
            this.initTimer();
            ref.readOnly = this.props.app.readPatternOnly;
            this.setState({patternLoaded: false});
        }
    }

    componentWillUnmount() {
        $(window).unbind('scroll');
        $('.alertify-logs').remove();
        this.clearTimer();
        this.relEcho();
    }

    initEcho() {
        const collectId = this.props.match.params.collectId;
        const {setPartialUpdate, collectionContentUpdated} = this.props;
        window.echo
              .private(`preview.collection.${collectId}`)
              .listen('CollectionContentUpdated', e => {
                  collectionContentUpdated(e.collection);
              });
    }

    relEcho() {
        const collectId = this.props.match.params.collectId;
        if(window.echo) window.echo.leave(`preview.collection.${collectId}`);
    }

    initTimer() {
        const collectId = this.props.match.params.collectId;
        const {setPartialUpdate, loadPattern} = this.props;

        this.interval = setInterval(() => {
            const {timestamp2} = this.props.app;
            if((Date.now() - timestamp2) > appConfig.readOnlyTimeout) {
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
                    loadPattern(collectId);
                    this.setState({
                        loading: true,
                        loadPatternStarted: true,
                    });
                });
                this.setState({loadPatternStarted: false});
            }
        }, 1000);
    }

    clearTimer() {
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    onScrollTopClick(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: 0}, 300);
    }

    renderControl() {
        const collectId = this.props.match.params.collectId;
        const isEditable = this.props.app.isPatternEditable;
        return (
            <div className="navbar-form navbar-right">
                <div className="btn-toolbar">
                {
                    isEditable ?
                    <div className="btn-group">
                        <Link to={`/pattern/edit/${collectId}`}>
                            <button type="button" className="btn btn-primary btn-xs">
                                <i className="fa fa-pencil"></i>
                                {' Edit'}
                            </button>
                        </Link>
                    </div> :
                    null
                }
                </div>
            </div>
        );
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

    renderContent() {
        return (
            <div className="pc">
                {this.renderControl()}
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
                <div className="readonly">
                    <label>
                        <i className="fa fa-eye"></i>
                        {' Read Only'}
                    </label>
                </div>
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
                <EditContext.Provider value={context}>
                    <div>
                        {this.renderContent()}
                        {this.renderScollTop()}
                    </div>
                </EditContext.Provider>
            );
        }
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    loadPattern: collectId => dispatch(loadReadablePatternCollection(collectId, true)),
    setLastRead: () => dispatch(setLastCollectionRead()),
    setPartialUpdate: partialUpdate => dispatch(setPartialUpdate(partialUpdate)),
    collectionContentUpdated: content => dispatch(collectionContentUpdated(content)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Preview);
