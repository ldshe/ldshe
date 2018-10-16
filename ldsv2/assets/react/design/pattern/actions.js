import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import {Graph, alg, json} from 'graphlib';
import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {importCollectionContentReady} from 'react/app/design/actions';
import {PatternType} from 'react/design/learning_unit/design_panel/types';
import createActions from 'react/design/learning_unit/design_panel/actions/base';
import DataHandler from 'react/design/learning_unit/design_panel/actions/data_handler';
import {StateName as PatternStateName, Action} from './types';
import * as self from './actions';

const appStateName = AppStateName.DESIGN_APP;
const pattStateName = PatternStateName.PATTERN;

const BaseActions = createActions(Action, pattStateName, self);

export const loadUserPattern = pattId => (dispatch, getState) => {
    const {user, uuidv5Namespace} = Config.get(getState(), appStateName);
    const state = Config.get(getState(), pattStateName);
    let handler = new DataHandler();
    let userPatt = state.userPatts.filter(p => p.id == pattId);
    let isNew = false;
    if(userPatt.length > 0) {
        userPatt = userPatt[0];
    } else {
        isNew = true;
        let id = uuidv5(`user.${user.id}.${uuidv4()}`, uuidv5Namespace.pattern);
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
    dispatch({type: Action.LOAD_USER_PATTERN, payload});
    if(isNew) dispatch(applyPattern());
};

const applyPattern = () => (dispatch, getState) => {
    const state = Config.get(getState(), pattStateName);
    let obsPattId = state.editPattId;
    let obsRoot = state.editRoot;
    let payload =  {obsPattId, obsRoot};
    dispatch({type: Action.APPLY_PATTERN, payload});
};

const applySettings = (pattId, getNode) => (dispatch, getState) => {
    const state = Config.get(getState(), pattStateName);
    let handler = new DataHandler(getNode(state));
    let obsPattId = pattId;
    let obsNode = handler.editRoot();
    delete obsNode.model.children;
    delete obsNode.model.dependencies;
    delete obsNode.model.sequenceMap;
    let payload =  {obsPattId, obsNode};
    dispatch({type: Action.APPLY_SETTINGS, payload});
};

export const addPattern = (item, pos) => (dispatch, getState) => {
    const {user, uuidv5Namespace} = Config.get(getState(), appStateName);
    dispatch(BaseActions.addPattern(item, pos, {user, uuidv5Namespace}));
    dispatch(applyPattern());
};

export const deletePattern = id => (dispatch, getState) => {
    let rmNode = dispatch(BaseActions.deletePattern(id));
    if(rmNode) dispatch(applyPattern());
};

export const updatePosition = (id, pos) => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.updatePosition(id, pos));
    dispatch(applySettings(editPattId, state => state.editRoot.first(n => n.model.id == id)));
};

export const updateConnection = conns => (dispatch, getState) => {
    dispatch(BaseActions.updateConnection(conns));
    dispatch(applyPattern());
};

export const activityFieldChange = (id, field, value) => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.activityFieldChange(id, field, value));
    dispatch(applySettings(editPattId, state => state.editRoot.first(n => n.model.id == id)));
};

export const addAdditionalSettings = (nodeArgs, itemArgs) => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.addAdditionalSettings(nodeArgs, itemArgs));
    dispatch(applySettings(editPattId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const removeAdditionalSettings = (nodeArgs, itemArgs) => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.removeAdditionalSettings(nodeArgs, itemArgs));
    dispatch(applySettings(editPattId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const removeAllAdditionalSettings = nodeArgs => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.removeAllAdditionalSettings(nodeArgs));
    dispatch(applySettings(editPattId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const moveAdditionalSettings = (nodeArgs, itemArgs) => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.moveAdditionalSettings(nodeArgs, itemArgs));
    dispatch(applySettings(editPattId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const updateAdditionalSettings = (nodeArgs, itemArgs) => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.updateAdditionalSettings(nodeArgs, itemArgs));
    dispatch(applySettings(editPattId, state => state.editRoot.first(n => n.model.id == nodeArgs.id)));
};

export const changeName = name => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.changeSubType(name));
    dispatch(BaseActions.changeName(name));
    dispatch(applySettings(editPattId, state => state.editRoot));
}

export const changeTags = tags => (dispatch, getState) => {
    const {editPattId} = Config.get(getState(), pattStateName);
    dispatch(BaseActions.changeTags(tags));
    dispatch(applySettings(editPattId, state => state.editRoot));
}

export const importContent = srcPattern => (dispatch, getState) => {
    const {user, uuidv5Namespace, importCollection} = Config.get(getState(), appStateName);
    let handler = new DataHandler;
    let pattern = handler.exportClone([{patt: srcPattern}], {user, uuidv5Namespace})
        .map(p => ({[p.patt.model.id]: p.patt}))[0];
    let content = Object.assign({}, importCollection.content, {pattern});
    dispatch(importCollectionContentReady({content}));
}

export const {
    reset,
    restore,
    changeLevel,
    selectChild,
    resetAdditionalSettingsPanel,
    freshAdditionalSettingsPanel,
    pushAdditionalSettingsPanel,
    popAdditionalSettingsPanel,
    jumpToAdditionalSettingsPanel,
    partialUpdate,
    partialSettingsUpdate,
} = BaseActions;
