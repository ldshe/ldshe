import classnames from 'classnames';
import React, {Component} from 'react';
import {panzoomPanCenter} from './droppable_workspace';
import PatternCanvas from './pattern_canvas';
import Settings from './settings';

export default class PanelLayout extends Component {
    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        const minCanvasWidth = 350;
        const minSettingWidth = 300;
        const reserve = 400;
        const $resizable = $('.patt-canvas .canvas-resizeable');
        let panCenterTimeout;
        let boundWidthTimeout;
        this.canvasWidth = $resizable.parent().width()-reserve;
        $resizable.css('width', this.canvasWidth);

        if($.support.touch) {
            require('lib/jquery-resizable-dom');
            $resizable.resizable({
                handleSelector: '.splitter',
                resizeHeight: false,
                onDrag: function(e, $el, opt) {
                    if(panCenterTimeout) {
                        clearTimeout(panCenterTimeout);
                        panCenterTimeout = null;
                    }
                    if(boundWidthTimeout) {
                        clearTimeout(panCenterTimeout);
                        boundWidthTimeout = null;
                    }
                    panCenterTimeout = setTimeout(() => {
                        panzoomPanCenter();
                        $('.settings.nav-tabs').scrollingTabs('refresh');
                    }, 600);
                    let adjustedWith = null;
                    let widthBound = $('.canvas-content').width()-minSettingWidth;
                    if($el.width() > widthBound) adjustedWith = widthBound;
                    if($el.width() < minCanvasWidth || (adjustedWith && adjustedWith < minCanvasWidth)) adjustedWith = minCanvasWidth;
                    if(adjustedWith != null) {
                        boundWidthTimeout = setTimeout(() => {$el.width(adjustedWith)}, 500);
                        return false;
                    }
                },
            });
        } else {
            //jquery-ui draggable does not support touch event even jquery-ui-touch-punch in use
            //possibly it is related to custom handles
            require('jquery-ui/ui/widgets/resizable');
            $resizable.resizable({
                handles: {
                    e: $('.patt-canvas .splitter'),
                },
                minSettingWidth,
                resize: (e, ui) => {
                    let adjustedWith = null;
                    let widthBound = ui.helper.parent().width()-minSettingWidth;
                    if(ui.size.width > widthBound) ui.size.width = widthBound;
                    if(ui.size.width < minCanvasWidth) ui.size.width = minCanvasWidth;
                    ui.size.height = ui.originalSize.height;
                    if(panCenterTimeout) {
                        clearTimeout(panCenterTimeout);
                        panCenterTimeout = null;
                    }
                    panCenterTimeout = setTimeout(() => {
                        panzoomPanCenter();
                        $('.settings.nav-tabs').scrollingTabs('refresh');
                    }, 500);
                }
            });
        }

        this.canvasResize = () => {
            let $canvas = $('.canvas-resizeable');
            let width = $canvas.parent().width()-reserve;
            if(minCanvasWidth > width) width = minCanvasWidth;
            $canvas.css('width', width);
            panzoomPanCenter();
        };
        window.addEventListener('resize', this.canvasResize);
        this.canvasResize();
    }

    componentWillUnmount() {
        const $resizable = $('.patt-canvas .canvas-resizeable');
        $resizable.resizable('destroy');
        window.removeEventListener('resize', this.canvasResize);
    }

    render() {
        const {controlContent, sidebarDisabled, sidebarContent, workspaceContent, navigationContent, settingsContent} = this.props;
        const pattCanvasProps = {sidebarDisabled, sidebarContent, workspaceContent};
        const settingsProps = {navigationContent, settingsContent};
        return (
            <div>
                <div className="patt-control row">{controlContent}</div>
                <div className="patt-canvas">
                    <div className="canvas-content">
                        <PatternCanvas {...pattCanvasProps}/>
                        <div className="splitter"/>
                        <Settings {...settingsProps}/>
                    </div>
                </div>
            </div>
        );
    }
}
