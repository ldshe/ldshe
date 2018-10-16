import Allocation from './allocation_panel/container';
import Edit from './edit_panel/container';
import Settings from './settings_panel/container';

const LearningSession = {
    AllocationPanel: Allocation,
    EditPanel: Edit,
    SettingsPanel: Settings,
};

export default LearningSession;

export const AllocationPanel = Allocation;

export const EditPanel = Edit;

export const SettingsPanel = Settings;
