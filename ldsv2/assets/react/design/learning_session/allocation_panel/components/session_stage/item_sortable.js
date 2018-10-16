import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import {DragSource, DropTarget} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';
import _ from 'lodash';
import {DragType} from '../../types';
import {setDragging} from '../layout';

const dragSource = {
    beginDrag(props) {
        const {root, pattId, sessId, stageType, pos} = props;
        setDragging(true);
        return {root, pattId, sessId, stageType, pos};
    },

    endDrag: $.support.touch ?
        (props, monitor) => {
            const {sessId, stageType} = props;
            const {reorderStageItem} = props;
            const item = monitor.getItem();
            reorderStageItem(sessId, stageType, props.pos, item.pos);
            setDragging(false);
        } :
        (props, monitor) => {
            setDragging(false);
        },
};

const dropTarget = {
    hover: (props, monitor, component) => {
        const item = monitor.getItem();

        if(monitor.getItemType() != DragType.MOVE_STAGE_ITEM) return;

        if(props.sessId != item.sessId || props.stageType != item.stageType) return;

        const {sessId, stageType} = props;
        const {reorderStageItem} = props;
        const dragPos = item.pos;
        const hoverPos = props.pos;

        if(dragPos === hoverPos) return;

        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();

        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if(dragPos < hoverPos && hoverClientY < hoverMiddleY) return;

        if(dragPos > hoverPos && hoverClientY > hoverMiddleY) return;

        if(!$.support.touch) reorderStageItem(sessId, stageType, dragPos, hoverPos);
        monitor.getItem().pos = hoverPos;
    },
};

class ItemSortable extends Component {
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
        const {children, connectDragSource, connectDropTarget, draggingItem} = this.props;
        const draggable = React.cloneElement(children, {connectDragSource, draggingItem});
        return connectDropTarget(
            <div>{draggable}</div>,
        );
    }
}

export const createItemSortable = dragType => _.flow(
    DragSource(dragType, dragSource, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        draggingItem: monitor.getItem(),
    })),
    DropTarget(dragType, dropTarget, connect => ({
        connectDropTarget: connect.dropTarget(),
    }))
)(ItemSortable);
