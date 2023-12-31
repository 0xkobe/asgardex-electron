import * as RD from '@devexperts/remote-data-ts'
import { Address, Asset, assetFromString, assetToString, baseAmount, bnOrZero } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import * as N from 'fp-ts/lib/number'
import * as O from 'fp-ts/Option'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { add9Rheader } from '../../../shared/api/ninerealms'
import { AssetRuneNative } from '../../../shared/utils/asset'
import { isEnabledChain } from '../../../shared/utils/chain'
import { ZERO_BASE_AMOUNT } from '../../const'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import {
  Configuration,
  LiquidityProvidersApi,
  LiquidityProviderSummary,
  Middleware,
  MimirApi,
  NetworkApi,
  Node,
  NodesApi,
  Saver,
  SaversApi
} from '../../types/generated/thornode'
import { Network$ } from '../app/types'
import {
  MimirIO,
  MimirLD,
  ThornodeApiUrlLD,
  LiquidityProvidersLD,
  LiquidityProvider,
  NodeInfosLD,
  NodeInfos,
  ClientUrl$,
  InboundAddressesLD,
  ThorchainConstantsLD,
  ThorchainLastblockLD,
  SaverProviderLD,
  SaverProvider
} from './types'

export const getThornodeAPIConfiguration = (basePath: string): Configuration => {
  const middleware: Middleware = { pre: add9Rheader }
  return new Configuration({ basePath, middleware: [middleware] })
}

export const createThornodeService$ = (network$: Network$, clientUrl$: ClientUrl$) => {
  // `TriggerStream` to reload THORNode url
  const { stream$: reloadThornodeUrl$, trigger: reloadThornodeUrl } = triggerStream()

  /**
   * Thornode url
   */
  const thornodeUrl$: ThornodeApiUrlLD = Rx.combineLatest([network$, clientUrl$, reloadThornodeUrl$]).pipe(
    RxOp.map(([network, url, _]) => RD.success(`${url[network].node}`)),
    RxOp.shareReplay(1)
  )

  const apiGetNodeInfos$ = () =>
    FP.pipe(
      thornodeUrl$,
      liveData.chain((basePath) =>
        FP.pipe(
          new NodesApi(getThornodeAPIConfiguration(basePath)).nodes({ height: undefined }),
          RxOp.map(RD.success),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      RxOp.startWith(RD.pending)
    )

  const loadInboundAddresses$ = (): InboundAddressesLD =>
    FP.pipe(
      thornodeUrl$,
      liveData.chain((basePath) =>
        FP.pipe(
          new NetworkApi(getThornodeAPIConfiguration(basePath)).inboundAddresses({}),
          RxOp.map(RD.success),
          liveData.map(
            FP.flow(
              A.filterMap(({ chain, address, ...rest }) =>
                // validate chain
                chain !== undefined &&
                isEnabledChain(chain) &&
                // address is required
                !!address
                  ? O.some({ chain, address, ...rest })
                  : O.none
              )
            )
          ),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      RxOp.startWith(RD.pending)
    )

  // Trigger to reload pool addresses (`inbound_addresses`)
  const { stream$: reloadInboundAddresses$, trigger: reloadInboundAddresses } = triggerStream()
  const inboundAddressesInterval$ = Rx.timer(0 /* no delay for first value */, 5 * 60 * 1000 /* delay of 5 min  */)

  /**
   * Get's inbound addresses once and share result by next subscription
   *
   * It will be updated using a timer defined in `inboundAddressesInterval`
   * or by reloading of data possible by `reloadInboundAddresses`
   */
  const inboundAddressesShared$: InboundAddressesLD = FP.pipe(
    Rx.combineLatest([reloadInboundAddresses$, inboundAddressesInterval$]),
    // debounce it, reloadInboundAddresses might be called by UI many times
    RxOp.debounceTime(300),
    RxOp.switchMap((_) => loadInboundAddresses$()),
    RxOp.shareReplay(1)
  )

  /**
   * Get `ThorchainConstants` data from Midgard
   */
  const apiGetThorchainConstants$ = FP.pipe(
    thornodeUrl$,
    liveData.chain((basePath) =>
      FP.pipe(
        new NetworkApi(getThornodeAPIConfiguration(basePath)).constants({}),
        RxOp.map(RD.success),
        RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    )
  )

  const { stream$: reloadThorchainConstants$, trigger: reloadThorchainConstants } = triggerStream()

  /**
   * Provides data of `ThorchainConstants`
   */
  const thorchainConstantsState$: ThorchainConstantsLD = FP.pipe(
    reloadThorchainConstants$,
    RxOp.debounceTime(300),
    RxOp.switchMap(() => apiGetThorchainConstants$),
    RxOp.startWith(RD.pending),
    RxOp.shareReplay(1),
    RxOp.catchError(() => Rx.of(RD.failure(Error('Failed to load THORChain constants'))))
  )

  /**
   * Api call to `lastblock` endpoint
   */
  const apiGetThorchainLastblock$ = FP.pipe(
    thornodeUrl$,
    liveData.chain((basePath) =>
      FP.pipe(
        new NetworkApi(getThornodeAPIConfiguration(basePath)).lastblock({}),
        RxOp.map(RD.success),
        RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
      )
    )
  )

  // `TriggerStream` to reload data of `ThorchainLastblock`
  const { stream$: reloadThorchainLastblock$, trigger: reloadThorchainLastblock } = triggerStream()

  /**
   * Loads data of `lastblock`
   */
  const loadThorchainLastblock$ = () =>
    apiGetThorchainLastblock$.pipe(
      // catch any errors if there any
      RxOp.catchError((error: Error) => Rx.of(RD.failure(error))),
      RxOp.startWith(RD.pending)
    )

  const loadThorchainLastblockInterval$ = Rx.timer(0 /* no delay for first value */, 15 * 1000 /* every 15 sec  */)

  /**
   * State of `ThorchainLastblock`, it will be loaded data by first subscription only
   */
  const thorchainLastblockState$: ThorchainLastblockLD = FP.pipe(
    Rx.combineLatest([reloadThorchainLastblock$, loadThorchainLastblockInterval$]),
    // start request
    RxOp.switchMap((_) => loadThorchainLastblock$()),
    // cache it to avoid reloading data by every subscription
    RxOp.shareReplay(1)
  )

  const { stream$: reloadNodeInfos$, trigger: reloadNodeInfos } = triggerStream()

  const getNodeInfos$: NodeInfosLD = FP.pipe(
    reloadNodeInfos$,
    RxOp.debounceTime(300),
    RxOp.switchMap(apiGetNodeInfos$),
    liveData.map<Node[], NodeInfos>((nodes) =>
      FP.pipe(
        nodes,
        A.map(({ total_bond, current_award, status, node_address }) => ({
          bond: baseAmount(total_bond, THORCHAIN_DECIMAL),
          award: baseAmount(current_award, THORCHAIN_DECIMAL),
          status,
          address: node_address
        }))
      )
    ),
    RxOp.startWith(RD.initial),
    RxOp.shareReplay(1)
  )

  const apiGetLiquidityProviders$ = (asset: Asset): LiveData<Error, LiquidityProviderSummary[]> =>
    FP.pipe(
      thornodeUrl$,
      liveData.chain((basePath) =>
        FP.pipe(
          new LiquidityProvidersApi(getThornodeAPIConfiguration(basePath)).liquidityProviders({
            asset: assetToString(asset)
          }),
          RxOp.map(RD.success),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      )
    )

  const { stream$: reloadLiquidityProviders$, trigger: reloadLiquidityProviders } = triggerStream()

  const getLiquidityProviders = (asset: Asset): LiquidityProvidersLD =>
    FP.pipe(
      reloadLiquidityProviders$,
      RxOp.debounceTime(300),
      RxOp.switchMap((_) => apiGetLiquidityProviders$(asset)),
      liveData.map(
        A.map((provider): LiquidityProvider => {
          const oAsset = O.fromNullable(assetFromString(provider.asset))
          const pendingRune = FP.pipe(
            /* 1e8 decimal by default at THORChain */
            baseAmount(bnOrZero(provider.pending_rune), THORCHAIN_DECIMAL),
            O.fromPredicate((v) => v.gt(ZERO_BASE_AMOUNT)),
            O.map((amount1e8) => ({
              asset: AssetRuneNative,
              amount1e8
            }))
          )
          const oPendingAssetAmount = FP.pipe(
            /* 1e8 decimal by default at THORChain */
            baseAmount(bnOrZero(provider.pending_asset), THORCHAIN_DECIMAL),
            O.fromPredicate((v) => v.gt(ZERO_BASE_AMOUNT))
          )
          const pendingAsset = FP.pipe(
            sequenceTOption(oAsset, oPendingAssetAmount),
            O.map(([asset, amount1e8]) => ({ asset, amount1e8 }))
          )

          return {
            runeAddress: O.fromNullable(provider.rune_address),
            assetAddress: O.fromNullable(provider.asset_address),
            pendingRune,
            pendingAsset
          }
        })
      ),
      RxOp.catchError(
        (): LiquidityProvidersLD => Rx.of(RD.failure(Error(`Failed to load info for ${assetToString(asset)} pool`)))
      ),
      RxOp.startWith(RD.pending)
    )

  const apiGetMimir$: MimirLD = FP.pipe(
    thornodeUrl$,
    liveData.chain((basePath) =>
      FP.pipe(
        new MimirApi(getThornodeAPIConfiguration(basePath)).mimir({ height: undefined }),
        RxOp.catchError((e) => Rx.of(RD.failure(Error(`Failed loading mimir: ${JSON.stringify(e)}`)))),
        RxOp.map((response) => MimirIO.decode(response)),
        RxOp.map((result) =>
          // Errors -> Error
          E.mapLeft((_: t.Errors) => Error(`Failed loading mimir ${PathReporter.report(result)}`))(result)
        ),
        RxOp.map(RD.fromEither)
      )
    )
  )

  const { stream$: reloadMimir$, trigger: reloadMimir } = triggerStream()

  const mimirInterval$ = Rx.timer(0 /* no delay for first value */, 5 * 60 * 1000 /* others are delayed by 5 min  */)

  const mimir$: MimirLD = FP.pipe(
    Rx.combineLatest([reloadMimir$, mimirInterval$]),
    RxOp.debounceTime(300),
    RxOp.switchMap(() => apiGetMimir$),
    RxOp.startWith(RD.pending),
    RxOp.shareReplay(1)
  )

  const apiGetSaverProvider$ = (asset: Asset, address: Address): LiveData<Error, Saver> =>
    FP.pipe(
      thornodeUrl$,
      liveData.chain((basePath) =>
        FP.pipe(
          new SaversApi(getThornodeAPIConfiguration(basePath)).saver({
            asset: assetToString(asset),
            address
          }),
          RxOp.map(RD.success),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      RxOp.startWith(RD.pending)
    )

  const { stream$: reloadSaverProvider$, trigger: reloadSaverProvider } = triggerStream()

  const getSaverProvider$ = (asset: Asset, address: Address): SaverProviderLD =>
    FP.pipe(
      reloadSaverProvider$,
      RxOp.debounceTime(300),
      RxOp.switchMap((_) => apiGetSaverProvider$(asset, address)),
      liveData.map(
        // transform Saver -> SaverProvider
        (provider): SaverProvider => {
          const { asset_deposit_value, asset_redeem_value, growth_pct, last_add_height, last_withdraw_height } =
            provider
          /* 1e8 decimal by default, which is default decimal for ALL accets at THORChain  */
          const depositValue = baseAmount(asset_deposit_value, THORCHAIN_DECIMAL)
          const redeemValue = baseAmount(asset_redeem_value, THORCHAIN_DECIMAL)
          const growthPercent = bnOrZero(growth_pct)
          const addHeight = FP.pipe(last_add_height, O.fromPredicate(N.isNumber))
          const withdrawHeight = FP.pipe(last_withdraw_height, O.fromPredicate(N.isNumber))
          return {
            address: provider.asset_address,
            depositValue,
            redeemValue,
            growthPercent,
            addHeight,
            withdrawHeight
          }
        }
      ),
      RxOp.catchError(
        (): SaverProviderLD => Rx.of(RD.failure(Error(`Failed to load info for ${assetToString(asset)} saver`)))
      ),
      RxOp.startWith(RD.pending)
    )

  return {
    thornodeUrl$,
    reloadThornodeUrl,
    getNodeInfos$,
    reloadNodeInfos,
    reloadThorchainConstants,
    thorchainConstantsState$,
    thorchainLastblockState$,
    reloadThorchainLastblock,
    inboundAddressesShared$,
    reloadInboundAddresses,
    loadInboundAddresses$,
    mimir$,
    reloadMimir,
    getLiquidityProviders,
    reloadLiquidityProviders,
    getSaverProvider$,
    reloadSaverProvider
  }
}
