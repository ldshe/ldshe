import React, {Component} from 'react';

export default class AdditionalForm extends Component {

    constructor(props, context) {
        super(props, context);
        this.validateField = this.validateField.bind(this);
        this.validateAll = this.validateAll.bind(this);
        this.state = {errors: null};
        this.unblock = null;
    }

    componentDidMount() {
        let blockMsg = '<p>You are about leaving the Additional Items panel, changes you made may not be saved!</p>';
        blockMsg += '<p>To save changes, click the "Done" button before you leave or cancel to abort.</p>';
        this.props.pushHistBlockMsg(blockMsg);
    }

    componentWillUnmount() {
        this.props.popHistBlockMsg();
    }

    validateField(key) {
        const {id} = this.props;
        const {isReadOnly} = this.props;
        if(isReadOnly()) {
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: null})});
            return;
        }
        let oldErrs = (this.state.errors && this.state.errors[id]) ||  {};
        let {hasErr, errors} = this.validateForm(this.formIds);
        let newErrs = errors[id];
        if(newErrs) {
            if(newErrs[key])
                oldErrs[key] = newErrs[key];
            else
                delete oldErrs[key];
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: oldErrs})});
        } else {
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: null})});
        }
    }

    validateAll() {
        const {id} = this.props;
        const {isReadOnly} = this.props;
        if(isReadOnly()) {
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: null})});
            return;
        }
        let {hasErr, errors} = this.validateForm(this.formIds);
        let newErrs = errors[id];
        if(newErrs) {
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: newErrs})});
        } else {
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: null})});
        }
        return !hasErr;
    }
}
