// tslint:disable
/**
 * Thornode API
 * Thornode REST API.
 *
 * The version of the OpenAPI document: 1.89.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { Observable } from 'rxjs';
import { BaseAPI, HttpQuery } from '../runtime';
import {
    POLResponse,
} from '../models';

export interface PolRequest {
    height?: number;
}

/**
 * no description
 */
export class POLApi extends BaseAPI {

    /**
     * Returns protocol owned liquidity overview statistics.
     */
    pol = ({ height }: PolRequest): Observable<POLResponse> => {

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<POLResponse>({
            path: '/thorchain/pol',
            method: 'GET',
            query,
        });
    };

}
