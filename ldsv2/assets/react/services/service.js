import {Redirect, withRouter} from 'react-router-dom';
import axios from 'axios';
import path from 'path';

export default class Service {

    static get baseUrl() {
        return '/api/lds';
    }

    constructor() {
        let service = axios.create();
        service.interceptors.response.use(this.handleSuccess, this.handleError);
        this.service = service;
        this.handleSuccess = this.handleSuccess.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    handleSuccess(response) {
        return response;
    }

    handleError(error) {
        return Promise.reject(error);
    }

    get(url, payload) {
        return this.service.request({
            method: 'GET',
            url: path.join(Service.baseUrl, url),
            responseType: 'json',
            params: payload,
        });
    }

    post(url, payload) {
        return this.service.request({
            method: 'POST',
            url: path.join(Service.baseUrl, url),
            responseType: 'json',
            data: payload,
        });
    }

    postFile(url, payload) {
        return this.service.request({
            method: 'POST',
            url: path.join(Service.baseUrl, url),
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'json',
            data: payload,
        });
    }

    patch(url, payload) {
        return this.service.request({
            method: 'PATCH',
            url: path.join(Service.baseUrl, url),
            responseType: 'json',
            data: payload,
        });
    }

    put(url, payload) {
        return this.service.request({
            method: 'PUT',
            url: path.join(Service.baseUrl, url),
            responseType: 'json',
            data: payload,
        });
    }

    delete(url, payload) {
        return this.service.request({
            method: 'DELETE',
            url: path.join(Service.baseUrl, url),
            responseType: 'json',
            data: payload,
        });
    }
}
