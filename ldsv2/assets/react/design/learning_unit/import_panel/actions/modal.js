import createActions from 'react/components/stacked_panel/actions';
import {ModalAction, StateName} from '../types';

export const rememberScroll = scrollTop => {
    let payload = {scrollTop};
    return {type: ModalAction.REMEMBER_SCROLL, payload};
};

export const {
    reset,
    popPanel,
    freshPanel,
    pushPanel,
    jumpToPanel,
} = createActions(ModalAction, StateName.LEARNING_UNIT_IMEXPORT_MODAL);
