import classnames from 'classnames';
import React, {Component} from 'react';
import {getPatternClassName, expandDependencies} from '../util';
import {LearningType, LearningActivity, PatternType, DragType} from '../types';
import {createDraggableNode} from '../components/draggable_node';
import PatternPreview from '../components/pattern_preview';
import ActivitySettings from '../components/activity_settings';

const DraggableNode = createDraggableNode(DragType);

export const baseContext = {};

export default class Base extends Component {

    constructor(props, context) {
        super(props, context);
        this.createHistBlock = this.createHistBlock.bind(this);
        this.releaseHistBlock = this.releaseHistBlock.bind(this);
        this.pushHistBlockMsg = this.pushHistBlockMsg.bind(this);
        this.popHistBlockMsg = this.popHistBlockMsg.bind(this);
        baseContext.pushHistBlockMsg = this.pushHistBlockMsg;
        baseContext.popHistBlockMsg = this.popHistBlockMsg;
        this.blockMsg = [];
        this.unblock = null;
    }

    componentWillUnmount() {
        this.blockMsg = [];
        this.releaseHistBlock();
    }

    createHistBlock() {
        if(this.blockMsg.length <= 0) return;
        const msg = this.blockMsg[this.blockMsg.length-1];
        const readOnly = this.props.isReadOnly();
        const history = this.props.getHistory();
        if(!readOnly) {
            let url = location.href;
            $(window).bind('beforeunload', e => msg);
            this.unblock = history.block((location, action) => {
                /*
                 * Although the block function is able to block the page redirection,
                 * the side effect of path change is unable to block
                 * https://github.com/ReactTraining/react-router/issues/5405
                 */
                // push the current URL again to compensate the pop up effect
                window.location.href = url;

                // don't block http error message or transition to preview mode
                if(location.pathname.match(/^\/http/) || location.pathname.match(/preview/)) return null;

                return msg;
            });
        }
    }

    releaseHistBlock() {
        $(window).unbind('beforeunload');
        if(this.unblock) {
            this.unblock();
            this.unblock = null;
        }
    }

    pushHistBlockMsg(msg) {
        this.blockMsg.push(msg);
        this.releaseHistBlock();
        this.createHistBlock();
    }

    popHistBlockMsg() {
        this.blockMsg.pop();
        this.releaseHistBlock();
        if(this.blockMsg.length > 0) this.createHistBlock();
    }

    renderDefaultOptions(sysPatts) {
        let grps = {};
        sysPatts.forEach((p) => {
            let {pattType, group} = p.patt.model;
            let key = pattType+':'+group;
            if(grps[key]) {
                grps[key].patts.push(p);
            }
            else {
                grps[key] = {};
                grps[key].pattType = pattType;
                grps[key].group = group;
                grps[key].patts = [p];
            }
        });
        return Object.keys(grps).map((k, i) => {
            let g = grps[k];
            let grpProps = {
                key: g.group,
                className: classnames({
                    'activity': g.pattType == PatternType.ACTIVITY,
                }),
            }
            let patts = g.patts;
            return (
                (g.pattType == PatternType.ACTIVITY) ?
                <div {...grpProps}>
                    <p className="title">{g.group}</p>
                    {patts.map((p, i) => {
                        let seed = p.patt;
                        let {shortname, fullname} = seed.model;
                        let dragProps = {
                            key: p.id,
                            seed,
                        };
                        let itemProps = {
                            className: classnames(getPatternClassName(seed), {item: true}),
                            'data-toggle': 'tooltip',
                            'data-placement': 'top',
                            'data-container': 'body',
                            title: fullname,
                        };
                        return (
                            <DraggableNode {...dragProps}>
                                <div {...itemProps}>
                                    {shortname}
                                </div>
                            </DraggableNode>
                        );
                    })}
                </div> :
                null
            );
        });
    }

    renderPatternPreview(root, curr, selectedChildId) {
        const {changeLevel, selectChild} = this.props;
        if(root && curr) {
            let props = {
                root,
                curr,
                selectedChildId,
                changeLevel,
                selectChild,
            }
            return <PatternPreview {...props}/>;
        } else {
            return null;
        }
    }

    renderActivitySettings(type, parent, childId, props) {
        let node = (parent && childId) ? parent.first(n => n.model.id == childId) : null;
        const {activityFieldChange,
            resetAdditionalSettingsPanel, freshAdditionalSettingsPanel, pushAdditionalSettingsPanel, popAdditionalSettingsPanel, jumpToAdditionalSettingsPanel,
            addAdditionalSettings, removeAdditionalSettings, removeAllAdditionalSettings, moveAdditionalSettings, updateAdditionalSettings,
            uploadFile,
        } = this.props;
        props = Object.assign({}, props, {
            type,
            node,
            colLabelClassname: 'col-xs-4',
            colInputClassname: 'col-xs-8',
            activityFieldChange,
            resetAdditionalSettingsPanel,
            freshAdditionalSettingsPanel,
            pushAdditionalSettingsPanel,
            popAdditionalSettingsPanel,
            jumpToAdditionalSettingsPanel,
            addAdditionalSettings,
            removeAdditionalSettings,
            removeAllAdditionalSettings,
            moveAdditionalSettings,
            updateAdditionalSettings,
            uploadFile,
        });
        return <ActivitySettings {...props}/>;
    }
};
