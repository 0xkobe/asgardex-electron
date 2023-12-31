// tslint:disable
/**
 * Thornode API
 * Thornode REST API.
 *
 * The version of the OpenAPI document: 1.103.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 * Edited by @veado to remove deprecated `txSignersOld`,
 * which causes build errors due missing `TxSignersResponse` (which has been deprecated as well)
 *
 * Both (`txSignersOld` + `TxSignersResponse`) are not needed for ASGARDEX
 */

import { Observable } from 'rxjs';
import { BaseAPI, HttpQuery, throwIfNullOrUndefined, encodeURI } from '../runtime';
import {
    TxDetailsResponse,
    TxResponse,
    TxStagesResponse,
    TxStatusResponse,
} from '../models';

export interface TxRequest {
    hash: string;
    height?: number;
}

export interface TxSignersRequest {
    hash: string;
    height?: number;
}

export interface TxSignersOldRequest {
    hash: string;
    height?: number;
}

export interface TxStagesRequest {
    hash: string;
    height?: number;
}

export interface TxStatusRequest {
    hash: string;
    height?: number;
}

/**
 * no description
 */
export class TransactionsApi extends BaseAPI {

    /**
     * Returns the observed transaction for a provided inbound or outbound hash.
     */
    tx = ({ hash, height }: TxRequest): Observable<TxResponse> => {
        throwIfNullOrUndefined(hash, 'tx');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<TxResponse>({
            path: '/thorchain/tx/{hash}'.replace('{hash}', encodeURI(hash)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns the signers for a provided inbound or outbound hash.
     */
    txSigners = ({ hash, height }: TxSignersRequest): Observable<TxDetailsResponse> => {
        throwIfNullOrUndefined(hash, 'txSigners');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<TxDetailsResponse>({
            path: '/thorchain/tx/details/{hash}'.replace('{hash}', encodeURI(hash)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns the processing stages of a provided inbound hash.
     */
    txStages = ({ hash, height }: TxStagesRequest): Observable<TxStagesResponse> => {
        throwIfNullOrUndefined(hash, 'txStages');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<TxStagesResponse>({
            path: '/thorchain/alpha/tx/stages/{hash}'.replace('{hash}', encodeURI(hash)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns the status of a provided inbound hash.
     */
    txStatus = ({ hash, height }: TxStatusRequest): Observable<TxStatusResponse> => {
        throwIfNullOrUndefined(hash, 'txStatus');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<TxStatusResponse>({
            path: '/thorchain/alpha/tx/status/{hash}'.replace('{hash}', encodeURI(hash)),
            method: 'GET',
            query,
        });
    };

}
