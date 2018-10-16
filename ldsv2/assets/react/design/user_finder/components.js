import 'select2';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

const gravatar = require('gravatar');

export default class Finder extends Component {

    get value() {
        let $select = $(ReactDOM.findDOMNode(this.select));
        return $select.val();
    }

    constructor(props, context) {
        super(props, context);
        this.init = this.init.bind(this);
    }

    componentDidMount() {
        this.init();
    }

    init() {
        let $select = $(ReactDOM.findDOMNode(this.select));
        $select.select2({
            width: '100%',
            minimumInputLength: 2,
            maximumInputLength: 255,
            placeholder: 'Username / Email',
            templateResult: d => {
                if(!d.gravatar) return d.text;
                let {user} = d;
                let $div = $('<div class="row">');
                let $img = $('<div class="col-xs-2">').append(`<img src="${d.gravatar}"/>`);
                let $title = $('<h5>')
                $title.append(`${user.username}, ${user.fname} ${user.lname}`);
                $title.append('<br>');
                $title.append(`&lt;${user.email}&gt;`);
                $title = $('<div class="col-xs-10">').append($title);
                $div.append($img);
                $div.append($title);
                return $div;
            },
            ajax: {
                delay: 500,
                url: '/api/lds/users',
                data: params => ({q: params.term}),
                processResults: ({users}) => {
                    users = users.map(d => ({
                        id: d.id,
                        text: `${d.username}, ${d.fname} ${d.lname} <${d.email}>`,
                        user: d,
                        gravatar: gravatar.url(d.email, {s: '40', r: 'pg', d: 'mm'}),
                    }));
                    return {results: users};
                },
            }
        });
    }

    render() {
        return <select ref={select => this.select = select}></select>;
    }
}
