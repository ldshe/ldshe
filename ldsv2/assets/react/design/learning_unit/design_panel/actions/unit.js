import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {importContentReady} from 'react/app/design/actions';
import {freshPanel} from 'react/design/unit_step/actions';
import {updateTotalTeachingStudyTime} from 'react/design/learning_context/actions';
import {clearStageItemByNode} from 'react/design/learning_session/allocation_panel/actions';
import {StateName as UnitStateName} from '../../pedagogical_sequence/types';
import {updateTeachingStudyTime} from '../../pedagogical_sequence/actions'
import {StateName as PatternStateName, InstanceAction as Action, DEFAULT_UNIT_SEQ_PREFIX, PatternType, Setting} from '../types';
import DataHandler from './data_handler';
import createActions from './base';
import * as self from './unit';

const appStateName = AppStateName.DESIGN_APP;
const unitStateName = UnitStateName.LEARNING_UNIT;
const pattInstStateName = PatternStateName.LEARNING_UNIT_PATTERN_INSTANCE;

const BaseActions = createActions(Action, pattInstStateName, self);

export const loadUserPattern = unitId => (dispatch, getState) => {
    const {courseId, uuidv5Namespace} = Config.get(getState(), appStateName);
    const unitState = Config.get(getState(), unitStateName);
    const state = Config.get(getState(), pattInstStateName);
    let pos = -1;
    let unit;
    unitState.data.forEach((d, i) => {
        if(d.id == unitId) {
            pos = i;
            unit = d;
        }
    });
    if(pos == -1) {
        if(unitState.data.length > 0)
            dispatch(loadUserPattern(unitState.data[0].id));
        else
            dispatch(freshPanel());
        return;
    }
    let handler = new DataHandler;
    let userPatt = state.userPatts.filter(p => p.id == unitId);
    let saveNewPatt = userPatt.length == 0;
    userPatt = userPatt.length > 0 ?
               userPatt[0] : {
                   id: unitId,
                   patt: handler.parse({
                       id: uuidv5(`course.${courseId}.${uuidv4()}`, uuidv5Namespace.pattern),
                       fullname: unit.title,
                       pattType: PatternType.COMPOSITE,
                       subType: DEFAULT_UNIT_SEQ_PREFIX+(pos+1),
                   }),
               };
    let editUnitId = userPatt.id;
    let editUnitPos = pos;
    let editRoot = userPatt.patt;
    let currEditNode = editRoot;
    let payload = {editUnitId, editUnitPos, editRoot, currEditNode};
    dispatch({type: Action.LOAD_USER_PATTERN, payload});
    if(saveNewPatt) dispatch(applyPattern());
};

export const deleteUserPattern = id => (dispatch, getState) => {
    const unitState = Config.get(getState(), unitStateName);
    let rmNode = dispatch(BaseActions.deleteUserPattern(id));
    if(rmNode) {
        let obsUnitId = id;
        let payload = {obsUnitId};
        dispatch({type: Action.APPLY_DELETE_USER_PATTERN, payload});
        dispatch(clearStageItemByNode(rmNode));
        dispatch(calcTeachingStudyTime());
        if(unitState.data.length > 0)
            dispatch(loadUserPattern(unitState.data[0].id));
        else
            dispatch(freshPanel());
    }
};

const applyPattern = () => (dispatch, getState) => {
    const state = Config.get(getState(), pattInstStateName);
    let obsUnitId = state.editUnitId;
    let obsRoot = state.editRoot;
    let payload =  {obsUnitId, obsRoot};
    dispatch({type: Action.APPLY_PATTERN, payload});
};

const applySettings = (unitId, getNode) => (dispatch, getState) => {
    const state = Config.get(getState(), pattInstStateName);
    let handler = new DataHandler(getNode(state));
    let obsUnitId = unitId;
    let obsNode = handler.editRoot();
    delete obsNode.model.children;
    delete obsNode.model.dependencies;
    delete obsNode.model.sequenceMap;
    let payload =  {obsUnitId, obsNode};
    dispatch({type: Action.APPLY_SETTINGS, payload});
};

export const refreshUnitType = () => (dispatch, getState) => {
    const unitState = Config.get(getState(), unitStateName);
    const pattInstState = Config.get(getState(), pattInstStateName);
    const restoreEditUnitId = pattInstState.editUnitId;

    let needRestore = false;
    unitState.data.forEach((unit, i) => {
        let userPatt = pattInstState.userPatts.filter(p => p.id == unit.id);
        if(userPatt.length > 0) {
            let editRoot = userPatt[0].patt;
            let rootType = DEFAULT_UNIT_SEQ_PREFIX+(i+1);
            if(editRoot.model.subType != rootType) {
                needRestore = true;
                dispatch(loadUserPattern(unit.id));
                dispatch(BaseActions.changeSubType(rootType));
                dispatch(applySettings(unit.id, state => state.editRoot));
            }
        }
    });

    if(needRestore) dispatch(loadUserPattern(restoreEditUnitId));
};

export const addPattern = (item, pos) => (dispatch, getState) => {
    const {courseId, uuidv5Namespace} = Config.get(getState(), appStateName);
    dispatch(BaseActions.addPattern(item, pos, {courseId, uuidv5Namespace}));
    dispatch(applyPattern());
    dispatch(calcTeachingStudyTime());
};

export const deletePattern = id => (dispatch, getState) => {
    let rmNode = dispatch(BaseActions.deletePattern(id));
    if(rmNode) {
        dispatch(applyPattern());
        dispatch(clearStageItemByNode(rmNode));
        dispatch(calcTeachingStudyTime());
    }
};

export const updatePosition = (id, pos) => (dispatch, getState) => {
    const {editUnitId} = Config.get(getState(), pattInstStateName);
    dispatch(BaseActions.updatePosition(id, pos));
    dispatch(applySettings(editUnitId, state => state.editRoot.first(n => n.model.id == id)));
};

export const updateConnection = conns => (dispatch, getState) => {
    dispatch(BaseActions.updateConnection(conns));
    dispatch(applyPattern());
};

export const calcTeachingStudyTime = () => (dispatch, getState) => {
    const {userPatts} = Config.get(getState(), pattInstStateName);
    let totalTeachingTime = 0;
    let totalSelfStudyTime = 0;
    userPatts.forEach(({id, patt}) => {
        let teachingSettings = [Setting.FACE_TO_FACE_SYNCHRONOUS, Setting.FACE_TO_FACE_CLASSROOM, Setting.FACE_TO_FACE_FIELD_WORK];
        let selfStudySettings = [Setting.INFORMAL_ON_OR_OFFLINE, Setting.ONLINE_ASYNCHRONOUS, Setting.ONLINE_SYNCHRONOUS];
        let actNodes = patt.all(n => n.model.pattType == PatternType.ACTIVITY);
        let teachingTime = actNodes.reduce((c, n) => {
            let {setting, duration} = n.model;
            if(teachingSettings.indexOf(setting) != -1)
                return c += duration ? duration : 0;
            else
                return c;
        }, 0);
        let selfStudyTime = actNodes.reduce((c, n) => {
            let {setting, duration} = n.model;
            if(selfStudySettings.indexOf(setting) != -1)
                return c += duration ? duration : 0;
            else
                return c;
        }, 0);
        totalTeachingTime += teachingTime;
        totalSelfStudyTime += selfStudyTime;
        dispatch(updateTeachingStudyTime(id, teachingTime, selfStudyTime));
    });
    dispatch(updateTotalTeachingStudyTime(totalTeachingTime, totalSelfStudyTime));
};

export const activityFieldChange = (id, field, value) => (dispatch, getState) => {
    const {editUnitId} = Config.get(getState(), pattInstStateName);
    dispatch(BaseActions.activityFieldChange(id, field, value));
    dispatch(applySettings(editUnitId, state => state.editRoot.first(n => n.model.id == id)));

    if(field == 'duration' || field == 'setting')
        dispatch(calcTeachingStudyTime());
};

export const addAdditionalSettings = (nodeArgs, itemArgs) => (dispatch, getState) => {
    const {editUnitId} = Config.get(getState(), pattInstStateName);
    dispatch(BaseActions.addAdditionalSettings(nodeArgs, itemArgs));
    dispatch(applySettings(editUnitId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const removeAdditionalSettings = (nodeArgs, itemArgs) => (dispatch, getState) => {
    const {editUnitId} = Config.get(getState(), pattInstStateName);
    dispatch(BaseActions.removeAdditionalSettings(nodeArgs, itemArgs));
    dispatch(applySettings(editUnitId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const removeAllAdditionalSettings = nodeArgs => (dispatch, getState) => {
    const {editUnitId} = Config.get(getState(), pattInstStateName);
    dispatch(BaseActions.removeAllAdditionalSettings(nodeArgs));
    dispatch(applySettings(editUnitId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const moveAdditionalSettings = (nodeArgs, itemArgs) => (dispatch, getState) => {
    const {editUnitId} = Config.get(getState(), pattInstStateName);
    dispatch(BaseActions.moveAdditionalSettings(nodeArgs, itemArgs));
    dispatch(applySettings(editUnitId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const updateAdditionalSettings = (nodeArgs, itemArgs) => (dispatch, getState) => {
    const {editUnitId} = Config.get(getState(), pattInstStateName);
    dispatch(BaseActions.updateAdditionalSettings(nodeArgs, itemArgs));
    dispatch(applySettings(editUnitId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const changeUnitTitle = (unitId, title) => (dispatch, getState) => {
    const {editUnitId} = Config.get(getState(), pattInstStateName);
    const restoreEditUnitId = editUnitId;
    dispatch(loadUserPattern(unitId));
    dispatch(BaseActions.changeName(title));
    dispatch(applySettings(unitId, state => state.editRoot));
    if(unitId != restoreEditUnitId) dispatch(loadUserPattern(restoreEditUnitId));
};

export const importContent = srcInstances => (dispatch, getState) => {
    const {courseId, uuidv5Namespace, importDesign} = Config.get(getState(), appStateName);
    let idMap = Object.assign({}, importDesign.idMap);
    let handler = new DataHandler;
    let instances = handler.importClone(srcInstances, {courseId, uuidv5Namespace}, idMap)
        .map(p => Object.assign({}, p, {id: idMap[p.id]}));
    let content = Object.assign({}, importDesign.content, {instances});
    dispatch(importContentReady({content, idMap}));
}

export const {
    reset,
    restore,
    changeLevel,
    selectChild,
    partialUpdate,
    partialSettingsUpdate,
    resetAdditionalSettingsPanel,
    freshAdditionalSettingsPanel,
    pushAdditionalSettingsPanel,
    popAdditionalSettingsPanel,
    jumpToAdditionalSettingsPanel,
} = BaseActions;
