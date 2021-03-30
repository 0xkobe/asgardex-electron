// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.0.0-alpha.3
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    EarningsHistoryItemPool,
} from './';

/**
 * @export
 * @interface EarningsHistoryItem
 */
export interface EarningsHistoryItem {
    /**
     * float64, Average amount of active nodes during the time interval
     * @type {string}
     * @memberof EarningsHistoryItem
     */
    avgNodeCount: string;
    /**
     * Int64(e8), Total block rewards emitted during the time interval
     * @type {string}
     * @memberof EarningsHistoryItem
     */
    blockRewards: string;
    /**
     * Int64(e8), Share of earnings sent to nodes during the time interval
     * @type {string}
     * @memberof EarningsHistoryItem
     */
    bondingEarnings: string;
    /**
     * Int64(e8), System income generated during the time interval. It is the sum of liquidity fees and block rewards
     * @type {string}
     * @memberof EarningsHistoryItem
     */
    earnings: string;
    /**
     * Int64, The end time of interval in unix timestamp
     * @type {string}
     * @memberof EarningsHistoryItem
     */
    endTime: string;
    /**
     * Int64(e8), Share of earnings sent to pools during the time interval
     * @type {string}
     * @memberof EarningsHistoryItem
     */
    liquidityEarnings: string;
    /**
     * Int64(e8), Total liquidity fees, converted to RUNE, collected during the time interval
     * @type {string}
     * @memberof EarningsHistoryItem
     */
    liquidityFees: string;
    /**
     * Earnings data for each pool for the time interval
     * @type {Array<EarningsHistoryItemPool>}
     * @memberof EarningsHistoryItem
     */
    pools: Array<EarningsHistoryItemPool>;
    /**
     * Int64, The beginning time of interval in unix timestamp
     * @type {string}
     * @memberof EarningsHistoryItem
     */
    startTime: string;
}
