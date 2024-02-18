/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoginService {
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getLogin(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/login',
        });
    }
    /**
     * @returns string Success
     * @throws ApiError
     */
    public static getLoginUrl(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/login/url',
        });
    }
    /**
     * @returns boolean Success
     * @throws ApiError
     */
    public static getLoggedin(): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/loggedin',
        });
    }
}
