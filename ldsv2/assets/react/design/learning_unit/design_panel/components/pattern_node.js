import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui-touch-punch';
import {isDblTouchTap} from 'js/util';
import {json} from 'js/graphlib';
import {PatternType, SocialOrganization} from '../types';
import {getPatternClassName, getDefaultActivityName, snapToGrid, autoAlignment} from '../util';
import {panzoomScale} from './droppable_workspace';
import {graph} from './graph';

const onMouseClick = e => fn => {if(!$.support.touch) fn(e)};

export default class PatternNode extends Component {

    constructor(props, context) {
        super(props, context);
        this.initPopover = this.initPopover.bind(this);
        this.destroyPopover = this.destroyPopover.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onChangeLevel = this.onChangeLevel.bind(this);
        this.onAutoAlign = this.onAutoAlign.bind(this);
        this.renderSocialOrganizationIcon = this.renderSocialOrganizationIcon.bind(this);
        this.renderAssessmentIcon = this.renderAssessmentIcon.bind(this);
        this.renderDurationLabel = this.renderDurationLabel.bind(this);
        this.renderControl = this.renderControl.bind(this);
        this.renderAutoAlignment = this.renderAutoAlignment.bind(this);
    }

    initPopover() {
        let $container = $(ReactDOM.findDOMNode(this.container));
        $container.popover({
            trigger: 'hover',
            container: 'body',
            animation: false,
            delay: {show: 500},
            template: '<div class="popover popover-node" style="visibility:hidden" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
        });
        $container.on('shown.bs.popover', e => {
            let left = Number($container.css('left').replace('px', ''));
            let top = Number($container.css('top').replace('px', ''));
            let scale = panzoomScale();
            left = $('.grid').offset().left + (left+120)*scale;
            top = $('.grid').offset().top + top*scale;
            let $popover = $('.popover');
            let contHeight = $container.height();
            let popHeight = $popover.height();
            let offsetH;
            if(contHeight > popHeight)
                offsetH = (contHeight-popHeight)/2;
            else
                offsetH = (popHeight-contHeight)/-2;
            $popover.css('-webkit-transform-origin', `left 0`);
            $popover.css('-webkit-transform', `scale(${scale}, ${scale})`);
            $popover.css('transform-origin', `left 0`);
            $popover.css('transform', `scale(${scale}, ${scale})`);
            $popover.css('left', left+'px');
            $popover.css('top', top+offsetH*scale+'px');
            $popover.css('visibility', 'visible');
        });
        $container.on('hide.bs.popover', e => {
            let $popover = $('.popover');
            $popover.css('visibility', 'hidden');
        });
    }

    destroyPopover() {
        let $container = $(ReactDOM.findDOMNode(this.container));
        $container.off('shown.bs.popover');
        $container.off('hide.bs.popover');
        $container.popover('destroy');
    }

    componentDidMount() {
        const {updatePosition} = this.props;
        let $container = $(ReactDOM.findDOMNode(this.container));
        if(!this.props.isReadOnly()) {
            $container.draggable({
                delay: 100,
                start: (e, ui) => {
                    ui.helper.css('zIndex', 2000);
                    $('.jtk-connector').attr('opacity', 0.5);
                    $('.jtk-endpoint').css('opacity', 0);
                },
                drag: (e, ui) => {
                    $container.popover('hide');
                    [ui.position.left, ui.position.top] = snapToGrid(ui.position.left, ui.position.top, panzoomScale());
                    graph().repaint(ui.helper.attr('id'), ui.position);
                },
                stop: (e, ui) => {
                    let left = ui.position.left;
                    let top = ui.position.top;
                    updatePosition(ui.helper.attr('id'), {left, top});
                    ui.helper.css('zIndex', '');
                    $('.jtk-connector').attr('opacity', '');
                    $('.jtk-endpoint').css('opacity', 1);
                },
            });
        }

        this.initPopover();

        let $title = $(ReactDOM.findDOMNode(this.title));
        $title.resizeText({maxfont: 12});
    }

    componentDidUpdate() {
        this.destroyPopover();
        this.initPopover();
    }

    componentWillUnmount() {
        let $container = $(ReactDOM.findDOMNode(this.container));
        if(!this.props.isReadOnly()) $container.draggable('destroy');
        this.destroyPopover();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    };

    onChangeLevel(e) {
        e.preventDefault();
        const {id} = this.props.node.model;
        const {changeLevel} = this.props;
        changeLevel(id);
    }

    onDelete(e) {
        // e.preventDefault();
        // https://www.chromestatus.com/features/5093566007214080
        const {id} = this.props.node.model;
        const {deletePattern} = this.props;
        const alertify = this.props.getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => deletePattern(id),
            title: 'DELETE TASK',
            subTitle: 'This action cannot be undone.',
        });
    }

    onAutoAlign(e, isHead) {
        // e.preventDefault();
        // https://www.chromestatus.com/features/5093566007214080
        const {dependencies, node} = this.props;
        const {id, pos} = node.model;
        const {updatePosition} = this.props;
        let g = json.read(dependencies.graph);
        let alignPos = autoAlignment({
            g, id,
            initLeft: pos.left,
            initTop: pos.top,
            nodeW: 120,
            nodeH: 80,
            padW: 30,
            padH: 60,
            isPartial: !isHead,
        });
        for(let id in alignPos) {
            let {left, top} = alignPos[id];
            updatePosition(id, {left, top});
        }
    }

    renderSocialOrganizationIcon() {
        const {socialOrganization} = this.props.node.model;
        if(socialOrganization) {
            if(socialOrganization == SocialOrganization.INDIVIDUAL) {
                return(
                    <span className="social individual">
                        <i className="fa fa-user"></i>
                    </span>
                );
            } else {
                return(
                    <span className="social group">
                        <i className="fa fa-users"></i>
                    </span>
                );
            }
        } else {
            return null;
        }
    }

    renderAssessmentIcon() {
        const {assessment} = this.props.node.model;
        if(assessment) {
            return (
                <span className="assessment">
                    <i className="icon-grading"></i>
                </span>
            )
        } else {
            return null;
        }
    }

    renderDurationLabel() {
        const {duration} = this.props.node.model;
        if(duration) {
            return <span className="duration">{duration}</span>
        } else {
            return null;
        }
    }

    renderControl(isSelected, removeable) {
        if(isSelected && removeable) {
            return (
                <div className="control">
                    <span className="remove" title="Remove" onClick={e => onMouseClick(e)(this.onDelete)} onTouchStart={this.onDelete}></span>
                </div>
            );
        } else {
            return null;
        }
    }

    renderAutoAlignment(isSelected, isHead) {
        if(isSelected) {
            let cls = classnames('alignment', {sub: !isHead});
            let title = isHead ? 'Auto alignment' : 'Partial auto alignment';
            return (
                <div className={cls}>
                    <span className="align" title={title} onClick={e => onMouseClick(e)((e) => this.onAutoAlign(e, isHead))} onTouchStart={e => this.onAutoAlign(e, isHead)}></span>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        const {selectedChildId, dependencies, sequence, node, removeable} = this.props;
        const {id, pattType, subType, fullname, description, pos} = node.model;
        const {onNodeSelected} = this.props;
        let name = fullname ? fullname : getDefaultActivityName(subType);
        const contProps = {
            id,
            className: 'node-wrapper',
            style: {left: pos.left, top: pos.top},
            'data-toggle': 'popover',
            title: name ? name : ' ',
            'data-content': description ? description : '　',
        }
        let isSelected = id == selectedChildId;
        let isHead = dependencies.rootIds.indexOf(id) != -1;
        const nodeCls = classnames(getPatternClassName(node), {
            node: true,
            selected: isSelected,
        });
        const eventProps = {
            onClick: e => onMouseClick(e)(e => onNodeSelected(e, id)),
            onDoubleClick: (pattType == PatternType.COMPOSITE) ? this.onChangeLevel : () => false,
            onTouchEnd: e => {
                if(isDblTouchTap(e) && pattType == PatternType.COMPOSITE) {
                    this.onChangeLevel(e);
                    return;
                }
                onNodeSelected(e, id);
            },
        };
        setTimeout(() => {
            let $container = $(ReactDOM.findDOMNode(this.container));
            $container.css('zIndex', isSelected ? 10000 : 'inherit');
        }, 0);
        return (
            <div ref={container => this.container = container} {...contProps}>
                {this.renderSocialOrganizationIcon()}
                {this.renderAssessmentIcon()}
                {this.renderDurationLabel()}
                {this.renderControl(isSelected, removeable)}
                {this.renderAutoAlignment(isSelected, isHead)}
                <div className={nodeCls} {...eventProps}>
                    <div ref={title => this.title = title} className="seq">{sequence}</div>
                    <div ref={title => this.title = title} className="title">
                        {name}
                    </div>
                </div>
            </div>
        );
    }
}
