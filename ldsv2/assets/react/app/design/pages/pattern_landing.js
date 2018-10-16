import React, {Component} from 'react';
import {ListType} from 'react/design/pattern_list/types';
import PatternList from 'react/design/pattern_list';

export default class PatternLanding extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.listType != nextProps.initListType) {
            return {listType: nextProps.initListType || ListType.MY};
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.state = {
            listType: props.initListType || ListType.MY,
        }
    }

    componentDidMount() {
        document.title = 'Learning Design Studio HE';
    }

    render() {
        const {listType} = this.state;
        let props = {
            initListType: listType,
        };
        return (
            <div>
                <PatternList {...props}/>
            </div>
        );
    }
}
