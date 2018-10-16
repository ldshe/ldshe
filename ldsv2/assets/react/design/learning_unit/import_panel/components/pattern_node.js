import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {SocialOrganization} from 'react/design/learning_unit/design_panel/types';
import {getPatternClassName, getDefaultActivityName} from 'react/design/learning_unit/design_panel/util';


export default class PatternNode extends Component {

    constructor(props, context) {
        super(props, context);
        this.initPopover = this.initPopover.bind(this);
        this.destroyPopover = this.destroyPopover.bind(this);
        this.renderSocialOrganizationIcon = this.renderSocialOrganizationIcon.bind(this);
        this.renderAssessmentIcon = this.renderAssessmentIcon.bind(this);
        this.renderDurationLabel = this.renderDurationLabel.bind(this);
    }

    initPopover() {
        let $container = $(ReactDOM.findDOMNode(this.container));
        $container.popover({
            trigger: 'hover',
            container: 'body',
            animation: false,
            delay: {show: 500},
            template: '<div class="popover popover-node" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
        });
    }

    destroyPopover() {
        let $container = $(ReactDOM.findDOMNode(this.container));
        $container.off('shown.bs.popover');
        $container.off('hide.bs.popover');
        $container.popover('destroy');
    }

    componentDidMount() {
        this.initPopover();
        let $title = $(ReactDOM.findDOMNode(this.title));
        $title.resizeText({maxfont: 12});
    }

    componentWillUnmount() {
        this.destroyPopover();
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
        });
        return (
            <div ref={container => this.container = container} {...contProps}>
                {this.renderSocialOrganizationIcon()}
                {this.renderAssessmentIcon()}
                {this.renderDurationLabel()}
                <div className={nodeCls}>
                    <div ref={title => this.title = title} className="seq">{sequence}</div>
                    <div ref={title => this.title = title} className="title">
                        {name}
                    </div>
                </div>
            </div>
        );
    }
}
