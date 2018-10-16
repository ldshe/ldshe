import {combineReducers} from 'redux';
import unit from './pedagogical_sequence/reducers';
import pattern from './design_panel/reducers/pattern';
import patternInstance from './design_panel/reducers/unit';
import imexportPattern from './import_panel/reducers/pattern';
import imexportModal from './import_panel/reducers/modal';

export const learningUnit = combineReducers({
    unit,
    pattern,
    patternInstance,
    imexportPattern,
    imexportModal,
});
