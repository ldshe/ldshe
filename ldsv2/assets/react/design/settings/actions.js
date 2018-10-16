const createActions = function(Action, stateName) {
    this.actions = {
        resetSettings: () => ({type: Action.RESET_SETTINGS}),
    };
    const self = this.actions;
    return self;
};

export default createActions;
