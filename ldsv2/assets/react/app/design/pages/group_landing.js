import React, {Component} from 'react';
import {GroupList} from 'react/design/group';

export default class GroupLanding extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        document.title = 'Learning Design Studio HE';
    }

    render() {
        return <GroupList/>;
    }
}
