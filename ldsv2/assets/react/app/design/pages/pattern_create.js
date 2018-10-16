import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Config} from 'js/util';
import {StateName, EditTabType} from '../types';
import {newPatternCollection} from '../actions';

class Create extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {isNewPattern, collectId} = nextProps.app;
        if(prevState.loading && prevState.newPatternStarted && isNewPattern) {
            return {
                loading: false,
                patternCreated: true,
                collectId,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.renderLoading = this.renderLoading.bind(this);
        this.state = {
            loading: true,
            newPatternStarted: false,
            patternCreated: false,
            collectId: null,
        }
    }

    componentDidMount() {
        const {newPattern} = this.props;
        newPattern();
        this.setState({newPatternStarted: true});
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
            const {collectId} = this.state;
            let url = '/pattern/edit/'+collectId;
            let to = {
                pathname: url,
                state: {isNewPattern: true}
            };
            return <Redirect to={to}/>;
        }
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    newPattern: () => dispatch(newPatternCollection()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Create);
