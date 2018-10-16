import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import {Graph, alg, json} from 'graphlib';
import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {importContentReady} from 'react/app/design/actions';
import {clearStageItemByIds} from 'react/design/learning_session/allocation_panel/actions';
import {calcTeachingStudyTime} from './unit';
import {StateName as PatternStateName, InstanceAction, PatternAction, PatternType} from '../types';
import DataHandler from './data_handler';
import createActions from './base';
import * as self from './pattern';

const appStateName = AppStateName.DESIGN_APP;
const pattStateName = PatternStateName.LEARNING_UNIT_PATTERN;
const pattInstStateName = PatternStateName.LEARNING_UNIT_PATTERN_INSTANCE;

const BaseActions = createActions(PatternAction, pattStateName, self);

export const loadUserPattern = pattId => (dispatch, getState) => {
    const {courseId, uuidv5Namespace} = Config.get(getState(), appStateName);
    const state = Config.get(getState(), pattStateName);
    let handler = new DataHandler();
    let userPatt = state.userPatts.filter(p => p.id == pattId);
    if(userPatt.length > 0) {
        userPatt = userPatt[0];
    } else {
        let id = uuidv5(`course.${courseId}.${uuidv4()}`, uuidv5Namespace.pattern);
        userPatt = {
            id,
            patt: handler.parse({
                id,
                fullname: 'New Pattern',
                pattType: PatternType.COMPOSITE,
                subType: 'New Pattern',
                tags: [],
            }),
        };
    }
    let editPattId = userPatt.id;
    let editRoot = userPatt.patt;
    let currEditNode = editRoot;
    let payload = {editPattId, editRoot, currEditNode};
    dispatch({type: PatternAction.LOAD_USER_PATTERN, payload});
};

export const loadClonedUserPattern = userPatt => (dispatch, getState) => {
    let {id, patt} = userPatt;
    let editPattId = id;
    let editRoot = patt;
    let currEditNode = editRoot;
    let payload = {editPattId, editRoot, currEditNode};
    dispatch({type: PatternAction.LOAD_CLONED_USER_PATTERN, payload});
};

export const deleteUserPattern = id => (dispatch, getState) => {
    dispatch(BaseActions.deleteUserPattern(id));
    let obsPattId = id;
    let payload = {obsPattId};
    dispatch({type: PatternAction.APPLY_DELETE_USER_PATTERN, payload});
};

export const addPattern = (item, pos) => (dispatch, getState) => {
    const {courseId, uuidv5Namespace} = Config.get(getState(), appStateName);
    dispatch(BaseActions.addPattern(item, pos, {courseId, uuidv5Namespace}));
}

const applyPatternInstanceChange = (dispatch, appState, pattInstState, seed, overrides=[]) => {
    const {courseId, uuidv5Namespace} = appState;
    let userPatts = pattInstState.userPatts.slice();
    let affected = [];
    userPatts.forEach(u => {
        let hasChange = false;
        let nodes = [];
        u.patt.walk(n => {
            if(n.model.ref == seed.model.id)
                nodes.push(n);
        });
        if(nodes.length > 0) {
            let handler = new DataHandler(u.patt);
            nodes.forEach(oldNode => {
                handler.setCurrent(oldNode.parent);
                handler.removeChild(oldNode.model.id);
                let newNode = handler.clone(seed, true, {courseId, uuidv5Namespace});
                newNode.model.tags = null;
                let mergeNode;
                let idMap = {};
                let traversal = (newParent, currNode=null) => {
                    let model;
                    let oldParent = oldNode.first({strategy: 'breadth'}, n => (n.model.ref == newParent.model.ref));
                    if(oldParent) {
                        if(overrides.indexOf(oldParent.model.ref) >= 0) {
                            model = handler.shadowCloneModel(newParent.model);
                            model.id = oldParent.model.id;
                            model.ref = oldParent.model.ref;
                        } else {
                            model = Object.assign({}, handler.shadowCloneModel(newParent.model), handler.shadowCloneModel(oldParent.model));
                        }
                        model.subType = newParent.model.subType;
                        model.pos = newParent.model.pos ? newParent.model.pos : oldParent.model.pos;
                        model.dependencies = newParent.model.dependencies;
                        idMap[newParent.model.id] = oldParent.model.id;
                        oldParent.model.ref = null;
                    } else {
                        model = handler.shadowCloneModel(newParent.model);
                        model.dependencies = newParent.model.dependencies;
                    }
                    if(currNode)
                        currNode = currNode.addChild(handler.parse(model));
                    else
                        mergeNode = currNode = handler.parse(model);
                    if(newParent.hasChildren())
                        newParent.children.forEach(c => traversal(c, currNode));
                };
                traversal(newNode);
                handler.addChild(mergeNode);
                mergeNode.walk(n => {
                    handler.setCurrent(n);
                    let dependencies = n.model.dependencies;
                    if(dependencies) {
                        let g = json.read(dependencies.graph);
                        let conns = g.edges().map(e => ({
                            sourceId: idMap[e.v] ? idMap[e.v] : e.v,
                            targetId: idMap[e.w] ? idMap[e.w] : e.w,
                        }));
                        handler.updateDependencies(conns)
                               .updateSequence();
                    }
                });

                let rmNodeIds = [];
                oldNode.walk(n => {rmNodeIds.push(n.model.id)});
                Object.keys(idMap)
                    .forEach(k => {
                        let rmPos = rmNodeIds.indexOf(idMap[k]);
                        if(rmPos != -1) rmNodeIds.splice(rmPos, 1);
                    })
                if(rmNodeIds.length > 0) dispatch(clearStageItemByIds(rmNodeIds));
            });
            u.patt = handler.editRoot();
            hasChange = true;
        }
        if(hasChange) affected.push(u);
    });

    if(affected.length > 0) {
        let payload = {userPatts}
        dispatch({type: InstanceAction.REFRESH_PATTERN, payload});
        affected.forEach(p => {
            let obsUnitId = p.id;
            let obsRoot = p.patt;
            let payload = {obsUnitId, obsRoot}
            dispatch({type: InstanceAction.APPLY_PATTERN, payload});
        });
        dispatch(calcTeachingStudyTime());
    }
};

export const applyPatternChange = overrides => (dispatch, getState) => {
    const appState = Config.get(getState(), appStateName);
    const pattState = Config.get(getState(), pattStateName);
    const pattInstState = Config.get(getState(), pattInstStateName);
    let handler = new DataHandler();
    let userPatts = pattState.userPatts.slice();
    let repPos = userPatts.map(p => p.id).indexOf(pattState.editPattId);
    if(repPos != -1) {
        userPatts[repPos] = {id: pattState.editPattId, patt: pattState.editRoot};
        applyPatternInstanceChange(dispatch, appState, pattInstState, pattState.editRoot, overrides);
    }
    else {
        userPatts.push({id: pattState.editPattId, patt: pattState.editRoot});
    }
    let obsPattId = pattState.editPattId;
    let obsRoot = pattState.editRoot;
    let payload = {userPatts, obsPattId, obsRoot}
    dispatch({type: PatternAction.APPLY_PATTERN, payload});
};

export const cancelPatternChange = () => (dispatch, getState) => {
    const state = Config.get(getState(), pattStateName);
    let editPattId = null;
    let editRoot = null;
    let currEditNode = null;
    let payload = {editPattId, editRoot, currEditNode};
    dispatch({type: PatternAction.CANCEL_PATTERN, payload});
};

export const changeName = name => (dispatch, getState) => {
    dispatch(BaseActions.changeSubType(name));
    dispatch(BaseActions.changeName(name));
}

export const importContent = srcPatterns => (dispatch, getState) => {
    const {courseId, uuidv5Namespace, importDesign} = Config.get(getState(), appStateName);
    let idMap = Object.assign({}, importDesign.idMap);
    let handler = new DataHandler;
    let patterns = handler.importClone(srcPatterns, {courseId, uuidv5Namespace}, idMap)
        .map(p => Object.assign({}, p, {id: idMap[p.id]}));
    let content = Object.assign({}, importDesign.content, {patterns});
    dispatch(importContentReady({content, idMap}));
}

export const partialDelete = pattIds => (dispatch, getState) => {
    pattIds.forEach(id => dispatch(deleteUserPattern(id)));
}

export const {
    reset,
    restore,
    changeTags,
    deletePattern,
    updatePosition,
    updateConnection,
    changeLevel,
    selectChild,
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
    partialUpdate,
} = BaseActions;
