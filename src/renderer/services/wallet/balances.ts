import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, Chain } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { getRuneAsset } from '../../helpers/assetHelper'
import { eqAssetsWithBalanceRD } from '../../helpers/fp/eq'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { network$ } from '../app/service'
import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/context'
import * as ETH from '../ethereum/service'
import { selectedAsset$ } from './common'
import { INITIAL_ASSETS_WB_STATE } from './const'
import { AssetsWBChain, AssetsWithBalanceRD, AssetsWithBalanceState, LoadBalancesHandler } from './types'
import { sortBalances } from './util'

export const reloadBalances = () => {
  BTC.reloadBalances()
  BNB.reloadBalances()
  ETH.reloadBalances()
}

const reloadBalancesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      return BNB.reloadBalances
    case 'BTC':
      return BTC.reloadBalances
    case 'ETH':
      return ETH.reloadBalances
    case 'THOR':
      // reload THOR balances - not available yet
      return () => {}
    default:
      return () => {}
  }
}

export const reloadBalances$: Rx.Observable<O.Option<LoadBalancesHandler>> = selectedAsset$.pipe(
  RxOp.map(O.map(({ chain }) => reloadBalancesByChain(chain)))
)

/**
 * Transforms BNB data (address + `AssetsWB`) into `AssetsWBChain`
 */
const bnbAssetsWBChain$: Observable<AssetsWBChain> = Rx.combineLatest([BNB.address$, BNB.assetsWB$, network$]).pipe(
  map(
    ([address, assetsWB, network]) =>
      ({
        chain: 'BNB',
        address: FP.pipe(
          address,
          O.getOrElse(() => '')
        ),
        assetsWB: FP.pipe(
          assetsWB,
          RD.map((assets) => sortBalances(assets, [AssetBNB.ticker, getRuneAsset({ network, chain: 'BNB' }).ticker]))
        )
      } as AssetsWBChain)
  )
)

/**
 * Transforms BTC data (address + `AssetWB`) into `AssetsWBChain`
 */
const btcAssetsWBChain$: Observable<AssetsWBChain> = Rx.combineLatest([BTC.address$, BTC.assetWB$]).pipe(
  map(
    ([address, assetWB]) =>
      ({
        chain: 'BTC',
        address: FP.pipe(
          address,
          O.getOrElse(() => '')
        ),
        assetsWB: FP.pipe(
          assetWB,
          RD.map((assets) => [assets])
        )
      } as AssetsWBChain)
  )
)

/**
 * Transforms ETH data (address + `AssetsWBChain`) into `AssetsWBChain`
 */
const ethAssetsWBChain$: Observable<AssetsWBChain> = Rx.combineLatest([ETH.address$, ETH.assetWB$]).pipe(
  map(
    ([address, assetWBRD]) =>
      ({
        chain: 'ETH',
        address: FP.pipe(
          address,
          O.getOrElse(() => '')
        ),
        assetsWB: FP.pipe(
          assetWBRD,
          RD.map((assetWB) => [assetWB])
        )
      } as AssetsWBChain)
  )
)

/**
 * List of `AssetsWBChain` for all available chains (order is important)
 */
export const assetsWBChains$ = Rx.combineLatest([btcAssetsWBChain$, ethAssetsWBChain$, bnbAssetsWBChain$])

// Map single `AssetWB` into `[AssetsWB]`
const btcAssetsWB$: Observable<AssetsWithBalanceRD> = BTC.assetWB$.pipe(liveData.map((asset) => [asset]))
const ethAssetsWB$: Observable<AssetsWithBalanceRD> = ETH.assetWB$.pipe(liveData.map((asset) => [asset]))

/**
 * Transform a list of AssetsWithBalanceRD
 * into a "single" state of `AssetsWithBalanceState`
 * Because we need to have loading / error / data combined in one "state" object in some cases
 */
export const assetsWBState$: Observable<AssetsWithBalanceState> = Rx.combineLatest([
  BNB.assetsWB$,
  btcAssetsWB$,
  ethAssetsWB$
]).pipe(
  map((assetsWBList) => ({
    assetsWB: FP.pipe(
      assetsWBList,
      // filter results out
      // Transformation: RD<Error, AssetsWithBalance>`-> `AssetsWithBalance)[]`
      A.filterMap(RD.toOption),
      A.flatten,
      NEA.fromArray
    ),
    loading: FP.pipe(assetsWBList, A.elem(eqAssetsWithBalanceRD)(RD.pending)),
    errors: FP.pipe(
      assetsWBList,
      // filter errors out
      A.filter(RD.isFailure),
      // Transformation to get Errors out of RD:
      // `RemoteData<Error, never>[]` -> `RemoteData<never, Error>[]` -> `O.some(Error)[]`
      A.map(FP.flow(RD.recover(O.some), RD.toOption)),
      // Transformation: `O.some(Error)[]` -> `O.some(Error[])`
      sequenceTOptionFromArray,
      O.chain(NEA.fromArray)
    )
  })),
  startWith(INITIAL_ASSETS_WB_STATE)
)
