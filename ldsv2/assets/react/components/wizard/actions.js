import {Config} from 'js/util';

const createActions = (Action, stateName) => ({
    reset: () => ({type: Action.RESET}),

    stepNext: () => (dispatch, getState) => {
        const state = Config.get(getState(), stateName);
        let current = state.current + 1;
        current = current > state.total ? state.total : current;
        let max = current > state.max ? current : state.max;
        let payload = {current, max};
        dispatch({type: Action.NEXT, payload});
    },

    stepBack: () => (dispatch, getState) => {
        const state = Config.get(getState(), stateName);
        let current = state.current - 1;
        current = current < 1 ? 1 : current;
        let payload = {current};
        dispatch({type: Action.BACK, payload});
    },

    jumpTo: jStep => (dispatch, getState) => {
        const state = Config.get(getState(), stateName);
        let current;
        if(jStep > state.max || jStep < 1)
            current = state.current;
        else
            current = jStep;
        let payload = {current};
        dispatch({type: Action.JUMP_TO, payload});
    },
});

export default createActions;
