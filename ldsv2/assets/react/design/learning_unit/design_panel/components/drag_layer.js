import React, {Component} from 'react';
import {DragLayer} from 'react-dnd';
import _ from 'lodash';
import {PatternType} from '../types';
import DragPreview from './drag_preview';
import {panzoomScale} from './droppable_workspace';

class Layer extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.isDragging != nextProps.isDragging) {
            return {
                scale: panzoomScale(),
                isDragging: nextProps.isDragging,
            }
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.getStyles = this.getStyles.bind(this);
        this.state = {
            scale: 1,
            isDragging: props.isDragging,
        }
    }

    getStyles() {
        const {currentOffset, mouseOffset, item} = this.props;
        const {scale} = this.state;

        if (!currentOffset) {
            return {display: 'none'};
        } else {
            const {pattType} = item.seed.model;
            let {x, y} = currentOffset;
            let mX = mouseOffset.x;
            let mY = mouseOffset.y;
            let {blockWidth, blockHeight} = DragPreview;
            let scaledWidth = DragPreview.blockWidth*scale;
            let scaledHeight = DragPreview.blockHeight*scale;
            let offsetX = (blockWidth-scaledWidth)/2;
            let offsetY = (blockHeight-scaledHeight)/2;
            if(mX >= x+offsetX && mX <= x+blockWidth-offsetX)
                offsetX = 0;
            if(mY >= y+offsetY && mY <= y+blockHeight-offsetY)
                offsetY = 0;
            if(mX < DragPreview.blockWidth/2 + x)
                offsetX *= -1;
            if(mY < DragPreview.blockHeight/2 + y)
                offsetY *= -1;
            let transform;
            if(pattType == PatternType.ACTIVITY)
                transform = 'translate('+(x)+'px, '+(y)+'px)';
            else
                transform = 'translate('+(x+offsetX)+'px, '+(y+offsetY)+'px)';
            return {
                transform,
                WebkitTransform: transform,
                position: 'absolute',
            }
        }
    }

    render() {
        const {item, isDragging} = this.props;
        const {scale} = this.state;
        const style = this.getStyles();
        return (
            isDragging && item.seed ?
            <div className="canvas-layer">
                <div ref={container => this.container = container} className="canvas-layer" style={style}>
                    <DragPreview item={item} scale={scale}/>
                </div>
            </div> :
            null
        );
    }
}

export default DragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    mouseOffset: monitor.getClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
}))(Layer);
