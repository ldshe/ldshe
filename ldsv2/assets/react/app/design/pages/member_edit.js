import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {Panel} from 'react/design/group/panel/types';
import {reset as resetPanel, pushPanels} from 'react/design/group/panel/actions';
import {GroupPanel} from 'react/design/group';
import appConfig from '../config';
import {StateName} from '../types';

class Edit extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {pathname} = nextProps.location;
        if(prevState.pathname != pathname) {
            return {
                pathChanged: true,
                pathname,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.renderPanel = this.renderPanel.bind(this);
        this.state = {
            pathname: props.location.pathname,
            pathChanged: false,
        };
    }

    componentDidMount() {
        const groupId = this.props.match.params.groupId;
        this.renderPanel(groupId);
    }

    componentDidUpdate() {
        const {pathChanged} = this.state;
        if(pathChanged) {
            const groupId = this.props.match.params.groupId;
            const {resetPanel} = this.props;
            resetPanel();
            this.renderPanel(groupId);
            this.setState({pathChanged: false});
            return;
        }
    }

    renderPanel(groupId) {
        const {resetPanel, pushPanels} = this.props;
        const locState = this.props.location.state;
        let subTitle = locState ? `(${locState.subTitle})` : null;
        pushPanels([
            {panel: Panel.GROUP_MANAGEMENT, opts: {groupId, url: `/group/edit/${groupId}`}},
            {panel: Panel.MEMBERS_MANAGEMENT, opts: {groupId, subTitle}},
        ]);
    }

    render() {
        return <GroupPanel/>;
    }
}

const mapDispatchToProps = dispatch => ({
    resetPanel: () => dispatch(resetPanel()),
    pushPanels: (...args) => dispatch(pushPanels(...args)),
});

export default connect(
    null,
    mapDispatchToProps,
)(Edit);
