// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.9.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    Coin,
} from './';

/**
 * @export
 * @interface WithdrawMetadata
 */
export interface WithdrawMetadata {
    /**
     * Decimal (-1.0 <=> 1.0), indicates how assymetrical the withdrawal was. 0 means totally symetrical 
     * @type {string}
     * @memberof WithdrawMetadata
     */
    asymmetry: string;
    /**
     * Int64 (Basis points, 0-10000, where 10000=100%), percentage of total pool ownership withdrawn 
     * @type {string}
     * @memberof WithdrawMetadata
     */
    basisPoints: string;
    /**
     * Int64, additional Rune payed out because of impermanent loss protection
     * @type {string}
     * @memberof WithdrawMetadata
     */
    impermanentLossProtection: string;
    /**
     * Int64, amount of liquidity units removed from the member as result of the withdrawal 
     * @type {string}
     * @memberof WithdrawMetadata
     */
    liquidityUnits: string;
    /**
     * List of network fees associated to an action. One network fee is charged for each outbound transaction 
     * @type {Array<Coin>}
     * @memberof WithdrawMetadata
     */
    networkFees: Array<Coin>;
}
