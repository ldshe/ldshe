import {Config} from 'js/util';

const createActions = (Action, stateName) => ({
    reset: () => ({type: Action.RESET}),

    restore: () => ({type: Action.RESTORE}),

    addItem: (pos, item) => (dispatch, getState) => {
        const state = Config.get(getState(), stateName);
        let data = [...state.data];
        if(pos == state.data.length || pos == -1)
            data.push(item);
        else
            data.splice(pos, 0, item);
        let payload = {data};
        dispatch({type: Action.ADD_ITEM, payload});
    },

    removeItem: pos => (dispatch, getState) => {
        const state = Config.get(getState(), stateName);
        let data;
        if(pos == 0 && state.data.length == 1) {
            data = [];
        }
        else {
            data = [...state.data];
            data.splice(pos, 1);
        }
        let payload = {data};
        dispatch({type: Action.REMOVE_ITEM, payload});
    },

    moveItem: (prevPos, newPos) => (dispatch, getState) => {
        const state = Config.get(getState(), stateName);
        let data = [...state.data];
        let item = data[prevPos];
        data.splice(prevPos, 1);
        data.splice(newPos, 0, item);
        let payload = {data};
        dispatch({type: Action.MOVE_ITEM, payload});
    },

    updateItemField: (pos, field) => (dispatch, getState) => {
        const state = Config.get(getState(), stateName);
        let data = [...state.data];
        data[pos] = Object.assign({}, data[pos], field);
        let payload = {data};
        dispatch({type: Action.UPDATE_ITEM_FIELD, payload});
    },
});

export default createActions;
