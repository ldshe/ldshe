import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {DropTarget} from 'react-dnd';
import 'jquery-mousewheel';
import 'lib/jquery.panzoom';
import DragLayer from './drag_layer';
import {snapToGrid} from '../util';

const DEFAULT_SCALE = 1;

let ref = {
    scale: DEFAULT_SCALE,
};

export const enablePanzoom = enable => {
    let $container = $(ReactDOM.findDOMNode(ref.container));
    let $grid = $container.find('.grid');
    if(enable)
        $grid.panzoom('enable');
    else
        $grid.panzoom('disable');
}

export const panzoomScale = () => {
    return ref.scale;
}

export const panzoomPanCenter = (resetY=false) => {
    let $container = $(ReactDOM.findDOMNode(ref.container));
    let $grid = $container.find('.grid');
    let gridWidth = $grid.width();
    let parentWidth = $grid.parent().width();
    let offsetX = (gridWidth - parentWidth) / -2;
    let matrix = $grid.panzoom('getMatrix');
    let offsetY = resetY ? 0 : matrix[5];
    $grid.panzoom('pan', offsetX, offsetY, {silent: true});
}

const dropTarget = {
    drop(props, monitor, component) {
        const item = monitor.getItem();
        const {onDropTarget} = props;

        let $grid = $(ReactDOM.findDOMNode(ref.container)).find('.grid');
        let gridRect = $grid.get(0).getBoundingClientRect();

        let $preview = $(ReactDOM.findDOMNode(ref.container)).find('.node-preview');
        let previewRect = $preview.get(0).getBoundingClientRect();

        let left = previewRect.left - gridRect.left;
        let top = previewRect.top - gridRect.top;

        [left, top] = snapToGrid(left, top, panzoomScale());

        onDropTarget(item, {left, top});
    },
};

class DroppableWorkspace extends Component {

    constructor(props, context) {
        super(props, context);
        this.panStart = null;
        this.shiftKeyPressed = false;
    }

    componentDidMount() {
        let $container = $(ReactDOM.findDOMNode(ref.container));
        let $grid = $container.find('.grid');

        $grid.panzoom({
            cursor: '',
            minScale: 0.6,
            maxScale: 1.2,
            ignoreChildrensEvents: true,
        });

        ref.scale = DEFAULT_SCALE;

        let isInbound = e => {
            let {left, top} = $container.offset();
            let right = left + $container.width();
            let bottom = top + $container.height();
            return e.pageX >= left && e.pageX <= right && e.pageY >= top && e.pageY <= bottom
        }

        $(document).on('mousedown', e => {
            if(this.shiftKeyPressed && isInbound(e)) {
                $().clearSelection();
                let matrix = $grid.panzoom('getMatrix');
                let offsetX = matrix[4];
                let offsetY = matrix[5];
                let panStart = {x: e.pageX, y: e.pageY, dx: offsetX, dy: offsetY};
                this.panStart = panStart;
                $grid.panzoom('option', 'ignoreChildrensEvents', false);
            }
        }).on('mousemove', e => {
            if(this.shiftKeyPressed && this.panStart) {
                let deltaX = this.panStart.x-e.pageX;
                let deltaY = this.panStart.y-e.pageY;
                let matrix = $grid.panzoom('getMatrix');
                matrix[4] = parseInt(this.panStart.dx)-deltaX;
                matrix[5] = parseInt(this.panStart.dy)-deltaY;
                $grid.panzoom('setMatrix', matrix);
            }
        }).on('mousewheel.focal', e => {
            if(this.shiftKeyPressed && isInbound(e)) {
                e.preventDefault();
                let delta = e.delta || e.originalEvent.wheelDelta;
                let zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                $grid.panzoom('zoom', zoomOut, {
                    animate: true,
                    exponential: false,
                    focal: e,
                });
                ref.scale = $grid.panzoom("getMatrix")[0];
                this.graph.setZoom(ref.scale);
            }
        }).on('mouseup', e => {
            this.panStart = null;
        }).on('keydown', e => {
            if(e.which == 16 && !this.shiftKeyPressed) {
                e.preventDefault();
                this.shiftKeyPressed = true;
                $container.css('cursor', 'move');
            }
        }).on('keyup', e => {
            if(e.which == 16 && this.shiftKeyPressed) {
                e.preventDefault();
                this.shiftKeyPressed = false;
                $container.css('cursor', 'default');
                $grid.panzoom('option', 'ignoreChildrensEvents', true);
            }
        }).on('dblclick', e => {
            if(this.shiftKeyPressed) {
                $grid.panzoom('zoom', DEFAULT_SCALE, {animate: false});
                ref.scale = DEFAULT_SCALE;
                this.graph.setZoom(ref.scale);
                panzoomPanCenter(true);
            }
        });

        setTimeout(() => {panzoomPanCenter()}, 0);
    }

    componentWillUnmount() {
        $(document)
            .off('mousedown')
            .off('mousemove')
            .off('mousewheel.focal')
            .off('mouseup')
            .off('keydown')
            .off('keyup')
            .off('dblclick');

        let $container = $(ReactDOM.findDOMNode(ref.container));
        let $grid = $container.find('.grid');
        $grid.panzoom('destroy');
    }

    render() {
        const {children, connectDropTarget} = this.props;
        const graph = React.cloneElement(children, {ref: graph => this.graph = graph});
        return (
            <div ref={container => ref.container = container}>
                {connectDropTarget(<div className="grid">{graph}</div>)}
                <DragLayer/>
            </div>
        );
    }
}

export const createDroppableWorkspace = DragType => DropTarget([DragType.PATTERN], dropTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))(DroppableWorkspace);
