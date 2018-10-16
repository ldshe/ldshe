import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactDOM from 'react-dom';
import {Config} from 'js/util';
import {loadPatternCollectionListPopup, loadPatternCollectionPreview, importPattern} from 'react/app/design/actions' ;
import {ListType} from 'react/design/pattern_list/types';
import {StateName as PatternStateName} from '../../design_panel/types';
import {StateName as ImportStateName} from '../types';
import {freshPanel, pushPanel, popPanel, jumpToPanel, reset as modalReset, rememberScroll} from '../actions/modal';
import {reset as exportReset, exportPattern} from '../actions/export';
import ModalLayout from '../components/modal_layout';
import PatternList from '../components/pattern_list';
import PatternPreview from '../components/pattern_preview';

class PublicImport extends Component {

    constructor(props, context) {
        super(props, context);
        this.show = this.show.bind(this);
        this.onLoadList = this.onLoadList.bind(this);
        this.onLoadPreview = this.onLoadPreview.bind(this);
        this.renderPatternList = this.renderPatternList.bind(this);
        this.renderPatternPreview = this.renderPatternPreview.bind(this);
    }

    show() {
        this.modalLayout.show();
    }

    onLoadList() {
        const {loadPatternListPopup} = this.props;
        loadPatternListPopup();
    }

    onLoadPreview(id) {
        const {loadPatternPreview} = this.props;
        loadPatternPreview(id);
    }

    renderPatternList() {
        const {modal, globalPattern} = this.props;
        const {currPanel} = modal;
        const {pushPanel, popPanel, imexportPattern, rememberScroll} = this.props;
        let props = Object.assign({}, currPanel.opts, {
            modal,
            globalPattern,
            imexportName: 'Import',
            imexportBtnClsName: 'btn-success',
            pushPanel,
            popPanel,
            imexportPattern,
            rememberScroll,
            loadList: this.onLoadList,
        });
        return <PatternList {...props}/>;
    }

    renderPatternPreview() {
        const {modal, globalPattern} = this.props;
        const {currPanel} = modal;
        const {pushPanel, popPanel, imexportPattern} = this.props;
        let props = Object.assign({}, currPanel.opts, {
            modal,
            globalPattern,
            imexportName: 'Import',
            imexportBtnClsName: 'btn-success',
            popPanel,
            imexportPattern,
            loadPreview: this.onLoadPreview,
        });
        return <PatternPreview {...props}/>;
    }

    render() {
        const {modal} = this.props;
        const {jumpToPanel, reset} = this.props;
        const props = {
            title: 'Public Patterns',
            modal,
            modalClsName: 'import',
            jumpToPanel,
            reset,
            renderPatternList: this.renderPatternList,
            renderPatternPreview: this.renderPatternPreview,
        };
        return <ModalLayout ref={layout => this.modalLayout = layout} {...props}/>;
    }
};

const mapStateToProps = state => ({
    modal: Config.get(state, ImportStateName.LEARNING_UNIT_IMEXPORT_MODAL),
    globalPattern: Config.get(state, ImportStateName.LEARNING_UNIT_IMEXPORT_PATTERN),
});

const mapDispatchToProps = dispatch => ({
    freshPanel: (p, opts) => dispatch(freshPanel(p, opts)),
    pushPanel: (p, opts) => dispatch(pushPanel(p, opts)),
    popPanel: () => dispatch(popPanel()),
    jumpToPanel: p => dispatch(jumpToPanel(p)),
    reset: () => {
        dispatch(exportReset());
        dispatch(modalReset());
    },
    loadPatternListPopup: () => dispatch(loadPatternCollectionListPopup(ListType.PUBLIC)),
    loadPatternPreview: collectId => dispatch(loadPatternCollectionPreview(collectId)),
    imexportPattern: id => dispatch(importPattern(id)),
    rememberScroll: scrollTop => dispatch(rememberScroll(scrollTop)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(PublicImport);
