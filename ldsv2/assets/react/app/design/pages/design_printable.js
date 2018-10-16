import React, {Component} from 'react';
import DesignPrintable from 'react/design/design_printable';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {StateName} from '../types';
import {loadReadableDesign} from '../actions';

class Printable extends Component {

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
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.renderLoading = this.renderLoading.bind(this);
        this.state = {
            pathname: props.location.pathname,
            loading: true,
            pathChanged: false,
            loadDesignStarted: false,
        };
    }

    componentDidMount() {
        const courseId = this.props.match.params.courseId;
        const {loadDesign} = this.props;
        loadDesign(courseId);
        this.setState({loadDesignStarted: true});
    }

    componentDidUpdate() {
        const {pathChanged, designLoaded} = this.state;
        if(pathChanged) {
            const courseId = this.props.match.params.courseId;
            const {loadDesign} = this.props;
            loadDesign(courseId);
            this.setState({
                pathChanged: false,
                loadDesignStarted: true,
            });
        }
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

    render() {
        const {loading} = this.state;
        if(loading) {
            return this.renderLoading();
        } else {
            return (
                <div>
                    <DesignPrintable/>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    loadDesign: courseId => dispatch(loadReadableDesign(courseId, true)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Printable);
