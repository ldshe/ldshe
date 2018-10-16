import React from 'react';
import ReactDOM from 'react-dom';
import createApp from './app/design';
import {getProps} from 'js/util';

const selector = '#design';

$(() => {
    const $mnt = $(selector);
    const props = getProps(selector);
    ReactDOM.render(createApp(props), $mnt.get(0));
});
