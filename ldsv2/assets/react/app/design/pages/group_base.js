import React, {Component} from 'react';
import {connect} from 'react-redux';
import {reset as resetGroupList} from 'react/design/group/group_list/actions';

class Base extends Component {
    constructor(props, context) {
        super(props, context);
    }

    componentWillUnmount() {
        const {resetGroupList} = this.props;
        resetGroupList();
    }

    render() {
        const {location, match} = this.props;
        const Component = this.props.component;
        let props = {
            location,
            match,
        }
        return <Component {...props}/>;
    }
}

const mapDispatchToProps = dispatch => ({
    resetGroupList: () => dispatch(resetGroupList()),
});

export default connect(
    null,
    mapDispatchToProps,
)(Base);
