import { Asset, AssetAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { WalletBalances } from '../services/clients'
import { NonEmptyWalletBalances, WalletBalance } from '../services/wallet/types'
import { isBnbAsset, isEthAsset, isLtcAsset, isRuneNativeAsset } from './assetHelper'
import { eqAsset } from './fp/eq'
import { sequenceTOption } from './fpHelpers'

/**
 * Tries to find an `AssetAmount` of an `Asset`
 * in a given list of `Balance`
 *
 * Note: Returns `None` if `Asset` has not been found this list.
 * */
export const getAssetAmountByAsset = (balances: WalletBalances, assetToFind: Asset): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => eqAsset.equals(asset, assetToFind)),
    O.map((walletBalance) => baseToAsset(walletBalance.amount))
  )

export const getWalletBalanceByAsset = (
  oWalletBalances: O.Option<NonEmptyWalletBalances>,
  oAsset: O.Option<Asset>
): O.Option<WalletBalance> =>
  FP.pipe(
    sequenceTOption(oWalletBalances, oAsset),
    O.chain(([walletBalances, asset]) =>
      FP.pipe(
        walletBalances,
        A.findFirst(({ asset: assetInList }) => eqAsset.equals(assetInList, asset))
      )
    )
  )

export const getWalletAssetAmountFromBalances =
  (isTargetWalletBalance: FP.Predicate<WalletBalance>) =>
  (balances: WalletBalances): O.Option<AssetAmount> =>
    FP.pipe(
      balances,
      A.findFirst(isTargetWalletBalance),
      O.map(({ amount }) => baseToAsset(amount))
    )

export const getAssetAmountFromBalances = (
  balances: WalletBalances,
  isAsset: (asset: Asset) => boolean
): O.Option<AssetAmount> =>
  FP.pipe(
    balances,
    A.findFirst(({ asset }) => isAsset(asset)),
    O.map(({ amount }) => baseToAsset(amount))
  )

export const getBnbAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  getAssetAmountFromBalances(balances, isBnbAsset)

export const getEthAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  getAssetAmountFromBalances(balances, isEthAsset)

export const getLtcAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  getAssetAmountFromBalances(balances, isLtcAsset)

export const getRuneNativeAmountFromBalances = (balances: WalletBalances): O.Option<AssetAmount> =>
  getAssetAmountFromBalances(balances, isRuneNativeAsset)

export const filterWalletBalancesByAssets = (balances: NonEmptyWalletBalances, assets: Asset[]): WalletBalances => {
  return balances.filter((balance) => assets.findIndex((asset) => eqAsset.equals(asset, balance.asset)) >= 0)
}
