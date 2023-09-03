/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMod } from '../models/CreateMod';
import type { ModList } from '../models/ModList';
import type { VersionUpload } from '../models/VersionUpload';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ModService {

    /**
     * @returns ModList Success
     * @throws ApiError
     */
    public static getModList(): CancelablePromise<ModList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mod/list',
        });
    }

    /**
     * @param id 
     * @returns void 
     * @throws ApiError
     */
    public static getModDetails(
id: number,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mod/details/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }

    /**
     * @param id 
     * @param version 
     * @returns void 
     * @throws ApiError
     */
    public static getModDetails1(
id: number,
version: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mod/details/{id}/{version}',
            path: {
                'id': id,
                'version': version,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }

    /**
     * @param id 
     * @param version 
     * @returns void 
     * @throws ApiError
     */
    public static getModDownload(
id: number,
version: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/mod/download/{id}/{version}',
            path: {
                'id': id,
                'version': version,
            },
            errors: {
                404: `Not Found`,
            },
        });
    }

    /**
     * @param id 
     * @param requestBody 
     * @returns void 
     * @throws ApiError
     */
    public static postModCreateVersion(
id: number,
requestBody?: VersionUpload,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mod/create/version/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                404: `Not Found`,
                409: `Conflict`,
            },
        });
    }

    /**
     * @param requestBody 
     * @returns void 
     * @throws ApiError
     */
    public static postModCreateNew(
requestBody?: CreateMod,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mod/create/new',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                409: `Conflict`,
            },
        });
    }

    /**
     * @param id 
     * @returns void 
     * @throws ApiError
     */
    public static postModDelete(
id: number,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mod/delete/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }

    /**
     * @param id 
     * @param version 
     * @returns void 
     * @throws ApiError
     */
    public static postModDelete1(
id: number,
version: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mod/delete/{id}/{version}',
            path: {
                'id': id,
                'version': version,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }

    /**
     * @param id 
     * @param version 
     * @returns any Success
     * @throws ApiError
     */
    public static postModVerify(
id: number,
version: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/mod/verify/{id}/{version}',
            path: {
                'id': id,
                'version': version,
            },
        });
    }

}
