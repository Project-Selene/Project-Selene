/* generated using openapi-typescript-codegen -- do not edit */
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
    public static getApiModList(): CancelablePromise<ModList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Mod/list',
        });
    }
    /**
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static postApiModCreate(
        requestBody?: CreateMod,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Mod/create',
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
    public static postApiModDelete(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Mod/{id}/delete',
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
    public static postApiModDelete1(
        id: string,
        version: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Mod/{id}/{version}/delete',
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
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static postApiModDraftCreate(
        id: string,
        requestBody?: VersionUpload,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Mod/draft/{id}/create',
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
     * @param id
     * @param version
     * @returns void
     * @throws ApiError
     */
    public static postApiModDraftDelete(
        id: string,
        version: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Mod/draft/{id}/{version}/delete',
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
    public static postApiModDraftSubmit(
        id: string,
        version: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Mod/draft/{id}/{version}/submit',
            path: {
                'id': id,
                'version': version,
            },
        });
    }
    /**
     * @param id
     * @param version
     * @returns any Success
     * @throws ApiError
     */
    public static postApiModDraftVerify(
        id: string,
        version: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Mod/draft/{id}/{version}/verify',
            path: {
                'id': id,
                'version': version,
            },
        });
    }
}
