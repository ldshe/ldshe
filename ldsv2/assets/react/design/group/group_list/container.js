import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import alertify from 'alertify.js';
import {Config} from 'js/util';
import {loadGroupList, configureGroup, removeGroup} from 'react/app/design/actions';
import AppContext from 'react/app/design/context/app';
import {Panel} from '../panel/types';
import {StateName} from './types';
import {jumpNextPage, jumpBackPage, jumpToPage, toggleSortColumn, searchContent, clearFilter, filterContent, changeItemNum} from './actions';
import List from './components/list';

class GroupList extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.loadedNum != nextProps.list.loadedNum) {
            return {
                isLoading: false,
                loadedNum: nextProps.list.loadedNum,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.onLoad = this.onLoad.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.renderControl = this.renderControl.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderList = this.renderList.bind(this);
        this.state = {
            isLoading: false,
            isCreate: false,
            loadedNum: 0,
        }
        this.groupName = null;
    }

    componentDidMount() {
        this.onLoad();
    }

    onLoad() {
        const {loadGroupList} = this.props;
        this.setState({isLoading: true});
        loadGroupList();
    }

    onCreate(e) {
        e.preventDefault();
        const {handleCreate} = this.props;
        alertify.theme('bootstrap')
            .okBtn('CONFIRM')
            .cancelBtn('CANCEL')
            .defaultValue('Group name')
            .prompt('Please input a Group name.',
                (name, e) => {
                    e.preventDefault();
                    if(!name || !(name = name.trim())) return;
                    this.groupName = name;
                    this.setState({isCreate: true});
                },
                (e) => {}
            );
    }

    handleRefresh() {
        const {loadGroupList} = this.props;
        this.setState({isLoading: true});
        loadGroupList();
    }

    renderControl() {
        return (
            <nav className="navbar">
                <form className="navbar-form navbar-right">
                    <button type="button" className="btn btn-sm btn-primary pull-right" onClick={this.onCreate}>
                        <i className="fa fa-plus"></i>
                        {' New Group'}
                    </button>
                </form>
            </nav>
        );
    }

    renderLoading() {
        return (
            <div className="ug">
                {this.renderControl()}
                <div className="loading">
                    <i className="fa fa-spinner fa-spin fa-2x fa-fw"></i>
                </div>
            </div>
        );
    }

    renderList() {
        const {list} = this.props;
        const {handleFilter, handleClearFilter, handleChangeItemNum, handleSearch,
            handleSort, handleNext, handleBack, handleJumpTo,
            handleDelete, loadGroupList, configureGroup, pushPanel} = this.props;
        let props = {
            list,
            handleFilter,
            handleClearFilter,
            handleChangeItemNum,
            handleSearch,
            handleRefresh: this.handleRefresh,
            handleSort,
            handleNext,
            handleBack,
            handleJumpTo,
            handleDelete,
            loadGroupList,
            configureGroup,
            pushPanel,
        }
        return (
            <div>
                {this.renderControl()}
                <AppContext.Consumer>
                    {({getAlertify}) =>  <List {...props} getAlertify={getAlertify}/>}
                </AppContext.Consumer>

            </div>
        );
    }

    render() {
        const {isCreate, isLoading} = this.state;
        if(isCreate)
            return <Redirect to={{
                pathname: '/group/create',
                state: {data: {name: this.groupName}},
            }} />;
        else {
            return (
                <div className="ug group">
                    <h3>My Groups</h3>
                    {isLoading ?
                    this.renderLoading() :
                    this.renderList()}
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({
    list: Config.get(state, StateName.GROUP_LIST),
});

const mapDispatchToProps = dispatch => ({
    loadGroupList: () => dispatch(loadGroupList()),
    handleNext: () => dispatch(jumpNextPage()),
    handleBack: () => dispatch(jumpBackPage()),
    handleJumpTo: page => dispatch(jumpToPage(page)),
    handleSort: idx => dispatch(toggleSortColumn(idx)),
    handleSearch: keywords => dispatch(searchContent(keywords)),
    handleFilter: (key, value) => dispatch(filterContent(key, value)),
    handleClearFilter: () => dispatch(clearFilter()),
    handleChangeItemNum: itemNum => dispatch(changeItemNum(itemNum)),
    handleDelete: id => dispatch(removeGroup(id)),
    configureGroup: (id, data) => dispatch(configureGroup(id, data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(GroupList);
