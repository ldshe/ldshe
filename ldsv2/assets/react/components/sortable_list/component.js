import classnames from 'classnames';
import React, {Component} from 'react';

export default class Sortablelist extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderItemControl = this.renderItemControl.bind(this);
        this.renderBody = this.renderBody.bind(this);
        this.renderFooterControl = this.renderFooterControl.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
    }

    renderHeader() {
        const {headerCols} = this.props;
        return (
            <thead>
                <tr>
                    <th className="col-seq">{' '}</th>
                    {headerCols}
                    <th className="col-control">{' '}</th>
                </tr>
            </thead>
        );
    }

    renderItemControl(pos, id) {
        const {bodyRows, controlClassName} = this.props;
        const {renderControlEls, onAddItem, onRemoveItem, onMoveItem} = this.props;
        const ctrlClsName = classnames(Object.assign({}, controlClassName || {'btn-default': true, 'btn-sm': true}, {'btn' : true}));
        const controlEls = renderControlEls ? renderControlEls(pos, id) : [];
        return (
            <div className="btn-toolbar">
                <button type="button" className={ctrlClsName} title="Add" onClick={e => onAddItem(e, pos+1)}>
                    <i className="fa fa-plus"></i>
                </button>
                <button type="button" className={ctrlClsName} title="Remove" onClick={e => onRemoveItem(e, pos, id)}>
                    <i className="fa fa-trash"></i>
                </button>
                <button type="button" className={ctrlClsName} title="Move up" disabled={pos == 0} onClick={e => onMoveItem(e, pos, pos-1)}>
                    <i className="fa fa-arrow-up"></i>
                </button>
                <button type="button" className={ctrlClsName} title="Move down" disabled={pos+1 == bodyRows.length} onClick={e => onMoveItem(e, pos, pos+1)}>
                    <i className="fa fa-arrow-down"></i>
                </button>
                {controlEls.map(el => React.cloneElement(el, {className: ctrlClsName}))}
            </div>
        );
    }

    renderBody() {
        const {headerCols, bodyRows, emptyMessage} = this.props;
        const {onAddItem} = this.props;
        let rows = bodyRows;
        if(rows.length == 0) {
            rows.push({
                id: 'empty',
                el: <td className="empty">{emptyMessage}</td>,
            });
        }
        return (
            <tbody>{
                rows.map((row, i) =>
                    row.id == 'empty' ?
                    <tr key={row.id}>
                        {React.cloneElement(row.el, {colSpan: headerCols.length+2})}
                    </tr> :
                    <tr key={row.id}>
                        <td className="col-seq">{i+1}</td>
                        {row.els}
                        <td className="col-control">{this.renderItemControl(i, row.id)}</td>
                    </tr>)
            }</tbody>
        );
    }

    renderFooterControl() {
        const {onAddItem} = this.props;
        return (
            <div className="btn-toolbar pull-right">
                <button type="button" className="btn btn-primary" title="Add" onClick={e => onAddItem(e, -1)}>
                    <i className="fa fa-plus"></i>
                </button>
            </div>
        );
    }

    renderFooter() {
        const {headerCols, bodyRows, footerCols} = this.props;
        const isEmpty = bodyRows.length > 0 && bodyRows[0].id == 'empty';
        return (
            <tfoot>{
                isEmpty ?
                <tr>
                    <td colSpan={headerCols.length+2}>{this.renderFooterControl()}</td>
                </tr> :
                    footerCols ?
                    <tr>
                        <td>{' '}</td>
                        {footerCols}
                        <td>{this.renderFooterControl()}</td>
                    </tr> :
                    <tr>
                        <td colSpan={headerCols.length+1}></td>
                        <td>{this.renderFooterControl()}</td>
                    </tr>
            }</tfoot>
        );
    }

    render() {
        const {className, tableClassName} = this.props;
        const clsName = classnames(Object.assign({}, className || {}, {'sortable-list': true}));
        const tabClsName = classnames(Object.assign({}, tableClassName || {}, {'table': true, 'table-condensed': true}));
        return (
            <div className={clsName}>
                <table className={tabClsName}>
                    {this.renderHeader()}
                    {this.renderBody()}
                    {this.renderFooter()}
                </table>
            </div>
        );
    }
}
