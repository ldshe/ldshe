import Sequence from './pedagogical_sequence/container';
import Grid from './design_grid/container';
import {Unit, Pattern} from './design_panel';

const LearningUnit = {
    PedagogicalSequence: Sequence,
    DesignGrid: Grid,
    DesignUnit: Unit,
    DesignPattern: Pattern,
};

export default LearningUnit;

export const PedagogicalSequence = Sequence;

export const DesignGrid = Grid;

export const DesignUnit = Unit;

export const DesignPattern = Pattern;
