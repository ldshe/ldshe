import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Config} from 'js/util';
import {StateName} from '../types';
import {takeoverCollectionResource} from '../actions';

class Takeover extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {isPatternLocked} = nextProps.app;
        if(prevState.loading && prevState.takeoverStarted && isPatternLocked) {
            return {
                loading: false,
                patternTakenover: true,
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
            patternTakenover: false,
        }
    }

    componentDidMount() {
        const collectId = this.props.match.params.collectId;
        const {takeoverPattern} = this.props;
        this.setState({takeoverStarted: true});
        takeoverPattern(collectId);
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
            const collectId = this.props.match.params.collectId;
            let url = '/pattern/edit/'+collectId;
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
    takeoverPattern: id => dispatch(takeoverCollectionResource(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Takeover);
