import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactDOM from 'react-dom';
import {Config} from 'js/util';
import {StateName as PatternStateName} from '../../design_panel/types';
import {StateName as ImportStateName} from '../types';
import {freshPanel, pushPanel, popPanel, jumpToPanel, reset as modalReset, rememberScroll} from '../actions/modal';
import {reset as exportReset, listLoaded, previewLoaded, exportPattern} from '../actions/export';
import ModalLayout from '../components/modal_layout';
import PatternList from '../components/pattern_list';
import PatternPreview from '../components/pattern_preview';

class Export extends Component {

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
        const {userPatts} = this.props.localPattern;
        const {listLoaded} = this.props;
        listLoaded(userPatts.map(({patt}) => patt.model));
    }

    onLoadPreview(id) {
        const {userPatts} = this.props.localPattern;
        const {previewLoaded} = this.props;
        let node = userPatts.filter(u => u.id == id)
            .map(({patt}) => patt)[0];
        previewLoaded(node);
    }

    renderPatternList() {
        const {modal, globalPattern} = this.props;
        const {currPanel} = modal;
        const {pushPanel, popPanel, imexportPattern, rememberScroll} = this.props;
        let props = Object.assign({}, currPanel.opts, {
            modal,
            globalPattern,
            imexportName: 'Export',
            imexportBtnClsName: 'btn-info',
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
            imexportName: 'Export',
            imexportBtnClsName: 'btn-info',
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
            title: ' Save to My Patterns',
            modal,
            modalClsName: 'export',
            jumpToPanel,
            reset,
            renderPatternList: this.renderPatternList,
            renderPatternPreview: this.renderPatternPreview,
        };
        return <ModalLayout ref={layout => this.modalLayout = layout} {...props}/>;
    }
};

const mapStateToProps = state => ({
    localPattern: Config.get(state, PatternStateName.LEARNING_UNIT_PATTERN),
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
    listLoaded: userPatts => dispatch(listLoaded(userPatts)),
    previewLoaded: patt => dispatch(previewLoaded(patt)),
    imexportPattern: id => dispatch(exportPattern(id)),
    rememberScroll: scrollTop => dispatch(rememberScroll(scrollTop)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(Export);
