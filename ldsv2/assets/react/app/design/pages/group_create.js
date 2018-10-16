import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Config} from 'js/util';
import {StateName} from '../types';
import {newGroup} from '../actions';

class Create extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {isNewGroup, groupId} = nextProps.app;
        if(prevState.loading && prevState.newGroupStarted && isNewGroup) {
            return {
                loading: false,
                groupId,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.renderLoading = this.renderLoading.bind(this);
        this.state = {
            loading: true,
            newGroupStarted: false,
            groupId: null,
        }
    }

    componentDidMount() {
        const {data} = this.props.location.state;
        const {newGroup} = this.props;
        newGroup(data);
        this.setState({newGroupStarted: true});
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
            const {groupId} = this.state;
            let url = '/group/edit/'+groupId;
            let to = {
                pathname: url,
                state: {isNewGroup: true}
            };
            return <Redirect to={to}/>;
        }
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    newGroup: data => dispatch(newGroup(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Create);
