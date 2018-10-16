import {Config} from 'js/util';

const createActions = function(Action, stateName) {
   this.actions = {
       reset: () => ({type: Action.RESET}),

       freshPanel: (panel, opts={}) => (dispatch, getState) => {
           let currPanel = {panel, opts};
           let panels = [currPanel];
           let payload = {currPanel, panels};
           dispatch({type: Action.FRESH_PANEL, payload});
       },

       pushPanel: (panel, opts={}) => (dispatch, getState) => {
           const state = Config.get(getState(), stateName);
           let panels = state.panels.slice();
           let currPanel = {panel, opts};
           panels.push(currPanel);
           let payload = {currPanel, panels};
           dispatch({type: Action.PUSH_PANEL, payload});
       },

       pushPanels: panels => (dispatch, getState) => {
           const state = Config.get(getState(), stateName);
           panels.forEach(({panel, opts}) => dispatch(self.pushPanel(panel, opts)));
       },

       popPanel: () => (dispatch, getState) => {
           const state = Config.get(getState(), stateName);
           let panels = state.panels.slice();
           panels.pop();
           let currPanel = panels.length > 0 ? panels[panels.length-1] : null;
           let payload = {currPanel, panels};
           dispatch({type: Action.POP_PANEL, payload});
       },

       jumpToPanel: panel => (dispatch, getState) => {
           const state = Config.get(getState(), stateName);
           let panels = state.panels.slice();
           let idx;
           panels.forEach((p, i) => {
               if(p.panel == panel) idx = i;
           });
           panels.splice(idx+1);
           let currPanel = panels[panels.length-1];
           let payload = {currPanel, panels};
           dispatch({type: Action.JUMP_TO_PANEL, payload});
       },
   };
   const self = this.actions;
   return self;
};

export default (...args) => new createActions(...args);
