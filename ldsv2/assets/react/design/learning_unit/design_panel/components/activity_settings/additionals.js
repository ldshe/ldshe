import classnames from 'classnames';
import ReactDOM from 'react-dom';
import React, {Component} from 'react';
import SortableList from 'react/components/sortable_list';
import StackedPanel from 'react/components/stacked_panel/component';
import {Panel, PanelType, AdditionalSettings} from '../../types';
import UnitContext from '../../context';
import {validateUrlForm} from './validator';
import AdditionalUrl from './additional_url';
import AdditionalFile from './additional_file';
import AdditionalUrlForm from './additional_url_form';
import AdditionalFileForm from './additional_file_form';

export default class Additionals extends Component {

    constructor(props, context) {
        super(props, context);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.refreshSelectize = this.refreshSelectize.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.onAddItem = this.onAddItem.bind(this);
        this.onEditItem = this.onEditItem.bind(this);
        this.onRemoveItem = this.onRemoveItem.bind(this);
        this.onMoveItem = this.onMoveItem.bind(this);
        this.onFieldChange = this.onFieldChange.bind(this);
        this.onUploadFile = this.onUploadFile.bind(this);
        this.onDone = this.onDone.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.handleEditItem = this.handleEditItem.bind(this);
        this.renderAddForm = this.renderAddForm.bind(this);
        this.renderHeaderCols = this.renderHeaderCols.bind(this);
        this.renderBodyRows = this.renderBodyRows.bind(this);
        this.renderControlEls = this.renderControlEls.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.renderItemList = this.renderItemList.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.state = {
            addType: AdditionalSettings.URL,
            pos: null,
        };
        this.newItemAdded = false;
        this.editForm = null;
    }

    componentDidMount() {
        const {resetAdditionalSettingsPanel}= this.props;
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.on('hide.bs.modal', e => resetAdditionalSettingsPanel());
    }

    componentDidUpdate() {
        const {node, name, value} = this.props;
        if(this.newItemAdded) {
            let nextData = node.model['additional'+name.capitalize()][value];
            let pos = nextData.data.length-1;
            setTimeout(() => this.handleEditItem(pos, nextData.data[pos].id), 0);
            this.newItemAdded = false;
        }
    }

    componentWillUnmount() {
        this.hide();
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.off('hide.bs.modal');
    }

    show() {
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('show');
    }

    hide() {
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('hide');
    }

    refreshSelectize() {
        const {node, name, value} = this.props;
        $(`#ud-act-${name} + .selectize-control > .selectize-input`)
            .find('.item')
            .each(function() {
                if($(this).attr('data-value') == value) {
                    let hasAdds = node.model['additional'+name.capitalize()][value] &&
                        node.model['additional'+name.capitalize()][value].data.length > 0;
                    if(hasAdds)
                        $(this).addClass('hasAdds');
                    else
                        $(this).removeClass('hasAdds');
                }
            });
    }

    onDelete(e) {
        e.preventDefault();
        const {node, name, value} = this.props;
        const {removeAllAdditionalSettings, getAlertify} = this.props;
        const alertify = getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => {
                removeAllAdditionalSettings({
                    id: node.model.id,
                    field: name,
                    value,
                });
                this.hide();
                setTimeout(() => {
                    this.refreshSelectize();
                    let $selectize = $(`#ud-act-${name}`).selectize();
                    $selectize[0].selectize.removeItem(value);
                }, 0);
            },
            title: `DELETE SETTING "${value}"`,
            subTitle: 'All additional items for this setting will also be deleted.',
        });
    }

    onTypeChange(e) {
        e.preventDefault();
        this.setState({
            addType: e.target.value,
        });
    }

    onAddItem(e) {
        e.preventDefault();
        const {node, name, value} = this.props;
        const {addAdditionalSettings, isReadOnly} = this.props;
        if(isReadOnly()) return;
        let type = this.state.addType;
        let nodeArgs = {
            id: node.model.id,
            field: name,
            value,
        };
        let itemArgs = {type, pos: -1};
        addAdditionalSettings(nodeArgs, itemArgs);
        this.newItemAdded = true;
        setTimeout(() => this.refreshSelectize(), 0);
    }

    onEditItem(e, pos, id) {
        e.preventDefault();
        this.handleEditItem(pos, id);
    }

    onRemoveItem(e, pos, id) {
        e.preventDefault();
        const {node, name, value} = this.props;
        const {removeAdditionalSettings, getAlertify} = this.props;
        let nodeArgs = {
            id: node.model.id,
            field: name,
            value,
        };
        let itemArgs = {pos};

        const alertify = getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => {
                removeAdditionalSettings(nodeArgs, itemArgs);
                setTimeout(() => this.refreshSelectize(), 0);
            },
            title: 'DELETE ITEM',
            subTitle: 'This action cannot be undone.',
        });
    }

    onMoveItem(e, prevPos, newPos) {
        e.preventDefault();
        const {node, name, value} = this.props;
        const {moveAdditionalSettings} = this.props;
        let nodeArgs = {
            id: node.model.id,
            field: name,
            value,
        };
        let itemArgs = {prevPos, newPos};
        moveAdditionalSettings(nodeArgs, itemArgs);
    }

    onFieldChange(pos, field) {
        const {node, name, value} = this.props;
        const {updateAdditionalSettings} = this.props;
        let nodeArgs = {
            id: node.model.id,
            field: name,
            value,
        };
        let itemArgs = {pos, field};
        updateAdditionalSettings(nodeArgs, itemArgs);
    }

    onUploadFile(file) {
        const {uploadFile} = this.props;
        uploadFile(file);
    }

    onDone(e) {
        e.preventDefault();
        const {popAdditionalSettingsPanel, isReadOnly} = this.props;
        if(isReadOnly()) {
            popAdditionalSettingsPanel()
            return;
        }
        if(this.editForm.validateAll())
            popAdditionalSettingsPanel();
    }

    onCancel(e) {
        e.preventDefault();
        const {additional} = this.props;
        const {popAdditionalSettingsPanel, isReadOnly, getAlertify} = this.props;
        if(isReadOnly()) {
            popAdditionalSettingsPanel()
            return;
        }
        if(additional.activityFieldChanged || !this.editForm.validateAll()) {
            const alertify = getAlertify();
            alertify.confirm({
                okLabel: 'LEAVE ANYWAY',
                cancelLabel: 'STAY',
                iconClass: 'fa-exclamation-triangle danger',
                confirmAction: () => {
                    const {node, name, value} = this.props;
                    let nodeArgs = {
                        id: node.model.id,
                        field: name,
                        value,
                    };
                    let itemArgs = {
                        pos: this.editForm.props.pos,
                        validateAll: this.editForm.validateAll,
                    };
                    popAdditionalSettingsPanel(nodeArgs, itemArgs);
                },
                title: 'LEAVE WITHOUT SAVE',
                subTitle: 'Changes you made may not be saved. Please fill in all required items and click "Done" button before you leave.',
            });
        } else {
            popAdditionalSettingsPanel();
        }
    }

    handleEditItem(pos, id) {
        const {node, name, value} = this.props;
        const {pushAdditionalSettingsPanel} = this.props;
        this.setState({pos});
        let d = node.model['additional'+name.capitalize()][value].data[pos];
        let props = {
            title: `Item ${pos+1}`,
            pos,
            initSettings: d,
        };
        switch(d.type) {
            case AdditionalSettings.URL: {
                props.subTitle = 'URL';
                pushAdditionalSettingsPanel(Panel.ADDITIONAL_SETTINGS_URL, props);
                return;
            }

            case AdditionalSettings.FILE: {
                props.subTitle = 'File';
                pushAdditionalSettingsPanel(Panel.ADDITIONAL_SETTINGS_FILE, props);
                return;
            }
        }
    }

    renderAddForm() {
        const {addType} = this.state;
        return (
            <form className="as-add" autoComplete="off" onSubmit={e => e.preventDefault()}>
                <div className="form-group row">
                    <div className="col-xs-12 col-sm-6 row pull-right">
                        <div className="col-xs-12">
                            <label htmlFor="ud-as-type" className="control-label-sm">New Item</label>
                        </div>
                        <div className="col-xs-9">
                            <select id="ud-as-type" className="form-control input-sm pull-right" defaultValue={addType || AdditionalSettings.URL} onChange={this.onTypeChange}>
                                <option value={AdditionalSettings.URL}>{'\uf0c1 URL'}</option>
                                <option value={AdditionalSettings.FILE}>{'\uf016 File'}</option>
                            </select>
                        </div>
                        <div className="col-xs-3">
                            <button className="btn btn-sm btn-primary pull-right" onClick={this.onAddItem}>
                                <i className="fa fa-plus"></i> Add
                            </button>
                        </div>
                    </div>

                </div>
            </form>
        );
    }

    renderHeaderCols() {
        let headerMeta = [
            {name: 'Item', className: 'col-item', tooltip: 'Item'},
        ];
        let headerCols = headerMeta.map((m, i) => {
            let props = {
                key: m.name,
                className: m.className,
            }
            return <th {...props}>{m.name}</th>;
        });
        return headerCols;
    }

    renderBodyRows() {
        const {node, name, value} = this.props;
        if(!node || !name || !value) return [];
        const data = node.model['additional'+name.capitalize()][value] ?
            node.model['additional'+name.capitalize()][value].data :
            [];
        let bodyRows = [];
        if(data.length > 0) {
            let bodyMeta = [
                {className: 'col-item'},
            ];
            bodyRows = data.map((d, i) => {
                return {
                    id: d.id,
                    els: <td className={bodyMeta[0].className}>{this.renderItem(d, i)}</td>,
                }
            });
        }
        return bodyRows;
    }

    renderControlEls(pos, id) {
        return [
            <button key={id} type="button" title="Edit" onClick={e => this.onEditItem(e, pos, id)}>
                <i className="fa fa-pencil" ></i>
            </button>
        ];
    }

    renderItem(d, pos) {
        switch(d.type) {
            case AdditionalSettings.URL: {
                return <AdditionalUrl {...d}/>;
            }

            case AdditionalSettings.FILE: {
                return <AdditionalFile {...d}/>;
            }
        }
    }

    renderItemList() {
        const props = {
            tableClassName: {'table-sm': true},
            controlClassName: {'btn-default': true, 'btn-xs': true},
            headerCols: this.renderHeaderCols(),
            bodyRows: this.renderBodyRows(),
            renderControlEls: this.renderControlEls,
            onAddItem: this.onAddItem,
            onRemoveItem: this.onRemoveItem,
            onMoveItem: this.onMoveItem,
            emptyMessage: 'Please add a new Item',
        }
        return (
            <div className="row">
                <div className=" col-xs-12">
                    <SortableList {...props}/>
                </div>
            </div>
        );
    }

    renderContent({pushHistBlockMsg, popHistBlockMsg}) {
        const {currPanel} = this.props.additional.additionalSettingsPanel;
        if(!currPanel) return null;

        switch(currPanel.panel) {
            case Panel.ADDITIONAL_SETTINGS_LIST: {
                return (
                    <div>
                        <button type="button" className="btn btn-sm btn-danger pull-right" onClick={this.onDelete}>Delete</button>
                        {this.renderItemList()}
                        {this.renderAddForm()}
                    </div>
                );
            }

            case Panel.ADDITIONAL_SETTINGS_URL:
            case Panel.ADDITIONAL_SETTINGS_FILE: {
                const {node, name, value} = this.props;
                const {popAdditionalSettingsPanel, isReadOnly} = this.props;
                const {opts} = currPanel;
                let d = node.model['additional'+name.capitalize()][value];
                if(d) d = d.data[this.state.pos];
                let props = {
                    popAdditionalSettingsPanel,
                    onFieldChange: this.onFieldChange,
                    pushHistBlockMsg,
                    popHistBlockMsg,
                    isReadOnly,
                }
                switch(currPanel.panel) {
                    case Panel.ADDITIONAL_SETTINGS_URL: {
                        return <AdditionalUrlForm ref={form => this.editForm = form} {...opts} {...d} {...props}/>;
                    }

                    case Panel.ADDITIONAL_SETTINGS_FILE: {
                        const {isReadOnly, fileState, uploadFile} = this.props;
                        props = Object.assign({}, props, {
                            isReadOnly,
                            fileState,
                            onUploadFile: this.onUploadFile,
                        });
                        return <AdditionalFileForm ref={form => this.editForm = form} {...opts} {...d} {...props}/>;
                    }
                }
            }
        }
    }

    render() {
        const {value, additional} = this.props;
        const {jumpToAdditionalSettingsPanel} = this.props;
        const {panels, currPanel} = additional.additionalSettingsPanel;
        let title = value || '';
        let props = {
            panels,
            panelType: PanelType,
            currPanel,
            jumpToPanel: jumpToAdditionalSettingsPanel,
        };
        return (
            <div ref={modal => this.modal = modal} className="ud-as modal fade" tabIndex="-1" role="dialog" aria-labelledby="additionals-modal" data-backdrop="static" data-keyboard="false">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="additionals-modal">{`Additional Items`}</h4>
                        </div>
                        <div className="modal-body">
                            <StackedPanel {...props}>
                                <UnitContext.Consumer>{ctx => this.renderContent(ctx)}</UnitContext.Consumer>
                            </StackedPanel>
                        </div>
                        {
                            currPanel ?
                            (
                                currPanel.panel == Panel.ADDITIONAL_SETTINGS_LIST ?
                                (
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                    </div>
                                ) :
                                (
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" onClick={this.onCancel}>Cancel</button>
                                        <button type="button" className="btn btn-primary" onClick={this.onDone}>Done</button>
                                    </div>
                                )
                            ) :
                            <div className="modal-footer"/>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
