import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import alertify from 'alertify.js';
import {Config} from 'js/util';
import {loadMemberList, newMember, removeMember} from 'react/app/design/actions';
import AppContext from 'react/app/design/context/app';
import {ListType, StateName} from './types';
import {jumpNextPage, jumpBackPage, jumpToPage, toggleSortColumn, searchContent, clearFilter, filterContent, changeItemNum,
        reset, clearInfoLogs, clearSuccessLogs, clearErrorLogs} from './actions';
import ManageableList from './components/manageable_list';
import GeneralList from './components/general_list';

class MemberList extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.groupId != nextProps.initProps.groupId) {
            return {
                groupId: nextProps.initProps.groupId,
                groupChanged: true,
            };
        }
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
        this.handleRefresh = this.handleRefresh.bind(this);
        this.renderList = this.renderList.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.state = {
            isLoading: false,
            groupId: props.initProps.groupId,
            loadedNum: props.list.loadedNum,
            groupChanged: false,
        }
    }

    componentDidMount() {
        const {groupId} = this.props.initProps;
        this.onLoad(groupId);
    }

    componentDidUpdate() {
        const {groupChanged} = this.state;
        if(groupChanged) {
            const {groupId} = this.props.initProps;
            this.onLoad(groupId);
            this.setState({groupChanged: false});
            return;
        }
    }

    componentWillUnmount() {
        const {reset} = this.props;
        reset();
    }

    onLoad(groupId) {
        this.handleRefresh(groupId);
    }

    handleRefresh(groupId) {
        const {isEditable} = this.props;
        const {loadMemberList} = this.props;
        this.setState({isLoading: true});
        loadMemberList(isEditable ? ListType.MANAGEABLE : ListType.MEMBER, groupId);
    }

    renderList() {
        const {isLoading} = this.state;
        const {isEditable, list} = this.props;
        const {groupId} = this.props.initProps;
        const {handleFilter, handleClearFilter, handleChangeItemNum, handleSearch,
            handleSort, handleNext, handleBack, handleJumpTo,
            handleCreate, handleDelete, loadMemberList} = this.props;
        let props = {
            groupId,
            isLoading,
            list,
            listType: isEditable ? ListType.MANAGEABLE : ListType.MEMBER,
            handleFilter,
            handleClearFilter,
            handleChangeItemNum,
            handleSearch,
            handleRefresh: () => this.handleRefresh(groupId),
            handleSort,
            handleNext,
            handleBack,
            handleJumpTo,
            handleCreate: userId => handleCreate(groupId, userId),
            handleDelete: id => handleDelete(groupId, id),
            loadMemberList: () => loadMemberList(groupId),
        }
        return (
            <AppContext.Consumer>{
                ({getAlertify}) =>
                    isEditable ?
                    <ManageableList {...props} getAlertify={getAlertify}/> :
                    <GeneralList {...props} getAlertify={getAlertify}/>
            }</AppContext.Consumer>
        );
    }

    renderContent() {
        return (
            <div>
                {this.renderList()}
            </div>
        );
    }

    render() {
        return (
            <div className="member">
                {this.renderContent()}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    list: Config.get(state, StateName.MEMBER_LIST),
});

const mapDispatchToProps = dispatch => ({
    loadMemberList: (listType, groupId) => dispatch(loadMemberList(listType, groupId)),
    handleNext: () => dispatch(jumpNextPage()),
    handleBack: () => dispatch(jumpBackPage()),
    handleJumpTo: page => dispatch(jumpToPage(page)),
    handleSort: idx => dispatch(toggleSortColumn(idx)),
    handleSearch: keywords => dispatch(searchContent(keywords)),
    handleFilter: (key, value) => dispatch(filterContent(key, value)),
    handleClearFilter: () => dispatch(clearFilter()),
    handleChangeItemNum: itemNum => dispatch(changeItemNum(itemNum)),
    handleCreate: (groupId, userId) => dispatch(newMember(groupId, userId)),
    handleDelete: (groupId, userId) => dispatch(removeMember(groupId, userId)),
    reset: () => dispatch(reset()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MemberList);
