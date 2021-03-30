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
    ObservedChain,
    PreflightStatus,
    ProxiedNodeJail,
    ProxiedNodePubKeySet,
} from './';

/**
 * @export
 * @interface ProxiedNode
 */
export interface ProxiedNode {
    /**
     * @type {number}
     * @memberof ProxiedNode
     */
    active_block_height: number;
    /**
     * @type {string}
     * @memberof ProxiedNode
     */
    bond: string;
    /**
     * @type {string}
     * @memberof ProxiedNode
     */
    bond_address: string;
    /**
     * @type {string}
     * @memberof ProxiedNode
     */
    current_award: string;
    /**
     * @type {boolean}
     * @memberof ProxiedNode
     */
    forced_to_leave: boolean;
    /**
     * @type {string}
     * @memberof ProxiedNode
     */
    ip_address: string;
    /**
     * @type {ProxiedNodeJail}
     * @memberof ProxiedNode
     */
    jail: ProxiedNodeJail;
    /**
     * @type {number}
     * @memberof ProxiedNode
     */
    leave_height: number;
    /**
     * @type {string}
     * @memberof ProxiedNode
     */
    node_address: string;
    /**
     * @type {Array<ObservedChain>}
     * @memberof ProxiedNode
     */
    observe_chains: Array<ObservedChain>;
    /**
     * @type {PreflightStatus}
     * @memberof ProxiedNode
     */
    preflight_status: PreflightStatus;
    /**
     * @type {ProxiedNodePubKeySet}
     * @memberof ProxiedNode
     */
    pub_key_set: ProxiedNodePubKeySet;
    /**
     * @type {boolean}
     * @memberof ProxiedNode
     */
    requested_to_leave: boolean;
    /**
     * @type {Array<string>}
     * @memberof ProxiedNode
     */
    signer_membership: Array<string>;
    /**
     * @type {number}
     * @memberof ProxiedNode
     */
    slash_points: number;
    /**
     * @type {string}
     * @memberof ProxiedNode
     */
    status: string;
    /**
     * @type {number}
     * @memberof ProxiedNode
     */
    status_since: number;
    /**
     * @type {string}
     * @memberof ProxiedNode
     */
    validator_cons_pub_key: string;
    /**
     * @type {string}
     * @memberof ProxiedNode
     */
    version: string;
}
