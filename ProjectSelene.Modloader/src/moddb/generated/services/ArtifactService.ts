/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UnverifiedArtifact } from '../models/UnverifiedArtifact';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ArtifactService {
    /**
     * @param mod
     * @param version
     * @returns any Success
     * @throws ApiError
     */
    public static postApiArtifactUpload(
        mod: string,
        version: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Artifact/{mod}/{version}/upload',
            path: {
                'mod': mod,
                'version': version,
            },
        });
    }
    /**
     * @param mod
     * @param version
     * @returns any Success
     * @throws ApiError
     */
    public static postApiArtifactDelete(
        mod: string,
        version: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Artifact/{mod}/{version}/delete',
            path: {
                'mod': mod,
                'version': version,
            },
        });
    }
    /**
     * @param mod
     * @param version
     * @returns any Success
     * @throws ApiError
     */
    public static getApiArtifact(
        mod: string,
        version: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Artifact/{mod}/{version}',
            path: {
                'mod': mod,
                'version': version,
            },
        });
    }
    /**
     * @returns UnverifiedArtifact Success
     * @throws ApiError
     */
    public static getApiArtifactUnverified(): CancelablePromise<Array<UnverifiedArtifact>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Artifact/unverified',
        });
    }
}
