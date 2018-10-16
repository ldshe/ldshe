export const initStep = {
    total: 1,
    max: 1,
    current: 1,
};

const createReducers = (Action, initState) => ({
    step: (state = initState ? initState : initStep, action) => {
        switch (action.type) {
            case Action.RESET: {
                let state = initState ? initState : initStep;
                return Object.assign({}, state);
            }

            case Action.NEXT: {
                const {current, max} = action.payload;
                return Object.assign({}, state, {
                    current,
                    max,
                });
            }

            case Action.BACK: {
                const {current} = action.payload;
                return Object.assign({}, state, {
                    current,
                });
            }

            case Action.JUMP_TO: {
                const {current} = action.payload;
                return Object.assign({}, state, {
                    current,
                });
            }

            default:
                return state;
        }
    },
});

export default createReducers;
