export const initPanel = {
    panels: [],
    currPanel: null,
};

const createReducers = (Action, initState) => ({
    panel: (state = initState ? initState : initPanel, action) => {
        switch (action.type) {
            case Action.RESET: {
                let state = initState ? initState : initPanel;
                return Object.assign({}, state);
            }

            case Action.FRESH_PANEL:
            case Action.PUSH_PANEL:
            case Action.POP_PANEL:
            case Action.JUMP_TO_PANEL: {
                const {currPanel, panels} = action.payload;
                return Object.assign({}, state, {currPanel, panels});
            }

            default:
                return state;
        }
    },
});

export default createReducers;
