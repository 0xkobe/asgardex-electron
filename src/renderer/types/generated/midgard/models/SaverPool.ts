// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.12.2
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface SaverPool
 */
export interface SaverPool {
    /**
     * saver address used by the member
     * @type {string}
     * @memberof SaverPool
     */
    assetAddress: string;
    /**
     * Int64(e8), total asset balance in the saver pool by member which is redeemable
     * @type {string}
     * @memberof SaverPool
     */
    assetBalance: string;
    /**
     * Int64(e8), total asset withdrawn from the saver pool by member
     * @type {string}
     * @memberof SaverPool
     */
    assetWithdrawn: string;
    /**
     * Int64, Unix timestamp for the first time member deposited into the saver pool
     * @type {string}
     * @memberof SaverPool
     */
    dateFirstAdded: string;
    /**
     * Int64, Unix timestamp for the last time member deposited into the saver pool
     * @type {string}
     * @memberof SaverPool
     */
    dateLastAdded: string;
    /**
     * The Pool rest of the data are refering to (only those pools can show up which have a corresponding saver pool)
     * @type {string}
     * @memberof SaverPool
     */
    pool: string;
    /**
     * Int64, saver liquidity units that belong the the member
     * @type {string}
     * @memberof SaverPool
     */
    saverUnits: string;
}
