import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'
import { catchError, startWith, map, shareReplay, debounceTime } from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { TriggerStream$ } from '../../helpers/stateHelper'
import { ApiError, ErrorId, WalletType } from '../wallet/types'
import { WalletBalancesLD, XChainClient$ } from './types'

/**
 * Observable to request balances by given `XChainClient` and `Address` (optional)
 * `Balances` are mapped into `WalletBalances`
 *
 * If `address` is not set, it tries to get `Address` of `Client` (which can fail).
 */
const loadBalances$ = ({
  client,
  address,
  walletType = 'keystore'
}: {
  client: XChainClient
  walletType?: WalletType
  address?: Address
}): WalletBalancesLD =>
  FP.pipe(
    address,
    O.fromNullable,
    // Try to use client address, if parameter `address` is undefined
    O.alt(() => O.tryCatch(() => client.getAddress())),
    O.fold(
      // TODO (@Veado) i18n
      () =>
        Rx.of(
          RD.failure<ApiError>({ errorId: ErrorId.GET_BALANCES, msg: 'Could not get address' })
        ),
      (walletAddress) =>
        Rx.from(client.getBalance(walletAddress)).pipe(
          map(RD.success),
          liveData.map(
            A.map((balance) => ({
              ...balance,
              walletType,
              walletAddress
            }))
          ),
          catchError((error: Error) =>
            Rx.of(
              RD.failure<ApiError>({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' })
            )
          ),
          startWith(RD.pending)
        )
    )
  )

/**
 * State of `Balances` loaded by given `XChainClient`
 * It will be reloaded by a next value of given `TriggerStream$`
 *
 * `Balances` is loaded by first subscription only, all other subscriber will use same state.
 * To reload `Balances`, trigger a next value to `trigger$` stream
 *
 * If a client is not available (e.g. by removing keystore), it returns an `initial` state
 */
export const balances$: (client$: XChainClient$, trigger$: TriggerStream$) => WalletBalancesLD = (client$, trigger$) =>
  Rx.combineLatest([trigger$.pipe(debounceTime(300)), client$]).pipe(
    RxOp.mergeMap(([_, oClient]) => {
      return FP.pipe(
        oClient,
        O.fold(
          // if a client is not available, "reset" state to "initial"
          () => Rx.of(RD.initial),
          // or start request and return state
          (client) =>
            loadBalances$({
              client
            })
        )
      )
    }),
    // cache it to avoid reloading data by every subscription
    shareReplay(1)
  )

export const balancesByAddress$: (
  client$: XChainClient$,
  trigger$: TriggerStream$
) => (address: string, walletType: WalletType) => WalletBalancesLD = (client$, trigger$) => (address, walletType) =>
  Rx.combineLatest([trigger$.pipe(debounceTime(300)), client$]).pipe(
    RxOp.mergeMap(([_, oClient]) => {
      return FP.pipe(
        oClient,
        O.fold(
          // if a client is not available, "reset" state to "initial"
          () => Rx.of(RD.initial),
          // or start request and return state
          (client) => loadBalances$({ client, address, walletType })
        )
      )
    }),
    // cache it to avoid reloading data by every subscription
    shareReplay(1)
  )
