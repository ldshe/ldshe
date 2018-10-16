import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {Panel} from 'react/design/group/panel/types';
import {freshPanel} from 'react/design/group/panel/actions';
import {GroupPanel} from 'react/design/group';
import appConfig from '../config';
import {StateName} from '../types';
import {loadGroup} from '../actions';

class Preview extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {pathname} = nextProps.location;
        const {isGroupLoaded} = nextProps.app;
        if(prevState.pathname != pathname) {
            return {
                loading: true,
                pathChanged: true,
                pathname,
                loadGroupStarted: false,
            };
        }
        if(prevState.loading && prevState.loadGroupStarted && isGroupLoaded) {
            return {
                loading: false,
                groupLoaded: true,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderPanel = this.renderPanel.bind(this);
        this.state = {
            pathname: props.location.pathname,
            loading: true,
            pathChanged: false,
            loadGroupStarted: false,
            groupLoaded: false,
        };
    }

    componentDidMount() {
        const groupId = this.props.match.params.groupId;
        const {loadGroup} = this.props;
        loadGroup(groupId);
        this.setState({loadGroupStarted: true});
    }

    componentDidUpdate() {
        const {pathChanged, groupLoaded} = this.state;
        const groupId = this.props.match.params.groupId;
        if(pathChanged) {
            const {loadGroup} = this.props;
            loadGroup(groupId);
            this.setState({
                pathChanged: false,
                loadGroupStarted: true,
            });
            return;
        }
        if(groupLoaded) {
            this.renderPanel(groupId);
            this.setState({groupLoaded: false});
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

    renderPanel(groupId) {
        const {freshPanel} = this.props;
        freshPanel(Panel.MY_GROUP, {
            groupId,
            url: `/group/preview/${groupId}`,
        });
    }

    render() {
        const {loading} = this.state;
        return (
            <div>
                {loading ? this.renderLoading() : null}
                <div style={{visibility: loading ? 'hidden' : 'visible'}}>
                    <GroupPanel/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, StateName.DESIGN_APP),
});

const mapDispatchToProps = dispatch => ({
    loadGroup: id => dispatch(loadGroup(id)),
    freshPanel: (...args) => dispatch(freshPanel(...args)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Preview);
