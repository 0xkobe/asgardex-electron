import * as RD from '@devexperts/remote-data-ts'
import { Client, ClientUrl, getChainId } from '@xchainjs/xchain-thorchain'
import { THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { toClientNetwork } from '../../../shared/utils/client'
import { isError } from '../../../shared/utils/guard'
import { observableState } from '../../helpers/stateHelper'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { INITIAL_CHAIN_IDS, INITIAL_CLIENT_URL } from './const'
import { Client$, ClientState, ClientState$, NodeUrlType } from './types'

const { get$: clientUrl$, get: getClientUrl, set: _setClientUrl } = observableState<ClientUrl>(INITIAL_CLIENT_URL)

const setClientUrl = ({ url, network, type }: { url: string; network: Network; type: NodeUrlType }) => {
  // TODO(@veado) Store data persistent on disc
  const current = getClientUrl()
  const cNetwork = toClientNetwork(network)
  _setClientUrl({ ...current, [cNetwork]: { ...current[cNetwork], [type]: url } })
}

/**
 * Stream to create an observable `ThorchainClient` depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `ThorchainClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `ThorchainClient` will never be created as long as no phrase is available
 */
const clientState$: ClientState$ = FP.pipe(
  Rx.combineLatest([keystoreService.keystoreState$, clientNetwork$, clientUrl$]),
  RxOp.switchMap(
    ([keystore, network, clientUrl]): ClientState$ =>
      FP.pipe(
        // request chain id from node whenever network or keystore state have been changed
        Rx.from(getChainId(clientUrl[network].node)),
        RxOp.switchMap((chainId) =>
          Rx.of(
            FP.pipe(
              getPhrase(keystore),
              O.map<string, ClientState>((phrase) => {
                try {
                  const client = new Client({
                    clientUrl,
                    network,
                    phrase,
                    chainIds: { ...INITIAL_CHAIN_IDS, [network]: chainId }
                  })
                  return RD.success(client)
                } catch (error) {
                  return RD.failure<Error>(isError(error) ? error : new Error('Failed to create THOR client'))
                }
              }),
              // Set back to `initial` if no phrase is available (locked wallet)
              O.getOrElse<ClientState>(() => RD.initial)
            )
          )
        ),
        RxOp.catchError((error) =>
          Rx.of(RD.failure<Error>(new Error(`Failed to get THORChain's chain id (${error?.msg ?? error.toString()})`)))
        ),
        RxOp.startWith(RD.pending)
      )
  ),
  RxOp.startWith(RD.initial),
  RxOp.shareReplay(1)
)

const client$: Client$ = clientState$.pipe(RxOp.map(RD.toOption), RxOp.shareReplay(1))

/**
 * `Address`
 */
const address$: C.WalletAddress$ = C.address$(client$, THORChain)

/**
 * `Address`
 */
const addressUI$: C.WalletAddress$ = C.addressUI$(client$, THORChain)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)

export { client$, clientState$, clientUrl$, setClientUrl, address$, addressUI$, explorerUrl$ }
