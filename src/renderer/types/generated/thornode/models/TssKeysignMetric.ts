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

import {
    TssMetric,
} from './';

/**
 * @export
 * @interface TssKeysignMetric
 */
export interface TssKeysignMetric {
    /**
     * @type {string}
     * @memberof TssKeysignMetric
     */
    tx_id?: string;
    /**
     * @type {Array<TssMetric>}
     * @memberof TssKeysignMetric
     */
    node_tss_times: Array<TssMetric>;
}
