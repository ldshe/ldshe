const initList = {
    data: [],
};

const createReducers = (Action, initState) => ({
    list: (state = initState ? initState : initList, action) => {
        switch (action.type) {
            case Action.RESET: {
                let state = initState ? initState : initList;
                return Object.assign({}, state);
            }

            case Action.RESTORE: {
                return state;
            }

            case Action.DATA_LOADED:
            case Action.ADD_ITEM:
            case Action.UPDATE_ITEM_FIELD:
            case Action.REMOVE_ITEM:
            case Action.MOVE_ITEM: {
                const {data} = action.payload;
                return Object.assign({}, state, {data});
            }

            default:
                return state;
        }
    },
});

export default createReducers;
