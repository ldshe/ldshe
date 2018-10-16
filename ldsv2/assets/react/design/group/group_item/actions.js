import createListActions from 'react/components/data_list/actions';
import {Action, StateName} from './types';

const stateName = StateName.GROUP_ITEM;

export const reset = () => ({type: Action.RESET});
