import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Config} from 'js/util';
import {StateName, EditTabType} from '../types';
import {takeoverDesignResource, changeEditTab} from '../actions';

class Takeover extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {isDesignLocked} = nextProps.app;
        if(prevState.loading && prevState.takeoverStarted && isDesignLocked) {
            return {
                loading: false,
                designTakenover: true,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.renderLoading = this.renderLoading.bind(this);
        this.state = {
            loading: true,
            takeoverStarted: false,
            designTakenover: false,
        }
    }

    componentDidMount() {
        const courseId = this.props.match.params.courseId;
        const {takeoverDesign} = this.props;
        this.setState({takeoverStarted: true});
        takeoverDesign(courseId);
    }

    componentDidUpdate() {
        const {designTakenover} = this.state;
        if(designTakenover) {
            const {changeEditTab} = this.props;
            changeEditTab(EditTabType.DESIGN);
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
            const courseId = this.props.match.params.courseId;
            let url = '/edit/'+courseId;
            let to = {
                pathname: url,
                state: {isTakeover: true}
            };
            return <Redirect to={to}/>;
        }
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    takeoverDesign: id => dispatch(takeoverDesignResource(id)),
    changeEditTab: editTab => dispatch(changeEditTab(editTab)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Takeover);
