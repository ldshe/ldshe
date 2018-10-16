import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Config} from 'js/util';
import StackedPanel from 'react/components/stacked_panel';
import {Panel, PanelType} from '../types';

export default class ModalLayout extends Component {

    constructor(props, context) {
        super(props, context);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.state ={
            hide: true,
        }
    }

    componentDidMount() {
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.on('shown.bs.modal', e => this.setState({hide: false}));
        $modal.on('hidden.bs.modal', e => this.hide());
    }

    componentWillUnmount() {
        const {reset} = this.props;
        reset();

        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('hide');
        $modal.off('shown.bs.modal');
        $modal.off('hidden.bs.modal');
        this.hide();
    }

    hide() {
        this.setState({hide: true})
        const {reset} = this.props;
        reset();
    }

    show() {
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('show');
    }

    renderContent() {
        const {hide} = this.state;
        if(hide) return null;

        const {currPanel} = this.props.modal;
        const {renderPatternList, renderPatternPreview} = this.props;
        switch(currPanel.panel) {
            case Panel.PATTERN_LIST:
                return renderPatternList();

            case Panel.PATTERN_PREVIEW:
                return renderPatternPreview();
        }
    }

    renderModal() {
        const {title, modalClsName} = this.props;
        const {panels, currPanel} = this.props.modal;
        const {jumpToPanel} = this.props;
        let clsName = classnames('modal fade settings', modalClsName);
        let props = {
            panels,
            panelType: PanelType,
            currPanel,
            jumpToPanel,
        };
        return (
            <div ref={modal => this.modal = modal} className={clsName} tabIndex="-1" role="dialog" aria-labelledby="ud-import-modal">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="ud-import-modal">{title}</h4>
                        </div>
                        <div className="modal-body">
                            <StackedPanel {...props}>
                                {this.renderContent()}
                            </StackedPanel>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.renderModal();
    }
}
