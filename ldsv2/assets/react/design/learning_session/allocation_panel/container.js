import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import {Config, isSafari} from 'js/util';
import {StateName as ContextStateName} from 'react/design/learning_context//types';
import {StateName as UnitStateName} from 'react/design/learning_unit/pedagogical_sequence/types';
import {StateName as PanelStateName} from 'react/design/learning_unit/design_panel/types';
import {getDefaultActivityName} from 'react/design/learning_unit/design_panel/util';
import {Panel} from 'react/design/session_step/types';
import Layout from './components/layout';
import PatternPreview from './components/pattern_preview';
import UnitFilter from './components/unit_filter';
import SessionStageGroupList, {createStageDroppable} from './components/session_stage';
import {StateName as SessionStateName, FilterType, DragType, StageType} from './types';
import {addBulkSession, addStageItem, removeStageItem, removeAllStageItem, moveStageItem, reorderStageItem, expandStageItem, refreshAllocedlookup, updateFilter, expandFilterItem, loadDetails, rememberScroll} from './actions';

const StageDroppable = createStageDroppable(DragType);

class AllocationPanel extends Component {

    constructor(props, context) {
        super(props, context);
        this.onTitleClick = this.onTitleClick.bind(this);
        this.onClearSession = this.onClearSession.bind(this);
        this.editStageItem = this.editStageItem.bind(this);
        this.allocSessionSlots = this.allocSessionSlots.bind(this);
        this.renderAllocationControl = this.renderAllocationControl.bind(this);
        this.renderSidebarHeader = this.renderSidebarHeader.bind(this);
        this.renderSidebarContent = this.renderSidebarContent.bind(this);
        this.renderStageGroup = this.renderStageGroup.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.renderAllocationContent = this.renderAllocationContent.bind(this);
    }

    componentDidMount() {
        const {userPatts} = this.props.patternInstance;
        const {data, filter} = this.props.session;
        const {updateFilter, refreshAllocedlookup} = this.props;

        this.allocSessionSlots();

        updateFilter(FilterType.REFRESH);

        refreshAllocedlookup();

        $('.ss .sess-alloc [data-toggle="popover"]').popover({trigger: 'hover', template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'});

        $('.alloc-workspace').scrollhspy({
            target: '#sess-scrollhspy-target',
            offset: $('.alloc-workspace').offset().left,
        });
    }

    componentDidUpdate() {
        this.updateProgress();
        if(isSafari()) {
            let $el = $('#sess-last .all-stage');
            $el.height($('#sess-last').height()-65);
        }
    }

    componentWillUnmount() {
        $('.ss .sess-alloc [data-toggle="popover"]').popover('destroy');
    }

    onTitleClick(e, sessId, pos) {
        e.preventDefault();
        const {loadDetails, pushPanel} = this.props;
        loadDetails(sessId);
        pushPanel(Panel.SESSION_DETAILS, {subTitle: `Session ${pos+1}`});
    }

    onClearSession(e, sessId) {
        e.preventDefault();
        const {removeAllStageItem, getAlertify} = this.props;
        const alertify = getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => {
                removeAllStageItem(sessId);
            },
            title: 'CLEAR SESSION',
            subTitle: 'This action cannot be undone.',
        });
    }

    editStageItem(unitId, node) {
        const {id, subType, fullname} = node.model;
        const {pushPanel} = this.props;
        let name = fullname ? fullname : getDefaultActivityName(subType);
        let nodeId = id;
        pushPanel(Panel.SESSION_SETTINGS, {subTitle: name, unitId, nodeId});
    }

    allocSessionSlots() {
        const {course, session} = this.props;
        const {addBulkSession} = this.props;
        let inSessCount = session.data.filter(d => d.stage == StageType.IN).length;
        let postSessCount = session.data.filter(d => d.stage == StageType.POST).length;
        if(postSessCount == 0)
            addBulkSession(1, StageType.POST);
        if(course.data.sessionNum > inSessCount)
            addBulkSession(course.data.sessionNum - inSessCount);
    }

    renderAllocationControl() {
        const {data} = this.props.session;
        let jumpTo = e => {
            e.preventDefault();
            let selector = $(e.target).attr('href');
            let $cont = $('.alloc-workspace');
            let scrollLeft = $(selector).offset().left - ($cont.offset().left - $cont.scrollLeft());
            $cont.scrollLeft(scrollLeft);
            $cont.scrollTop(0);
        };
        return (
            <div className="row">
                <div className="col-sm-12" id="sess-scrollhspy-target">
                    <ul className="nav navbar-nav navbar-right">
                        <li className="dropdown">
                            <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                <i className="fa fa-share"></i> Jump <span className="caret"></span>
                            </a>
                            <ul className="dropdown-menu">
                                {data.filter(d => d.stage == StageType.IN)
                                    .map((d, i) => {
                                        let name = d.topic ? `${i+1} ${d.topic}` : `${i+1}`;
                                        return <li key={i}><a href={`#sess-${i}`} title={name} onClick={jumpTo}>{name}</a></li>;
                                    })}
                                {<li key="last"><a href={`#sess-last`} title="Final Assignments" onClick={jumpTo}>Final Assignments</a></li>}
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    renderSidebarHeader() {
        const {data} = this.props.unit;
        const {userPatts} = this.props.patternInstance;
        const {filter} = this.props.session;
        const {updateFilter} = this.props;
        let roots = [];
        data.forEach(d => {
            let userPatt = userPatts.filter(p => p.id == d.id);
            if(userPatt.length > 0 && userPatt[0].patt.children.length > 0)
                roots.push(userPatt[0].patt);
        });
        const props = {
            roots,
            filter,
            updateFilter,
        };
        return <UnitFilter {...props}/>;
    }

    renderSidebarContent() {
        const {data} = this.props.unit;
        const {userPatts} = this.props.patternInstance;
        const {allocedLookup, filter, filterExpanded} = this.props.session;
        const {expandFilterItem} = this.props;
        return data.map(u => {
            let userPatt = userPatts.filter(p => p.id == u.id);
            if(userPatt.length > 0) {
                let p = userPatt[0];
                if(!filter[p.patt.model.id]) return null;
                if(p.patt.children.length > 0) {
                    let props = {
                        key: p.id,
                        root: p.patt,
                        allocedLookup,
                        filterExpanded,
                        expandFilterItem,
                    }
                    return <PatternPreview {...props}/>;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        });
    }

    renderStageGroup(sessId, stageType, pattIds) {
        const {userPatts} = this.props.patternInstance;
        const {compositeExpanded} = this.props.session;
        const {reorderStageItem, removeStageItem, expandStageItem} = this.props;
        let props = {
            sessId,
            stageType,
            pattIds,
            userPatts,
            compositeExpanded,
            editStageItem: this.editStageItem,
            reorderStageItem,
            removeStageItem,
            expandStageItem,
        };
        return <SessionStageGroupList {...props}/>;
    }

    updateProgress() {
        const {sessInDuration, sessPpDuration} = this.props.course.data;
        const {userPatts} = this.props.patternInstance;
        const {data} = this.props.session;
        let durations = [];
        let calcDuration = ids => {
            let duration = 0;
            ids.forEach(id => {
                for(let j=0; j<userPatts.length; j++) {
                    let {patt} = userPatts[j];
                    let node;
                    if((node = patt.first(({model}) => model.id == id))) {
                        node.walk(({model}) => {
                            duration += model.duration ? model.duration : 0;
                        })
                        break;
                    }
                }
            });
            return duration;
        };
        data.filter(d => d.stage == StageType.IN)
            .forEach(d => {
                durations.push({
                    pre: calcDuration(d.pre),
                    in: calcDuration(d.in),
                    post: calcDuration(d.post),
                });
            });
        durations.forEach((d, i) => {
            if(i > 0) {
                let pp = d.pre + durations[i-1].post;
                d.pre  = durations[i-1].post = pp;
            }
        });
        durations.forEach((d, i) => {
            let updProgress = (stage, total, baseHr) => {
                let baseMin = baseHr * 60;
                let $p, percent, value;
                percent = baseMin ? total / baseMin * 100 : 0;
                value = Math.round(percent).toFixed(0);
                $p = $(`#progress-${i}-${stage}`);
                $p.text(`${value}%`);
                if(percent > 100) {
                    $p.attr('aria-valuemax', percent);
                    $p.addClass('progress-bar-danger')
                    $p.css('width', `${100}%`);
                } else {
                    $p.attr('aria-valuemax', 100);
                    $p.removeClass('progress-bar-danger');
                    $p.css('width', `${value}%`);
                }
                $p.attr('aria-valuenow', value);
                if(stage == StageType.IN)
                    $p.attr('title', `In-class: ${(total/60).toFixed(1)} hr(s) / ${total} min(s)`);
                else
                    $p.attr('title', `Pre+Post-class: ${(total/60).toFixed(1)} hr(s) / ${total} min(s)`);
            };
            updProgress(StageType.IN, d.in, sessInDuration);
            updProgress(StageType.PRE, d.pre, sessPpDuration);
            updProgress(StageType.POST, d.post, sessPpDuration);
        });
    }

    renderAllocationContent() {
        const {data} = this.props.session;
        const {addStageItem, moveStageItem} = this.props;
        let preTitle = 'Pre-class';
        let inTitle = 'In-class';
        let postTitle = 'Post-class';
        let currDate;
        let els = data
            .filter(d => d.stage == StageType.IN)
            .map((d, i) => {
                let topic = d.topic ? `${i+1} ${d.topic}` : `${i+1}`;
                let tzOffset = moment().utcOffset();
                currDate = moment(d.utcDate).minute(tzOffset);
                let date = d.utcDate ? currDate.format('(dddd) D MMMM, YYYY') : '　';
                let objective = d.objective ? d.objective : '';
                let titleProps = {
                    'data-toggle': 'popover',
                    'data-placement': 'bottom',
                    'data-title': topic,
                    'data-content': objective,
                };
                const preProps = {
                    sessId: d.id,
                    stageType: StageType.PRE,
                    addStageItem,
                    moveStageItem,
                };
                const inProps = {
                    sessId: d.id,
                    stageType: StageType.IN,
                    addStageItem,
                    moveStageItem,
                };
                const postProps = {
                    sessId: d.id,
                    stageType: StageType.POST,
                    addStageItem,
                    moveStageItem,
                };
                return (
                    <div className="alloc-slot" key={i} id={`sess-${i}`}>
                        <div className="alloc-slot-title">
                            <a href="#" onClick={e => this.onTitleClick(e, d.id, i)} {...titleProps}>
                                <span className="topic">{topic}</span>
                                <span className="edit" title="Edit"></span>
                                <br/>
                                {date}
                            </a>
                        </div>
                        <div className="alloc-slot-clear">
                            <a href="#" onClick={e => this.onClearSession(e, d.id)}>Clear Session</a>
                        </div>
                        <StageDroppable {...preProps}>
                            <div className="pre-stage">
                                <div className="progress">
                                    <div className="progress-bar" id={`progress-${i}-pre`} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                                <div className="stage-title">{preTitle}</div>
                                {this.renderStageGroup(d.id, StageType.PRE, d[StageType.PRE])}
                            </div>
                        </StageDroppable>
                        <StageDroppable {...inProps}>
                            <div className="in-stage">
                                <div className="progress">
                                    <div className="progress-bar" id={`progress-${i}-in`} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                                <div className="stage-title">{inTitle}</div>
                                {this.renderStageGroup(d.id, StageType.IN, d[StageType.IN])}
                            </div>
                        </StageDroppable>
                        <StageDroppable {...postProps}>
                            <div className="post-stage">
                                <div className="progress">
                                    <div className="progress-bar" id={`progress-${i}-post`} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                                </div>
                                <div className="stage-title">{postTitle}</div>
                                {this.renderStageGroup(d.id, StageType.POST, d[StageType.POST])}
                            </div>
                        </StageDroppable>
                    </div>
                );
            });

        let last = els.length;
        let lastDate = currDate && currDate.isValid() ? moment(currDate).hour(24) : null;
        return els.concat(data
            .filter(d => d.stage == StageType.POST)
            .map((d, i) => {
                i += last;
                let date = lastDate ? lastDate.format('(dddd) D MMMM, YYYY') : null;
                const inProps = {
                    sessId: d.id,
                    stageType: StageType.IN,
                    addStageItem,
                    moveStageItem,
                };
                return (
                    <div className="alloc-slot" key="last" id="sess-last">
                        <div className="alloc-slot-title">
                            <a href="#" onClick={e => e.preventDefault()}>
                                <span className="topic">{`Final Assignments`}</span>
                                <br/>
                                {'　'}
                            </a>
                        </div>
                        <div className="alloc-slot-clear">
                            <a href="#" onClick={e => this.onClearSession(e, d.id)}>Clear Session</a>
                        </div>
                        <StageDroppable {...inProps}>
                            <div className="all-stage">
                                {this.renderStageGroup(d.id, StageType.IN, d[StageType.IN])}
                            </div>
                        </StageDroppable>
                    </div>
                );
            })
        );
    }

    render() {
        const {scrollTop, scrollInnerLeft, scrollInnerTop} = this.props.session;
        const {rememberScroll} = this.props;
        const props = {
            allocationControl: this.renderAllocationControl(),
            sidebarHeader: this.renderSidebarHeader(),
            sidebarContent: this.renderSidebarContent(),
            allocationContent: this.renderAllocationContent(),
            scrollTop,
            scrollInnerLeft,
            scrollInnerTop,
            rememberScroll,
        }
        return <Layout {...props}/>;
    }
}

const mapStateToProps = state => ({
    course: Config.get(state, ContextStateName.LEARNING_CONTEXT),
    unit: Config.get(state, UnitStateName.LEARNING_UNIT),
    patternInstance: Config.get(state, PanelStateName.LEARNING_UNIT_PATTERN_INSTANCE),
    session: Config.get(state, SessionStateName.LEARNING_SESSION),
});

const mapDispatchToProps = dispatch => ({
    addBulkSession: (n, stage) => dispatch(addBulkSession(n, stage)),
    addStageItem: (sessId, stageType, pattId, pos) => dispatch(addStageItem(sessId, stageType, pattId, pos)),
    removeStageItem: (sessId, stageType, pattId) => dispatch(removeStageItem(sessId, stageType, pattId)),
    removeAllStageItem: sessId => dispatch(removeAllStageItem(sessId)),
    expandStageItem: (pattId, expanded) => dispatch(expandStageItem(pattId, expanded)),
    moveStageItem: (oldSessId, oldStageType, newSessId, newStageType, pattId) => dispatch(moveStageItem(oldSessId, oldStageType, newSessId, newStageType, pattId)),
    reorderStageItem: (sessId, stageType, oldPos, newPos) => dispatch(reorderStageItem(sessId, stageType, oldPos, newPos)),
    refreshAllocedlookup: () => dispatch(refreshAllocedlookup()),
    updateFilter: (pattId, isSet) => dispatch(updateFilter(pattId, isSet)),
    expandFilterItem: (pattId, expanded) => dispatch(expandFilterItem(pattId, expanded)),
    loadDetails: sessId => dispatch(loadDetails(sessId)),
    rememberScroll: scroll => dispatch(rememberScroll(scroll)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AllocationPanel);
