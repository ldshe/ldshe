import Import from './containers/import';
import Public from './containers/public_import';
import Export from './containers/export';

const Panel = {
    PatternImport: Import,
    PublicPatternImport: Public,
    PatternExport: Export,
};

export const {
    PatternImport,
    PublicPatternImport,
    PatternExport,
} = Panel;
