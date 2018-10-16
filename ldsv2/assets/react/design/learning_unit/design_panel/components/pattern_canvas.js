import classnames from 'classnames';
import React, {Component} from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {default as TouchBackend} from 'react-dnd-touch-backend';

class PatternCanvas extends Component {
    constructor(props, context) {
        super(props, context);
        this.renderControl = this.renderControl.bind(this);
    }

    componentDidMount() {
        $('#canvas-info').tooltip({html: true});
    }

    renderControl() {
        return (
            <div className="control">
                <span id="canvas-info" className="info" data-toggle="tooltip" data-container="body" data-placement="left" title='"Shift + Mouse drag" to pan<br/>"Shift + Mouse wheel" to zoom<br/>"Shift + Double Click" to reset'></span>
            </div>
        );
    }

    render() {
        const {sidebarDisabled, sidebarContent, workspaceContent} = this.props;
        let sideBarCls = classnames({
            'sidebar-content': true,
            inactive: sidebarDisabled,
        });
        return (
            <div className="canvas-resizeable">
                <div className="sidebar">
                    <div className="sidebar-title">Task Types</div>
                    <div className={sideBarCls}>
                        <div className="dim" />
                        {sidebarContent}
                    </div>
                </div>
                <div className="canvas-workspace">
                    <div className="canvas-workspace-title">
                        Arrangement
                        {this.renderControl()}
                    </div>
                    <div className="canvas-workspace-content">{workspaceContent}</div>
                </div>
            </div>
        );
    }
}

export default DragDropContext($.support.touch ? TouchBackend : HTML5Backend)(PatternCanvas);
