import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {getPatternClassName} from '../util';
import {PatternType} from '../types';
import {panzoomScale} from './droppable_workspace';

export default class DragPreview extends Component {

    static get blockWidth() {return 120}
    static get blockHeight() {return 80}
    static get itemWidth() {return 28}
    static get itemHeight() {return 28}

    static getDerivedStateFromProps(nextProps, prevState) {
        const {item, scale} = nextProps;
        const {pattType} = item.seed.model;

        let {blockWidth, blockHeight, itemWidth, itemHeight} = DragPreview;

        if(pattType == PatternType.ACTIVITY) {
            return {
                transform: 'scale('+scale+') translate('+((blockWidth-itemWidth)/(-2*scale))+'px, '+((blockHeight-itemHeight)/(-2*scale))+'px)',
            };
        } else {
            return {
                transform: 'scale('+scale+')',
            };
        }
    }

    constructor(props, context) {
        super(props, context);
        this.state = {
            transform: null,
        }
    }

    componentDidMount() {
        let $title = $(ReactDOM.findDOMNode(this.title));
        $title.resizeText({maxfont: 12});
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    };

    render() {
        const {transform} = this.state;
        const {seed} = this.props.item;
        const className = classnames(getPatternClassName(seed), {'node-preview': true});
        const style = transform ? {transform, WebkitTransform: transform} : null;
        const {fullname} = seed.model;
        return (
            <div className={className} style={style}>
                <div ref={title => this.title = title} className="title">
                    {fullname}
                </div>
            </div>
        );
    }
}
