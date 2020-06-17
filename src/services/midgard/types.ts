import * as RD from '@devexperts/remote-data-ts'
import BigNumber from 'bignumber.js'

import { AssetDetail, PoolDetail, NetworkInfo } from '../../types/generated/midgard'
import { PricePools, PricePool } from '../../views/pools/types'

export type PoolAsset = string
export type PoolAssets = string[]

export type AssetDetails = AssetDetail[]

export type AssetDetailMap = {
  [asset: string]: AssetDetail
}

export type PoolDetails = PoolDetail[]

export type PriceDataIndex = {
  [symbol: string]: BigNumber
}

export type PoolsState = {
  assetDetails: AssetDetails
  poolAssets: PoolAssets
  poolDetails: PoolDetails
  pricePools: PricePools
  selectedPricePool: PricePool
}

export type PoolsStateRD = RD.RemoteData<Error, PoolsState>

export type NetworkInfoRD = RD.RemoteData<Error, NetworkInfo>
