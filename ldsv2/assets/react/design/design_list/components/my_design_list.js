import classnames from 'classnames';
import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {EditTabType} from 'react/app/design/types';
import DataList from 'react/components/data_list';
import {Design as Settings} from 'react/design/settings';
import {SortDir, ColumnMeta, ListType} from '../types';

export default class MyDesignList extends Component {

    constructor(props, context) {
        super(props, context);
        this.onSort = this.onSort.bind(this);
        this.onNext = this.onNext.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onJumpTo = this.onJumpTo.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this.onFilter = this.onFilter.bind(this);
        this.onClearFilter = this.onClearFilter.bind(this);
        this.onChangeItemNum = this.onChangeItemNum.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onShowSettings = this.onShowSettings.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderItems = this.renderItems.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
    }

    onSort(e, idx) {
        e.preventDefault();
        const {handleSort} = this.props;
        handleSort(idx);
    }

    onRefresh(e) {
        e.preventDefault();
        const {handleRefresh} = this.props;
        handleRefresh(ListType.MY);
    }

    onNext(e) {
        e.preventDefault();
        const {handleNext} = this.props;
        handleNext();
    }

    onBack(e) {
        e.preventDefault();
        const {handleBack} = this.props;
        handleBack();
    }

    onJumpTo(e, page) {
        e.preventDefault();
        const {handleJumpTo} = this.props;
        handleJumpTo(page);
    }

    onSearch(keywords) {
        const {handleSearch} = this.props;
        handleSearch(keywords);
    }

    onFilter(e, key) {
        e.preventDefault();
        const {handleFilter} = this.props;
        handleFilter(key, e.target.value);
    }

    onClearFilter(e)  {
        e.preventDefault();
        const {handleClearFilter} = this.props;
        handleClearFilter();
    }

    onChangeItemNum(itemNum) {
        const {handleChangeItemNum} = this.props;
        handleChangeItemNum(itemNum);
    }

    onCopy(e, id)  {
        e.preventDefault();
        const {handleCopy} = this.props;
        handleCopy(id);
    }

    onDelete(e, id)  {
        e.preventDefault();
        const {handleDelete, getAlertify} = this.props;
        const alertify = getAlertify();

        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => handleDelete(id),
            title: 'DELETE DESIGN',
            subTitle: 'This action cannot be undone.',
        });
    }

    onShowSettings(e, id)  {
        e.preventDefault();
        const {setEditCourse} = this.props;
        setEditCourse(id);
        setTimeout(() => this.settingsModal.show(), 0);
    }

    renderHeader() {
        const {currListType, sortCol, sortDir} = this.props.list;
        const {onSort} = this.props;
        let headerMeta = [
            {name: 'Title', className: 'col-title'},
            {name: 'Subject', className: 'col-subject'},
            {name: 'Teacher / Instructor', className: 'col-teacher'},
            {name: 'Class Size', className: 'col-class-size'},
            {name: 'No. of sessions', className: 'col-sess-num'},
            {name: '', className: 'col-control'},
        ];
        let headers = headerMeta.map((m, i) => {
            let props;
            if(ColumnMeta[currListType][i].sortable) {
                props = {
                    key: i,
                    className: classnames({
                        [m.className]: true,
                        'sort': sortCol != i,
                        'sort-asc': sortCol == i && sortDir == SortDir.ASC,
                        'sort-desc': sortCol == i && sortDir == SortDir.DESC,
                    }),
                    onClick: e => this.onSort(e, i),
                }
            } else {
                props = {
                    key: i,
                    className: classnames({
                        [m.className]: true,
                    }),
                };
            }
            return <th {...props}>{m.name}</th>;
        });
        return <thead><tr>{headers}</tr></thead>;
    }

    renderItems() {
        const {itemNum} = this.props.list;
        const {changeEditTab} = this.props;
        let pagedData = JSON.parse(JSON.stringify(this.props.list.pagedData));
        let isEmpty = pagedData.length == 0;
        if(itemNum > pagedData.length) {
            [...Array(itemNum - pagedData.length)].forEach((_, i) => {
                pagedData.push({
                    id: 'dummy'+i,
                    title: ' ',
                    subject: ' ',
                    teacher: ' ',
                    classSize: ' ',
                    sessionNum: ' ',
                });
            });
        }
        return (
            <tbody>{
                isEmpty ?
                <tr className="empty"><td colSpan="6">No design found</td></tr> :
                pagedData.map(i => {
                    let isDummy = i.id.toString().startsWith('dummy');
                    let trCls = classnames({
                        'dummy': isDummy,
                    });
                    let shareCls = classnames({
                        'share': true,
                        'active': i.shared,
                    });
                    let Title = withRouter(({history}) => <span><span className={shareCls} title="Shared"></span><a href={`#/edit/${i.id}`} onClick={() => changeEditTab(EditTabType.DESIGN)} title={i.title}>{i.title}</a></span>);
                    let Control = withRouter(({history}) => (
                        <div className="btn-toolbar pull-right">
                            <button type="button" className="btn btn-default btn-xs" title="Edit" onClick={() => {changeEditTab(EditTabType.DESIGN); history.push(`/edit/${i.id}`)}}>
                                <i className="fa fa-pencil"></i>
                            </button>
                            <button type="button" className="btn btn-default btn-xs" title="Dashboard" onClick={() => {changeEditTab(EditTabType.DASHBOARD); history.push(`/edit/${i.id}`)}}>
                                <i className="fa fa-dashboard"></i>
                            </button>
                        </div>
                    ));
                    return <tr key={i.id} className={trCls}>
                               <td className="text col-title">{!isDummy ? <Title/> : null}</td>
                               <td className="text col-subject"><span>{i.subject}</span></td>
                               <td className="text col-teacher"><span>{i.teacher}</span></td>
                               <td className="text col-class-size"><span>{i.classSize}</span></td>
                               <td className="text col-sess-num"><span>{i.sessionNum}</span></td>
                               <td className="col-control">
                                   {
                                       !isDummy ?
                                       <div className="dropdown pull-right">
                                           <button className="btn btn-default btn-xs dropdown-toggle" type="button" title="Menu" id="extraDropDown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                               <i className="fa fa-ellipsis-v"></i>
                                           </button>
                                           <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="extraDropDown">
                                               <li><Link to={`/edit/${i.id}`} onClick={() => changeEditTab(EditTabType.DESIGN)}><i className="fa fa-pencil"></i> Edit</Link></li>
                                               <li><Link to={`/edit/${i.id}`} onClick={() => changeEditTab(EditTabType.DASHBOARD)}><i className="fa fa-dashboard"></i> Dashboard</Link></li>
                                               <li><a href="#" onClick={e => this.onCopy(e, i.id)}><i className="fa fa-copy"></i> Copy</a></li>
                                               <li><a className="remove" href="#" onClick={e => this.onDelete(e, i.id)}><i className="fa fa-trash"></i> Remove</a></li>
                                               <li role="separator" className="divider"></li>
                                               <li><a href="#" onClick={e => this.onShowSettings(e, i.id)}><i className="fa fa-cogs"></i> Settings</a></li>
                                          </ul>
                                       </div> :
                                       null
                                   }
                                   {!isDummy ? <Control/> : null}
                               </td>
                           </tr>;
                })
            }</tbody>
        );
    }

    renderSettings() {
        const {configLoadedNum, groupLoadedNum, editCourseId, contribution, acls, groups, data} = this.props.list;
        const {loadDesignList, resetSettings, loadDesignConfig, loadGroupList, configureDesign, contributeDesign, getAlertify} = this.props;
        let list = {
            configLoadedNum,
            groupLoadedNum,
            editId: editCourseId,
            contribution,
            acls,
            groups,
        };
        let course = data.filter(d => d.id == editCourseId);
        const {title} = course.length > 0 ? course[0] : {};
        let props = {
            displayContribution: true,
            displayShareSelected: true,
            title,
            contributeTitle: 'Contribute my design to Public Designs',
            list,
            refreshList: () => loadDesignList(ListType.MY),
            resetSettings,
            loadConfig: loadDesignConfig,
            loadGroup: loadGroupList,
            configure: configureDesign,
            contribute: contributeDesign,
            getAlertify,
        };
        return <Settings ref={modal => this.settingsModal = modal} {...props}/>;
    }

    render() {
        const {filterOpts, filterKey,  filterVal, searchVal, total, itemNum, page} = this.props.list;
        const props = {
            tableClassName: {'table-sm': true},
            header: this.renderHeader(),
            filterOpts,
            filterKey,
            filterVal,
            searchVal,
            itemNum,
            total,
            page,
            onNext: this.onNext,
            onBack: this.onBack,
            onJumpTo: this.onJumpTo,
            onSearch: this.onSearch,
            onRefresh: this.onRefresh,
            onFilter: this.onFilter,
            onClearFilter: this.onClearFilter,
            onChangeItemNum: this.onChangeItemNum,
        }
        return (
            <div>
                <DataList {...props}>
                    {this.renderItems()}
                </DataList>
                {this.renderSettings()}
            </div>
        );
    }
}
