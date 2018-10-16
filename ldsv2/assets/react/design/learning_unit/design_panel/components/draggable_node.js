import React, {Component} from 'react';
import {DragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';

const source = {
    beginDrag(props) {
        const {seed} = props;
        return {seed};
    },
};

class DraggableNode extends Component {
    constructor(props, context) {
        super(props, context);
        this.getStyles = this.getStyles.bind(this);
    }

    componentDidMount() {
        this.props.connectDragPreview(getEmptyImage(), {captureDraggingState: true});
    }

    componentDidUpdate() {
        this.props.connectDragPreview(getEmptyImage(), {captureDraggingState: true});
    }

    getStyles(props) {
        const {isDragging} = this.props;
        return {
            opacity: isDragging ? 0 : 1,
        };
    }

    render() {
        const {children, connectDragSource} = this.props;
        const dropEffect = 'copy';
        const style = this.getStyles();
        const draggable = React.cloneElement(children, {style});
        return connectDragSource(
            draggable,
            {dropEffect}
        );
  }
}

export const createDraggableNode = DragType => DragSource(DragType.PATTERN, source, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
}))(DraggableNode);
