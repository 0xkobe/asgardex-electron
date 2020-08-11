import { BaseAmount, PoolData, Asset } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

import { PoolDetailStatusEnum } from '../../types/generated/midgard'

export type Pool = {
  asset: Asset
  target: Asset
}

// Pool assets
export enum PoolAsset {
  RUNE67C = 'BNB.RUNE-67C', // testnet
  RUNEB1A = 'BNB.RUNE-B1A', // mainnet
  BNB = 'BNB.BNB',
  ETH = 'ETH.ETH',
  BTC = 'BTC.BTC',
  TUSDB = 'BNB.TUSDB-000'
}

// Type guard for `PoolAsset`
export const isPoolAsset = (value: string): value is PoolAsset =>
  Object.values(PoolAsset).find((asset: string) => asset === value) !== undefined

// List of assets used for pricing
export type PricePoolAsset = PoolAsset.RUNE67C | PoolAsset.RUNEB1A | PoolAsset.ETH | PoolAsset.BTC | PoolAsset.TUSDB

// Type guard for `PricePoolAsset`
export const isPricePoolAsset = (value: string): value is PricePoolAsset =>
  // all of PoolAsset except BNB -> see `PricePoolAsset`
  isPoolAsset(value) && value !== PoolAsset.BNB

export type PricePoolAssets = PricePoolAsset[]

export type PricePoolCurrencySymbols = {
  [asset in PricePoolAsset]: string
}

export type PricePoolCurrencyWeights = {
  [asset in PricePoolAsset]: number
}

export type PricePool = {
  asset: PricePoolAsset
  poolData: PoolData
}

export type PricePools = NonEmptyArray<PricePool>

export type PoolTableRowData = {
  pool: Pool
  depthPrice: BaseAmount
  volumePrice: BaseAmount
  transactionPrice: BaseAmount
  poolPrice: BaseAmount
  slip: BigNumber
  trades: BigNumber
  status: PoolDetailStatusEnum
  deepest?: boolean
  key: string
}

export type PoolTableRowsData = PoolTableRowData[]
