import classnames from 'classnames';
import React, {Component} from 'react';
import {DropTarget} from 'react-dnd';
import {DragType} from '../../types';

const dropTarget = {
    drop(props, monitor, component) {
        const {sessId, stageType} = props;
        switch(monitor.getItemType()) {
            case DragType.UNALLOC_PATTERN: {
                const {pattId, pos} = monitor.getItem();
                const {addStageItem} = props;
                addStageItem(sessId, stageType, pattId, pos);
            }
            break;

            case DragType.MOVE_STAGE_ITEM: {
                const item = monitor.getItem();
                const {pattId, pos} = item;
                const {moveStageItem} = props;
                if(item.sessId != sessId || item.stageType != stageType) {
                    moveStageItem(item.sessId, item.stageType, sessId, stageType, item.pattId);
                }
            }
            break;
        }
    },
};

class StageDroppable extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {children, connectDropTarget, isOver, canDrop} = this.props;
        let className = classnames(children.props.className, {
            'drop-over': isOver && canDrop,
        });
        const stage = React.cloneElement(children, {className})
        return connectDropTarget(stage);
    }
}

export const createDroppable = DragType => DropTarget([
    DragType.UNALLOC_PATTERN,
    DragType.MOVE_STAGE_ITEM,
], dropTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
}))(StageDroppable);
