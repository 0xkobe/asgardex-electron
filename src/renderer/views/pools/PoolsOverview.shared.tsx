import { Asset, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Row } from 'antd'
import { ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'

import { ErrorView } from '../../components/shared/error'
import { AssetIcon } from '../../components/uielements/assets/assetIcon'
import { Label } from '../../components/uielements/label'
import { ReloadButton } from '../../components/uielements/reloadButton'
import { ordBaseAmount } from '../../helpers/fp/ord'
import { sortByDepth } from '../../helpers/poolHelper'
import { PoolTableRowData } from './Pools.types'
import { ActionColumn } from './PoolsOverview.style'

const renderAssetColumn = ({ pool }: PoolTableRowData) => <Label align="center">{pool.target.ticker}</Label>

const sortAssetColumn = ({ pool: poolA }: PoolTableRowData, { pool: poolB }: PoolTableRowData) =>
  poolA.target.symbol.localeCompare(poolB.target.symbol)

export const assetColumn = (title: string): ColumnType<PoolTableRowData> => ({
  key: 'asset',
  title,
  render: renderAssetColumn,
  sorter: sortAssetColumn,
  sortDirections: ['descend', 'ascend'],
  defaultSortOrder: 'descend'
})

const renderPoolColumn = ({ pool }: PoolTableRowData) => (
  <Row justify="center" align="middle">
    <AssetIcon asset={pool.target} />
  </Row>
)

export const poolColumn = (title: string): ColumnType<PoolTableRowData> => ({
  key: 'pool',
  align: 'center',
  title,
  width: 100,
  render: renderPoolColumn
})

const renderPoolColumnMobile = ({ pool }: PoolTableRowData) => (
  <Row justify="center" align="middle" style={{ width: '100%' }}>
    <AssetIcon asset={pool.target} />
  </Row>
)
export const poolColumnMobile = (title: string): ColumnType<PoolTableRowData> => ({
  key: 'pool',
  title,
  render: renderPoolColumnMobile
})

const renderPriceColumn = (pricePoolAsset: Asset) => ({ poolPrice }: PoolTableRowData) => (
  <Label align="right" nowrap>
    {formatAssetAmountCurrency({
      amount: baseToAsset(poolPrice),
      asset: pricePoolAsset,
      decimal: 3
    })}
  </Label>
)

const sortPriceColumn = (a: PoolTableRowData, b: PoolTableRowData) => ordBaseAmount.compare(a.poolPrice, b.poolPrice)

export const priceColumn = (title: string, pricePoolAsset: Asset): ColumnType<PoolTableRowData> => ({
  key: 'poolprice',
  align: 'right',
  title,
  render: renderPriceColumn(pricePoolAsset),
  sorter: sortPriceColumn,
  sortDirections: ['descend', 'ascend']
})

const renderDepthColumn = (pricePoolAsset: Asset) => ({ depthPrice }: PoolTableRowData) => (
  <Label align="right" nowrap>
    {formatAssetAmountCurrency({
      amount: baseToAsset(depthPrice),
      asset: pricePoolAsset,
      decimal: 2
    })}
  </Label>
)

export const depthColumn = (title: string, pricePoolAsset: Asset): ColumnType<PoolTableRowData> => ({
  key: 'depth',
  align: 'right',
  title,
  render: renderDepthColumn(pricePoolAsset),
  sorter: sortByDepth,
  sortDirections: ['descend', 'ascend'],
  // Note: `defaultSortOrder` has no effect here, that's we do a default sort in `getPoolTableRowsData`
  defaultSortOrder: 'descend'
})

export const renderRefreshBtnColTitle = (title: string, clickHandler: FP.Lazy<void>) => (
  <ActionColumn>
    <ReloadButton onClick={clickHandler}>{title}</ReloadButton>
  </ActionColumn>
)

export const renderTableError = (reloadBtnLabel: string, reloadBtnAction: FP.Lazy<void>) => (error: Error) => (
  <ErrorView
    title={error?.toString() ?? ''}
    extra={<ReloadButton onClick={reloadBtnAction}>{reloadBtnLabel}</ReloadButton>}
  />
)
