import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Config} from 'js/util';
import {StateName, EditTabType} from '../types';
import {newDesign, changeEditTab} from '../actions';

class Create extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {isNewDesign, courseId} = nextProps.app;
        if(prevState.loading && prevState.newDesignStarted && isNewDesign) {
            return {
                loading: false,
                designCreated: true,
                courseId,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.renderLoading = this.renderLoading.bind(this);
        this.state = {
            loading: true,
            newDesignStarted: false,
            designCreated: false,
            courseId: null,
        }
    }

    componentDidMount() {
        const {newDesign} = this.props;
        newDesign();
        this.setState({newDesignStarted: true});
    }

    componentDidUpdate() {
        const {designCreated} = this.state;
        if(designCreated) {
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
            const {courseId} = this.state;
            let url = '/edit/'+courseId;
            let to = {
                pathname: url,
                state: {isNewDesign: true}
            };
            return <Redirect to={to}/>;
        }
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    newDesign: () => dispatch(newDesign()),
    changeEditTab: editTab => dispatch(changeEditTab(editTab)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Create);
