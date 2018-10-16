import React, {Component} from 'react';
import {DragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import {setDragId, endDragging} from './node';

const dragSource = {
    beginDrag(props) {
        const {root, pattId, startDragging} = props;
        startDragging(pattId);
        return {root, pattId};
    },

    endDrag(props, monitor) {
        const {pattId, endDragging} = props;
        endDragging();
    },
};

class Draggable extends Component {
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        this.props.connectDragPreview(getEmptyImage(), {captureDraggingState: true});
    }

    componentDidUpdate() {
        this.props.connectDragPreview(getEmptyImage(), {captureDraggingState: true});
    }

    render() {
        const {children, connectDragSource} = this.props;
        const dropEffect = 'move';
        return connectDragSource(children);
    }
}

export const createDraggable = (dragType) => DragSource(dragType, dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
}))(Draggable);
