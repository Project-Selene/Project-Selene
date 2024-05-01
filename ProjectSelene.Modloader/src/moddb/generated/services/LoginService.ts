/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompleteLogin } from '../models/CompleteLogin';
import type { LoginInfo } from '../models/LoginInfo';
import type { UserInfo } from '../models/UserInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoginService {
    /**
     * @returns LoginInfo Success
     * @throws ApiError
     */
    public static getApiLogin(): CancelablePromise<LoginInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Login',
        });
    }
    /**
     * @param requestBody
     * @returns string Success
     * @throws ApiError
     */
    public static postApiLoginComplete(
        requestBody?: CompleteLogin,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Login/complete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns boolean Success
     * @throws ApiError
     */
    public static getApiLoginLoggedin(): CancelablePromise<boolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Login/loggedin',
        });
    }
    /**
     * @returns UserInfo Success
     * @throws ApiError
     */
    public static getApiLoginCurrent(): CancelablePromise<UserInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Login/current',
        });
    }
}
