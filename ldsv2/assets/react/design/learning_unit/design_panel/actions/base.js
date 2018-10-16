import validate from 'validate.js';
import uuidv4 from 'uuid/v4';
import {Config, isNumber} from 'js/util';
import {Design} from  'react/services/util';
import {StateName as AppStateName} from 'react/app/design/types';
import createAdditionalSettingsActions from 'react/components/sortable_list/actions';
import createAdditionalSettingsPanelActions from 'react/components/stacked_panel/actions';
import {PatternType, LearningActivity, AdditionalSettings} from '../types';
import {constraints} from '../components/activity_settings/validator';
import DataHandler from './data_handler';

const appStateName = AppStateName.DESIGN_APP;

const createActions = function(Action, stateName, child) {
    const additionalPanelAction = createAdditionalSettingsPanelActions(Action.ADDITIONAL_SETTINGS_PANEL, `${stateName}.additional.additionalSettingsPanel`);
    this.actions = {
        reset: () => ({type: Action.RESET}),

        restore: () => ({type: Action.RESTORE}),

        deleteUserPattern: id => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let userPatts = state.userPatts.slice();
            let rmPos = userPatts.map(p => p.id).indexOf(id);
            if(rmPos != -1) {
                let rmNode = userPatts[rmPos].patt;
                userPatts.splice(rmPos, 1);
                let payload = {userPatts};
                dispatch({type: Action.DELETE_USER_PATTERN, payload});
                return rmNode;
            }
            return null;
        },

        changeTags: tags => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            editRoot.model.tags = tags;
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.CHANGE_TAGS, payload});
        },

        changeSubType: subType => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            editRoot.model.subType = subType;
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.CHANGE_SUBTYPE, payload});
        },

        changeName: name => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            editRoot.model.fullname = name;
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.CHANGE_NAME, payload});
        },

        addPattern: (item, pos, ns) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let cloned = handler.clone(item.seed, true, ns);
            cloned.model.pos = pos;
            cloned.model.fullname = '';
            cloned.model.shortname = null;
            cloned.model.tags = null;
            handler.addChild(cloned)
                   .updateDependencies(null, cloned)
                   .updateSequence();
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.ADD_PATTERN, payload});
        },

        deletePattern: id => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let rmNode = handler.removeChild(id);
            handler.updateDependencies(null, null, id)
                   .updateSequence();
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.DELETE_PATTERN, payload});
            return rmNode;
        },

        updatePosition: (id, pos) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            handler.updatePosition(id, pos)
                   .updateDependencies()
                   .updateSequence();
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.UPDATE_POSITION, payload});
        },

        updateConnection: conns => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            handler.updateDependencies(conns)
                   .updateSequence();
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.UPDATE_CONNECTION, payload});
        },

        changeLevel: id => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            if(state.currEditNode && state.currEditNode.model.id == id)
                return;
            let currEditNode = state.editRoot.first(n => n.model.id == id);
            let selectedChildId;
            if(currEditNode.model.pattType == PatternType.ACTIVITY) {
                currEditNode = currEditNode.parent;
                selectedChildId = id;
            } else {
                selectedChildId = null;
            }
            let payload = {currEditNode, selectedChildId};
            dispatch({type: Action.CHANGE_LEVEL, payload});
        },

        selectChild: selectedChildId => ({type: Action.SELECT_CHILD, payload: {selectedChildId}}),

        activityFieldChange: (id, field, value) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let node = currEditNode.first(n => n.model.id == id);
            switch(field) {
                case 'subType': {
                    let seed = LearningActivity[value.toUpperCase()].patt;
                    node.model.ref = seed.model.id;
                    node.model.group = seed.model.group;
                    node.model.subType = seed.model.subType;
                    break;
                }

                case 'assessment': {
                    node.model.assessment = value == 'true' ? true : false;
                    break;
                }

                case 'groupSize':
                case 'groupSizeMax': {
                    let error = validate({[field]: value}, {[field]: constraints[field]});
                    if(error)
                        node.model[field] = null;
                    else
                        node.model[field] = Math.round(Number(value));
                    break;
                }

                case 'duration': {
                    let error = validate({duration: value}, {duration: constraints.duration});
                    if(error)
                        node.model.duration = null;
                    else
                        node.model.duration = Math.round(Number(value));
                    break;
                }

                default:
                    node.model[field] = value;
            }
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.ACTIVITY_FIELD_CHANGE, payload});
        },

        resetAdditionalSettingsPanel: () => (dispatch, getState) => dispatch(additionalPanelAction.reset()),

        freshAdditionalSettingsPanel: (...args) => (dispatch, getState) => dispatch(additionalPanelAction.freshPanel(...args)),

        pushAdditionalSettingsPanel: (...args) => (dispatch, getState) => dispatch(additionalPanelAction.pushPanel(...args)),

        popAdditionalSettingsPanel: (nodeArgs, itemArgs) => (dispatch, getState) => {
            if(nodeArgs && itemArgs) {
                const state = Config.get(getState(), stateName);
                itemArgs.field = state.additional.additionalSettingsPanel.currPanel.opts.initSettings;
                dispatch(child.updateAdditionalSettings(nodeArgs, itemArgs));
                if(!itemArgs.validateAll()) {
                    dispatch(child.removeAdditionalSettings(nodeArgs, itemArgs));
                    return;
                }
            }
            dispatch(additionalPanelAction.popPanel());
        },

        jumpToAdditionalSettingsPanel: (...args) => (dispatch, getState) => dispatch(additionalPanelAction.jumpToPanel(...args)),

        addAdditionalSettings: (nodeArgs, itemArgs) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let node = currEditNode.first(n => n.model.id == nodeArgs.id);
            let target = `additional${nodeArgs.field.capitalize()}`;
            if(!node.model[target][nodeArgs.value]) node.model[target][nodeArgs.value] = {data: []};
            let item;
            switch(itemArgs.type) {
                case AdditionalSettings.URL: {
                    item = {
                        type: AdditionalSettings.URL,
                        id: uuidv4(),
                        title: '',
                        description: '',
                        url: '',
                    }
                    break;
                }
                case AdditionalSettings.FILE: {
                    item = {
                        type: AdditionalSettings.FILE,
                        id: uuidv4(),
                        title: '',
                        description: '',
                        file: {},
                    }
                    break;
                }
            }
            const {addItem} = createAdditionalSettingsActions(Action.ADDITIONAL_SETTINGS);
            addItem(itemArgs.pos, item)(dispatch, () => node.model[target][nodeArgs.value]);
            node.model[target][nodeArgs.value].data = Config.get(getState(), stateName).additional.currAdditionalSettingsData;
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.ACTIVITY_FIELD_CHANGE, payload});
        },

        removeAdditionalSettings: (nodeArgs, itemArgs) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let node = currEditNode.first(n => n.model.id == nodeArgs.id);
            let target = `additional${nodeArgs.field.capitalize()}`;
            const {removeItem} = createAdditionalSettingsActions(Action.ADDITIONAL_SETTINGS);
            removeItem(itemArgs.pos)(dispatch, () => node.model[target][nodeArgs.value]);
            node.model[target][nodeArgs.value].data = Config.get(getState(), stateName).additional.currAdditionalSettingsData;
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.ACTIVITY_FIELD_CHANGE, payload});
        },

        removeAllAdditionalSettings: (nodeArgs) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let node = currEditNode.first(n => n.model.id == nodeArgs.id);
            let target = `additional${nodeArgs.field.capitalize()}`;
            delete node.model[target][nodeArgs.value];
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.ACTIVITY_FIELD_CHANGE, payload});
        },

        moveAdditionalSettings: (nodeArgs, itemArgs) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let node = currEditNode.first(n => n.model.id == nodeArgs.id);
            let target = `additional${nodeArgs.field.capitalize()}`;
            const {moveItem} = createAdditionalSettingsActions(Action.ADDITIONAL_SETTINGS);
            moveItem(itemArgs.prevPos, itemArgs.newPos)(dispatch, () => node.model[target][nodeArgs.value]);
            node.model[target][nodeArgs.value].data = Config.get(getState(), stateName).additional.currAdditionalSettingsData;
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.ACTIVITY_FIELD_CHANGE, payload});
        },

        updateAdditionalSettings: (nodeArgs, itemArgs) => (dispatch, getState) => {
            const state = Config.get(getState(), stateName);
            let handler = new DataHandler(state.editRoot, state.currEditNode);
            let editRoot = handler.editRoot();
            let currEditNode = handler.currEditNode();
            let node = currEditNode.first(n => n.model.id == nodeArgs.id);
            let target = `additional${nodeArgs.field.capitalize()}`;
            const {updateItemField} = createAdditionalSettingsActions(Action.ADDITIONAL_SETTINGS);
            updateItemField(itemArgs.pos, itemArgs.field)(dispatch, () => node.model[target][nodeArgs.value]);
            node.model[target][nodeArgs.value].data = Config.get(getState(), stateName).additional.currAdditionalSettingsData;
            let payload = {editRoot, currEditNode};
            dispatch({type: Action.ACTIVITY_FIELD_CHANGE, payload});
        },

        partialUpdate: patterns => (dispatch, getState) => {
            patterns = JSON.parse(JSON.stringify(patterns));
            const state = Config.get(getState(), stateName);
            let userPatts = state.userPatts.slice();
            let editRoot = null;
            let currEditNode = null;
            userPatts = userPatts.map(u => {
                if(patterns[u.id]) {
                    u = {id: u.id};
                    u.patt = Design.load.convertPatternObj(patterns[u.id]);
                    delete patterns[u.id];
                }
                return u;
            });
            Object.keys(patterns).forEach(k => userPatts.push({id: k, patt: Design.load.convertPatternObj(patterns[k])}));
            if(state.editRoot) {
                let filtered = userPatts.filter(({patt}) => state.editRoot.model.id == patt.model.id);
                if(filtered.length > 0) {
                    editRoot = filtered[0].patt;
                    if(state.currEditNode)
                        currEditNode = editRoot.first(n => n.model.id == state.currEditNode.model.id);
                    if(!currEditNode)
                        currEditNode = editRoot;
                }
            }
            let payload = {userPatts, editRoot, currEditNode};
            dispatch({type: Action.PARTIAL_UPDATE, payload});
        },

        partialSettingsUpdate: nodes => (dispatch, getState) => {
            nodes = JSON.parse(JSON.stringify(nodes));
            const state = Config.get(getState(), stateName);
            let updates = {};
            state.userPatts.forEach(u => {
                Object.keys(nodes).forEach(k => {
                    let node = nodes[k];
                    if(u.patt.first(n => n.model.id == node.id)) {
                        if(!updates[u.id]) updates[u.id] = [];
                        updates[u.id].push(node);
                        delete nodes[k];
                    }
                });
            });
            let userPatts = state.userPatts.slice();
            let editRoot = null;
            let currEditNode = null;
            Object.keys(updates).forEach(k => {
                let nodes = updates[k];
                let userPatt = userPatts.filter(u => u.id == k)[0];
                let handler = new DataHandler(userPatt.patt);
                let patt = handler.editRoot();
                nodes.forEach(node => {
                    let n = patt.first(n => n.model.id == node.id);
                    node = Design.load.convertPatternObj(node);
                    if(n.isRoot()) {
                        n.model = Object.assign({}, n.model, node.model);
                    } else {
                        let {parent} = n;
                        n = handler.parse(Object.assign({}, n.model, node.model));
                        handler.setCurrent(parent);
                        handler.removeChild(n.model.id);
                        handler.addChild(n);
                    }
                });
                patt.walk(n =>{
                    handler.setCurrent(n);
                    handler.updateDependencies()
                           .updateSequence();
                })
                userPatt.patt = patt;
            });
            if(state.editRoot) {
                let filtered = userPatts.filter(({patt}) => state.editRoot.model.id == patt.model.id);
                if(filtered.length > 0) {
                    editRoot = filtered[0].patt;
                    if(state.currEditNode)
                        currEditNode = editRoot.first(n => n.model.id == state.currEditNode.model.id);
                    if(!currEditNode)
                        currEditNode = editRoot;
                }
            }
            let payload = {userPatts, editRoot, currEditNode};
            dispatch({type: Action.PARTIAL_UPDATE, payload});
        },
    };
    const self = this.actions;
    return self;
};

export default (...args) => (new createActions(...args));
