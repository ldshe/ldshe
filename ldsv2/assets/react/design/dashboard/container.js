import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {StateName as OutcomeStateName, LearningOutcomeTypes} from 'react/design/learning_outcome/types';
import {StateName as UnitStateName} from 'react/design/learning_unit/pedagogical_sequence/types';
import {StateName as PatternStateName, PatternType, LearningGroup, LearningType, SocialOrganization} from 'react/design/learning_unit/design_panel/types';
import {StateName as SessionStateName} from 'react/design/learning_session/allocation_panel/types';
import ActivityChart from './components/activity_chart';
import SocialChart from './components/social_chart';
import OutcomeChart from './components/outcome_chart';
import AssessmentWeightChart from './components/assessment_weight_chart';
import AssessmentDueTable from './components/assessment_due_table';
import ClassTimetable from './components/timetable/class_timetable';
import LearningTimetable from './components/timetable/learning_timetable';
import {AssessmentType} from './types';

class Dashboard extends Component {

    constructor(props, context) {
        super(props, context);
        this.calcActivityStat = this.calcActivityStat.bind(this);
        this.calcSocialStat = this.calcSocialStat.bind(this);
        this.calcOutcomeStat = this.calcOutcomeStat.bind(this);
        this.calcAssessmentWeightStat = this.calcAssessmentWeightStat.bind(this);
        this.renderActivityChart = this.renderActivityChart.bind(this);
        this.renderSocialChart = this.renderSocialChart.bind(this);
        this.renderOutcomeChart = this.renderOutcomeChart.bind(this);
        this.renderAssessmentWeightChart = this.renderAssessmentWeightChart.bind(this);
        this.renderAssessmentDueTable = this.renderAssessmentDueTable.bind(this);
        this.renderClassTimetable = this.renderClassTimetable.bind(this);
        this.renderLearningTimetable = this.renderLearningTimetable.bind(this);
    }

    calcActivityStat() {
        const {userPatts} = this.props.patternInstance;
        let learningTypeSum = {};
        Object.keys(LearningType)
            .forEach(k => learningTypeSum[LearningType[k]] = 0);
        userPatts.forEach(p => {
            let nodes = p.patt.all(n => n.model.pattType == PatternType.ACTIVITY);
            nodes.forEach(n => {
                const {subType, duration} = n.model;
                learningTypeSum[subType] += duration ? duration : 0;
            });
        });
        return learningTypeSum;
    }

    calcSocialStat() {
        const {userPatts} = this.props.patternInstance;
        let socialOrganizationSum = {};
        Object.keys(SocialOrganization)
            .forEach(k => socialOrganizationSum[SocialOrganization[k]] = 0);
        userPatts.forEach(p => {
            let nodes = p.patt.all(n => n.model.pattType == PatternType.ACTIVITY);
            nodes.forEach(n => {
                const {socialOrganization, duration} = n.model;
                socialOrganizationSum[socialOrganization] += duration ? duration : 0;
            });
        });
        return socialOrganizationSum;
    }

    calcOutcomeStat() {
        const outcomeData = this.props.outcome.data;
        const unitData = this.props.unit.data;
        const {userPatts} = this.props.patternInstance;
        let outcomeSum = {};
        outcomeData.forEach((o, i) => {
            outcomeSum[o.id] = {
                pos: i,
                sum: 0,
                type: o.type,
                description: o.description,
            }
        });
        let unitSum = {};
        userPatts.forEach(p => {
            let nodes = p.patt.all(n => n.model.pattType == PatternType.ACTIVITY);
            unitSum[p.id] = 0;
            nodes.forEach(n => {
                const {duration} = n.model;
                unitSum[p.id] += duration ? duration : 0;
            });
        });
        Object.keys(unitSum)
            .forEach(id => {
                let unit = unitData.filter(u => u.id == id);
                if(unit.length > 0) {
                    unit = unit[0];
                    unit.outcomes.forEach(lo => outcomeSum[lo].sum += unitSum[id]);
                }
            });
        return outcomeSum;
    }

    calcAssessmentWeightStat() {
        const unitData = this.props.unit.data;
        let groupWeightSum = {};
        let individualWeightSum = {};
        unitData.forEach(u => {
            if(u.groupAssessment) {
                groupWeightSum[u.id] = {
                    id: u.id,
                    name: u.title,
                    value: u.groupAssessment,
                };
            }
            if(u.individualAssessment) {
                individualWeightSum[u.id] = {
                    id: u.id,
                    name: u.title,
                    value: u.individualAssessment,
                };
            }
        });
        return {groupWeightSum, individualWeightSum};
    }

    renderActivityChart() {
        let duration = this.calcActivityStat();
        let totalDuration = Object.keys(duration).reduce((c, k) => duration[k] + c, 0);
        let data = [
            {group: LearningGroup.REFLECTIVE.capitalize(), type: LearningType.REVISION, name: 'Revision', ratio: 0},
            {group: LearningGroup.REFLECTIVE.capitalize(), type: LearningType.REFLECTION, name: 'Reflection', ratio: 0},
            {group: LearningGroup.REFLECTIVE.capitalize(), type: LearningType.SELF_OR_PEER_ASSESSMENT, name: 'Self-/Peer-assessment', ratio: 0},
            {group: LearningGroup.PRODUCTIVE.capitalize(), type: LearningType.CONCEPTUAL_OR_VISUAL_ARTEFACTS, name: 'Construction: Conceptual / Visual Artefacts', ratio: 0},
            {group: LearningGroup.PRODUCTIVE.capitalize(), type: LearningType.TANGIBLE_MANIPULABLE_ARTIFACT, name: 'Construction: Tangible / Manipulable Artifacts', ratio: 0},
            {group: LearningGroup.PRODUCTIVE.capitalize(), type: LearningType.PRESENTATIONS_PERFORMANCE_ILLUSTRATION, name: 'Presentations, Performance Illustrations', ratio: 0},
            {group: LearningGroup.EXPLORATORY.capitalize(), type: LearningType.TANGIBLE_OR_IMMERSIVE_INVESTIGATION, name: 'Tangible / Immersive Investigation', ratio: 0},
            {group: LearningGroup.EXPLORATORY.capitalize(), type: LearningType.EXPLORATIONS_THROUGH_CONVERSATION, name: 'Explorations through Conversation', ratio: 0},
            {group: LearningGroup.EXPLORATORY.capitalize(), type: LearningType.INFORMATION_EXPLORATION, name: 'Information Exploration', ratio: 0},
            {group: LearningGroup.DIRECTED.capitalize(), type: LearningType.TEST_ASSESSMENT, name: 'Test / Assessment', ratio: 0},
            {group: LearningGroup.DIRECTED.capitalize(), type: LearningType.PRACTICE, name: 'Practice', ratio: 0},
            {group: LearningGroup.DIRECTED.capitalize(), type: LearningType.RECEIVING_AND_INTERPRETING_INFORMATION, name: 'Receiving & Interpreting Information', ratio: 0},
        ];
        data.forEach(d => d.ratio = duration[d.type]/totalDuration);
        const props = {
            data,
        };
        return (
            <div className="chart">
                <div className="title">Type of Learning Task</div>
                <ActivityChart {...props}/>
            </div>
        );
    }

    renderSocialChart() {
        let duration = this.calcSocialStat();
        let totalDuration = Object.keys(duration).reduce((c, k) => duration[k] + c, 0);
        let data = [
            {type: SocialOrganization.GROUP, name: SocialOrganization.GROUP.splitSnakeCase().capitalize(), ratio: 0},
            {type: SocialOrganization.INDIVIDUAL, name: SocialOrganization.INDIVIDUAL.splitSnakeCase().capitalize(), ratio: 0},
            {type: SocialOrganization.PEER_REVIEW, name: SocialOrganization.PEER_REVIEW.splitSnakeCase().capitalize(), ratio: 0},
            {type: SocialOrganization.WHOLE_CLASS, name: SocialOrganization.WHOLE_CLASS.splitSnakeCase().capitalize(), ratio: 0},
        ];
        data.forEach(d => d.ratio = duration[d.type]/totalDuration);
        const props = {
            data,
        };
        return (
            <div className="chart">
                <div className="title">Social Organization in Learning</div>
                <SocialChart {...props}/>
            </div>
        );
    }

    renderOutcomeChart() {
        let duration = this.calcOutcomeStat();
        let data = Object.keys(duration)
            .map(k => ({
                name: `LO${duration[k].pos+1}`,
                value: duration[k].sum,
                type: duration[k].type,
                group: duration[k].type.splitSnakeCase().capitalizeAll(),
                description: duration[k].description,
            }));
        const props = {
            data,
        };
        return (
            <div className="chart">
                <div className="title">The duration of training will receive for each Learning Outcome</div>
                <OutcomeChart {...props}/>
            </div>
        );
    }

    renderAssessmentWeightChart() {
        let {groupWeightSum, individualWeightSum} = this.calcAssessmentWeightStat();
        let totalGroupWeight = Object.keys(groupWeightSum).reduce((c, k) => groupWeightSum[k].value + c, 0);
        let totalIndividualWeight = Object.keys(individualWeightSum).reduce((c, k) => individualWeightSum[k].value + c, 0);
        let totalWeight = totalGroupWeight + totalIndividualWeight;
        let data = Object.keys(groupWeightSum).map(k => {
            let {id, name, value} = groupWeightSum[k];
            return {
                type: AssessmentType.GROUP,
                id,
                name,
                ratio: value / totalWeight,
            };
        });
        data = data.concat(Object.keys(individualWeightSum).map(k => {
            let {id, name, value} = individualWeightSum[k];
            return {
                type: AssessmentType.INDIVIDUAL,
                id,
                name,
                ratio: value / totalWeight,
            };
        }));
        const props = {
            data,
        };
        return (
            <div className="chart">
                <div className="title">Weight of Assignments</div>
                <AssessmentWeightChart {...props}/>
            </div>
        );
    }

    renderAssessmentDueTable() {
        const {patternInstance} = this.props;
        const props = {
            patternInstance,
        };
        return (
            <div className="chart">
                <div className="title">Important Dates</div>
                <AssessmentDueTable {...props}/>
            </div>
        );
    }

    renderClassTimetable() {
        const {unit, patternInstance, session} = this.props;
        const props = {
            unit,
            patternInstance,
            session,
        };
        return <ClassTimetable {...props}/>;
    }

    renderLearningTimetable() {
        const {unit, patternInstance, session} = this.props;
        const props = {
            unit,
            patternInstance,
            session,
        };
        return <LearningTimetable {...props}/>;
    }

    render() {
        return (
            <div className="dd">
                <h4>Learning</h4>
                <div className="row chart-wrapper">
                    <div className="col-md-6">{this.renderActivityChart()}</div>
                    <div className="col-md-6">{this.renderSocialChart()}</div>
                </div>
                <div className="row chart-wrapper">
                    <div className="col-sm-12">{this.renderOutcomeChart()}</div>
                </div>
                <h4>Assessment</h4>
                <div className="row chart-wrapper">
                    <div className="col-md-6">{this.renderAssessmentWeightChart()}</div>
                    <div className="col-md-6">{this.renderAssessmentDueTable()}</div>
                </div>
                <h4>Time Organization</h4>
                <div className="row chart-wrapper">
                    <div className="col-sm-12">{this.renderClassTimetable()}</div>
                </div>
                <div className="row chart-wrapper">
                    <div className="col-sm-12">{this.renderLearningTimetable()}</div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => ({
    outcome: Config.get(state, OutcomeStateName.LEARNING_OUTCOME),
    unit: Config.get(state, UnitStateName.LEARNING_UNIT),
    patternInstance: Config.get(state, PatternStateName.LEARNING_UNIT_PATTERN_INSTANCE),
    session: Config.get(state, SessionStateName.LEARNING_SESSION),
});

const mapDispatchToProps = dispatch => ({

});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Dashboard);
