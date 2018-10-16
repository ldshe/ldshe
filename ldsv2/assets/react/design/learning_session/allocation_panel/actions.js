import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import moment from 'moment';
import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {importContentReady} from 'react/app/design/actions';
import {StateName as ContextStateName} from 'react/design/learning_context/types';
import {fieldChange as contextFieldChange} from 'react/design/learning_context/actions';
import {StateName as PanelStateName} from 'react/design/learning_unit/design_panel/types';
import {Action, StateName as SessionStateName, FilterType, StageType} from './types';
import DataHandler from './data_handler';

const appStateName = AppStateName.DESIGN_APP;
const contextStateName = ContextStateName.LEARNING_CONTEXT;
const sessionStateName = SessionStateName.LEARNING_SESSION;
const instanceStateName = PanelStateName.LEARNING_UNIT_PATTERN_INSTANCE;

export const reset = () => ({type: Action.RESET});

export const restore = () => ({type: Action.RESTORE});

export const addBulkSession = (n, stage=StageType.IN) => (dispatch, getState) => {
    Array.apply(null, {length: n})
        .map(Number.call, Number)
        .forEach(n => dispatch(addSession(stage)));
};

export const addSession = stage => (dispatch, getState) => {
    const {courseId, uuidv5Namespace} = Config.get(getState(), appStateName);
    const state = Config.get(getState(), sessionStateName);
    let data = state.data.slice();
    let sess = {
        id: uuidv5(`course.${courseId}.${uuidv4()}`, uuidv5Namespace.session),
        topic: '',
        objective: '',
        utcDate: null,
        stage,
        pre: [],
        in: [],
        post: [],
    };
    if(stage == StageType.POST)
        data.push(sess);
    else
        data.splice(data.length-1, 0, sess);
    let obsSessIds = [sess.id];
    let payload = {data, obsSessIds};
    dispatch({type: Action.ADD_SESSION, payload});
};

export const removeSession = id => (dispatch, getState) => {
    const appState = Config.get(getState(), appStateName);
    const sessState = Config.get(getState(), sessionStateName);
    let data = sessState.data.slice();
    let rmPos = data.map(s => s.id).indexOf(id);
    if(rmPos != -1) {
        let rmSess = data.splice(rmPos, 1);
        let obsSessIds = [id];
        let payload = {data, obsSessIds};
        let sessionNum = data.filter(d => d.stage == StageType.IN).length;
        dispatch({type: Action.REMOVE_SESSION, payload});
        dispatch(contextFieldChange({sessionNum}));
        if(!appState.readDesignOnly) {
            rmSess[0].pre.forEach(id => {
                dispatch(updateAllocedlookup(id, false));
                dispatch(expandStageItem(id, false));
            });
            rmSess[0].in.forEach(id => {
                dispatch(updateAllocedlookup(id, false));
                dispatch(expandStageItem(id, false));
            });
            rmSess[0].post.forEach(id => {
                dispatch(updateAllocedlookup(id, false));
                dispatch(expandStageItem(id, false));
            });
        }
    }
};

export const updateAllocedlookup = (id, isAlloced) => (dispatch, getState) => {
    const {userPatts} = Config.get(getState(), instanceStateName);
    const {allocedLookup} = Config.get(getState(), sessionStateName);

    if(!id) {
        let payload = {allocedLookup: {}};
        dispatch({type: Action.UPDATE_ALLOCEDLOOKUP, payload});
        return;
    }

    let child = null;
    let result = {};
    userPatts.forEach(({patt}) => {
        let n = patt.first(n => n.model.id == id);
        if(n) child = n;
    });

    if(child)
        child.walk(n => {result[n.model.id] = n.model.id});

    let newAllocedLookup;
    if(isAlloced) {
        newAllocedLookup = Object.assign({}, allocedLookup, result);
    } else {
        newAllocedLookup = Object.assign({}, allocedLookup);
        Object.keys(result).forEach(k => delete newAllocedLookup[k]);
    }

    if(child) {
        let parent = child.parent;
        if(!parent.isRoot()) {
            delete newAllocedLookup[parent.model.id];
            parent.walk(n => {
                if(n.model.id != parent.model.id) {
                    if(newAllocedLookup[n.model.id]) {
                        newAllocedLookup[parent.model.id] = parent.model.id;
                        return false;
                    }
                }
            });
        }
    }

    let payload = {allocedLookup: newAllocedLookup};
    dispatch({type: Action.UPDATE_ALLOCEDLOOKUP, payload});
}

export const refreshAllocedlookup = () => (dispatch, getState) => {
    const {data} = Config.get(getState(), sessionStateName);
    dispatch(updateAllocedlookup());
    data.forEach(d => {
        d.pre.forEach(id => dispatch(updateAllocedlookup(id, true)));
        d.in.forEach(id => dispatch(updateAllocedlookup(id, true)));
        d.post.forEach(id => dispatch(updateAllocedlookup(id, true)));
    });
}

export const addStageItem = (sessId, stageType, pattId, pos=null) => (dispatch, getState) => {
    const {userPatts} = Config.get(getState(), instanceStateName);
    let isRoot = false;
    let pattRoot = null;
    userPatts.forEach(({patt}) => {
        if(patt.model.id == pattId) {
            isRoot = true;
            pattRoot = patt;
        }
    });
    let pattIds;
    if(isRoot) {
        const {sequenceMap} = pattRoot.model;
        pattIds = Object.keys(sequenceMap)
            .sort((a, b) => sequenceMap[a] - sequenceMap[b]);
    } else {
        pattIds = [pattId];
    }

    const appState = Config.get(getState(), appStateName);
    const sessState = Config.get(getState(), sessionStateName);
    let data = sessState.data.slice();
    let idx;
    let sess = JSON.parse(JSON.stringify(data.filter((d, i) => {
        if(d.id == sessId) {
            idx = i;
            return true
        }
    })[0]));
    data[idx] = sess;
    let stages = sess[stageType];
    if(pos == null) {
        pattIds.forEach(id => stages.push(id));
    } else {
        let tmpPos = pos;
        pattIds.forEach(id => stages.splice(tmpPos++, 0, id));
    }
    let obsSessIds = [sessId];
    let payload = {data, obsSessIds};
    dispatch({type: Action.ADD_STAGE_ITEM, payload});
    if(!appState.readDesignOnly) pattIds.forEach(id => dispatch(updateAllocedlookup(id, true)));
};

export const removeStageItem = (sessId, stageType, pattId) => (dispatch, getState) => {
    const appState = Config.get(getState(), appStateName);
    const sessState = Config.get(getState(), sessionStateName);
    let data = sessState.data.slice();
    let idx;
    let sess = JSON.parse(JSON.stringify(data.filter((d, i) => {
        if(d.id == sessId) {
            idx = i;
            return true
        }
    })[0]));
    data[idx] = sess;
    let stages = sess[stageType];
    let rmPos = stages.indexOf(pattId);
    if(rmPos != -1) {
        stages.splice(rmPos, 1);
        let obsSessIds = [sessId];
        let payload = {data, obsSessIds};
        dispatch({type: Action.REMOVE_STAGE_ITEM, payload});
        if(!appState.readDesignOnly) {
            dispatch(updateAllocedlookup(pattId, false));
            dispatch(expandStageItem(pattId, false));
        }
    }
};

export const removeAllStageItem = sessId => (dispatch, getState) => {
    const appState = Config.get(getState(), appStateName);
    const sessState = Config.get(getState(), sessionStateName);
    let data = sessState.data.slice();
    let idx;
    let sess = JSON.parse(JSON.stringify(data.filter((d, i) => {
        if(d.id == sessId) {
            idx = i;
            return true
        }
    })[0]));
    data[idx] = sess;
    sess[StageType.PRE].forEach(pattId => {
        if(!appState.readDesignOnly) {
            dispatch(updateAllocedlookup(pattId, false));
            dispatch(expandStageItem(pattId, false));
        }
    });
    sess[StageType.IN].forEach(pattId => {
        if(!appState.readDesignOnly) {
            dispatch(updateAllocedlookup(pattId, false));
            dispatch(expandStageItem(pattId, false));
        }
    });
    sess[StageType.POST].forEach(pattId => {
        if(!appState.readDesignOnly) {
            dispatch(updateAllocedlookup(pattId, false));
            dispatch(expandStageItem(pattId, false));
        }
    });
    sess[StageType.PRE] = [];
    sess[StageType.IN] = [];
    sess[StageType.POST] = [];
    let obsSessIds = [sessId];
    let payload = {data, obsSessIds};
    dispatch({type: Action.REMOVE_ALL_STAGE_ITEM, payload});
};

export const moveStageItem = (oldSessId, oldStageType, newSessId, newStageType, pattId) => (dispatch, getState) => {
    dispatch(removeStageItem(oldSessId, oldStageType, pattId));
    dispatch(addStageItem(newSessId, newStageType, pattId));
}

export const reorderStageItem = (sessId, stageType, oldPos, newPos) => (dispatch, getState) => {
    if(oldPos == newPos) return;
    const state = Config.get(getState(), sessionStateName);
    let data = state.data.slice();
    let idx;
    let sess = JSON.parse(JSON.stringify(data.filter((d, i) => {
        if(d.id == sessId) {
            idx = i;
            return true
        }
    })[0]));
    data[idx] = sess;
    let stages = sess[stageType];
    let item = stages[oldPos];
    stages.splice(oldPos, 1);
    stages.splice(newPos, 0, item);
    let obsSessIds = [sessId];
    let payload = {data, obsSessIds};
    dispatch({type: Action.REORDER_STAGE_ITEM, payload});
}

export const clearStageItemByNode = node => (dispatch, getState) => {
    let ids = [];
    node.walk(n => {ids.push(n.model.id)});
    dispatch(clearStageItemByIds(ids));
}

export const clearStageItemByIds = ids => (dispatch, getState) => {
    const state = Config.get(getState(), sessionStateName);
    let clearStages = stages => {
        let cleared = false;
        ids.forEach(id => {
            let rmPos = stages.indexOf(id);
            if(rmPos != -1) {
                stages.splice(rmPos, 1);
                cleared = true;
            };
        });
        return {cleared, stages};
    };
    let data = JSON.parse(JSON.stringify(state.data));
    let obsSessIds = [];
    let hasChange = false;
    data.forEach((d, i) => {
        let isAllCleared = false;
        let cleared, stages, result;
        result = clearStages(d.pre);
        d.pre = result.stages; isAllCleared = result.cleared || isAllCleared;
        result = clearStages(d.in);
        d.in = result.stages; isAllCleared = result.cleared || isAllCleared;
        result = clearStages(d.post);
        d.post = result.stages; isAllCleared = result.cleared || isAllCleared;
        if(isAllCleared) {
            obsSessIds.push(d.id);
            hasChange = true;
        }
    });
    if(hasChange) {
        let payload = {data, obsSessIds};
        dispatch({type: Action.CLEAR_STAGE_ITEM, payload});
    }
};

export const expandStageItem = (pattId, expanded) => (dispatch, getState) => {
    const state = Config.get(getState(), sessionStateName);
    let compositeExpanded = Object.assign({}, state.compositeExpanded);
    if(expanded)
        compositeExpanded[pattId] = true;
    else
        delete compositeExpanded[pattId];
    let payload = {compositeExpanded};
    dispatch({type: Action.EXPAND_STAGE_ITEM, payload});
};

export const updateFilter = (id, isSet) => (dispatch, getState) => {
    const {userPatts} = Config.get(getState(), instanceStateName);
    const state = Config.get(getState(), sessionStateName);
    let filter;
    if(id == FilterType.REFRESH) {
        filter = Object.assign({}, state.filter);
        let rootIds = [];
        userPatts.forEach(({patt}) => {
            if(patt.children.length > 0)
                rootIds.push(patt.model.id);
        });
        Object.keys(filter)
            .filter(id => id != FilterType.ALL)
            .forEach(id => {
                if(rootIds.indexOf(id) == -1)
                    delete filter[id];
            });
        let keys = Object.keys(filter);
        if(keys.length == 0) filter[FilterType.ALL] = FilterType.ALL;
        if((keys.length == 0 || keys.indexOf(FilterType.ALL) != -1) && rootIds.length > 0)
            rootIds.forEach(id => filter[id] = id);
    } else if(id == FilterType.ALL) {
        if(isSet) {
            filter = {[FilterType.ALL]: FilterType.ALL};
            userPatts.forEach(({patt}) => filter[patt.model.id] = patt.model.id);
        } else {
            filter = {};
            delete filter[FilterType.ALL];
        }
    } else {
        if(isSet) {
            filter = Object.assign({}, state.filter, {[id]: id});
            let isAllExists = true;
            userPatts.forEach(({patt}) => {
                if(filter[patt.model.id] == undefined) isAllExists = false;
            });
            if(isAllExists) filter.all = FilterType.ALL;
        } else {
            filter = Object.assign({}, state.filter);
            delete filter[id];
            delete filter[FilterType.ALL];
        }
    }
    let payload = {filter};
    dispatch({type: Action.UPDATE_FILTER, payload});
}

export const expandFilterItem = (id, expanded) => (dispatch, getState) => {
    const state = Config.get(getState(), sessionStateName);
    let filterExpanded = Object.assign({}, state.filterExpanded);
    if(expanded)
        filterExpanded[id] = true;
    else
        delete filterExpanded[id];
    let payload = {filterExpanded};
    dispatch({type: Action.EXPAND_FILTER_ITEM, payload});
};

export const loadDetails = sessId => (dispatch, getState) => {
    let payload = {editSessId: sessId};
    dispatch({type: Action.LOAD_DETAILS, payload});
};

export const fieldChange = field => (dispatch, getState) => {
    const state = Config.get(getState(), sessionStateName);
    let data = state.data.slice();
    let pos = data.map(d => d.id).indexOf(state.editSessId);
    data[pos] = Object.assign({}, data[pos], field);
    let obsSessIds = [state.editSessId];
    let payload = {data, obsSessIds};
    dispatch({type: Action.FIELD_CHANGE, payload});
};

export const rememberScroll = ({scrollTop, scrollInnerLeft, scrollInnerTop}) => (dispatch, getState) => {
    const state = Config.get(getState(), sessionStateName);
    let payload = {
        scrollTop: scrollTop != null && scrollTop != undefined ? scrollTop : state.scrollTop,
        scrollInnerLeft: scrollInnerLeft != null && scrollInnerLeft != undefined ? scrollInnerLeft : state.scrollInnerLeft,
        scrollInnerTop: scrollInnerTop != null && scrollInnerTop != undefined ? scrollInnerTop : state.scrollInnerTop,
    };
    dispatch({type: Action.REMEMBER_SCROLL, payload});
};

export const importContent = srcSessions => (dispatch, getState) => {
    const {courseId, uuidv5Namespace, importDesign} = Config.get(getState(), appStateName);
    let idMap = Object.assign({}, importDesign.idMap);
    let handler = new DataHandler;
    let sessions = handler.importClone(srcSessions, {courseId, uuidv5Namespace}, idMap);
    let content = Object.assign({}, importDesign.content, {sessions});
    dispatch(importContentReady({content, idMap}));
}

export const partialUpdate = sessions => (dispatch, getState) => {
    sessions = JSON.parse(JSON.stringify(sessions));
    const state = Config.get(getState(), sessionStateName);
    let data = state.data.slice();
    data = data.map((d, i) => {
        d.pos = i;
        return d;
    })
    .map(d => {
        if(sessions[d.id]) {
            let s = sessions[d.id];
            s.id = d.id;
            delete sessions[d.id];
            return s;
        } else {
            return d;
        }
    });

    Object.keys(sessions)
        .map(k => {
            let s = sessions[k];
            s.id = k;
            return s;
        })
        .forEach(s => data.push(s));

    data.sort((a, b) => a.pos - b.pos)
        .forEach(d => delete d.pos);

    let payload = {data};
    dispatch({type: Action.PARTIAL_UPDATE, payload});
}

export const partialDelete = ids => (dispatch, getState) => {
    ids.forEach(id => dispatch(removeSession(id)));
}

export const autofillUtcDate = (sessId, date) => (dispatch, getState) => {
    const state = Config.get(getState(), sessionStateName);
    let found = false;
    let currDate = moment(date);
    let restoreSessId = sessId;
    let needRestore = false;
    state.data.filter(d => d.stage == StageType.IN)
        .forEach(d => {
            if(found) {
                needRestore = true;
                currDate.day(currDate.day()+7);
                dispatch(loadDetails(d.id));
                dispatch(fieldChange({utcDate: currDate.toISOString()}))
            }
            if(!found && d.id == sessId) found = true;
        });
    if(needRestore) dispatch(loadDetails(sessId));
}
