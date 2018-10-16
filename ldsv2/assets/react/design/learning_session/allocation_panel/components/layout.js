import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {default as TouchBackend} from 'react-dnd-touch-backend';
import DragLayer from './drag_layer';

let ref = {
    isDragging: false,
};

export const setDragging = isDragging => {
    return ref.isDragging = isDragging;
}

class Layout extends Component {
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        const {scrollTop, scrollInnerLeft, scrollInnerTop} = this.props;
        let $workspace = $(ReactDOM.findDOMNode(this.workspace));
        setTimeout(() => {
            if(scrollTop) $(window).scrollTop(scrollTop);
            if(scrollInnerLeft) $workspace.scrollLeft(scrollInnerLeft);
            if(scrollInnerTop) $workspace.scrollTop(scrollInnerTop);
        }, 0);
        $workspace.on('touchmove', e => {if(ref.isDragging) e.preventDefault()});
        $('body').on('touchmove', e => {
            if(ref.isDragging) {
                $(this).css('overflow', 'hidden');
            } else {
                $(this).css('overflow', '');
            }
        });
    }

    componentWillUnmount() {
        let $workspace = $(ReactDOM.findDOMNode(this.workspace));
        $workspace.off('touchmove');
        $('body').off('touchmove');

        const {rememberScroll} = this.props;
        rememberScroll({
            scrollTop: $(window).scrollTop(),
            scrollInnerLeft: $workspace.scrollLeft(),
            scrollInnerTop: $workspace.scrollTop(),
        });

    }

    render() {
        const {allocationControl, sidebarHeader, sidebarContent, allocationContent} = this.props;
        return (
            <div>
                <div className="sess-control">{allocationControl}</div>
                <div className="sess-alloc">
                    <div className="sidebar">
                        <div className="sidebar-title">{sidebarHeader}</div>
                        <div className="sidebar-content">{sidebarContent}</div>
                    </div>
                    <div ref={workspace => this.workspace = workspace} className="alloc-workspace">
                        <div className="alloc-workspace-content">{allocationContent}</div>
                    </div>
                    <DragLayer/>
                </div>
            </div>
        );
    }
}

export default DragDropContext($.support.touch ? TouchBackend() : HTML5Backend)(Layout);
