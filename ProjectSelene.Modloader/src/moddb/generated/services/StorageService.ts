/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Artifact } from '../models/Artifact';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StorageService {
    /**
     * @returns Artifact Success
     * @throws ApiError
     */
    public static postStorageUpload(): CancelablePromise<Artifact> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/storage/upload',
        });
    }
    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static postStorageDelete(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/storage/delete/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static getStorageDownload(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/storage/download/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns string Success
     * @throws ApiError
     */
    public static getStorageUnverified(): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/storage/unverified',
        });
    }
}
