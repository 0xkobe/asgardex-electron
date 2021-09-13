import React, { useCallback, useMemo } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, formatAssetAmountCurrency, baseToAsset, assetToString } from '@xchainjs/xchain-util'
import { Dropdown, Row, Col } from 'antd'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { isLedgerWallet } from '../../../../shared/utils/guard'
import { WalletBalances } from '../../../services/clients'
import { WalletBalance, WalletType } from '../../../services/wallet/types'
import { AssetData } from '../../uielements/assets/assetData'
import { AssetIcon } from '../../uielements/assets/assetIcon'
import { Size as IconSize } from '../../uielements/assets/assetIcon/AssetIcon.types'
import { FilterMenu } from '../../uielements/filterMenu'
import * as Styled from './AccountSelector.styles'

type Props = {
  selectedWallet: WalletBalance
  walletBalances: WalletBalances
  onChange?: (params: { asset: Asset; walletAddress: Address; walletType: WalletType }) => void
  size?: IconSize
  network: Network
}

const filterFunction = ({ asset }: WalletBalance, searchTerm: string) => {
  const { ticker } = asset
  return ticker?.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
}

export const AccountSelector: React.FC<Props> = (props): JSX.Element => {
  const { selectedWallet, walletBalances, onChange = (_) => {}, size = 'large', network } = props

  const intl = useIntl()

  const filteredWalletBalances = useMemo(
    () =>
      walletBalances.filter(
        ({ asset, amount }) => asset.symbol !== selectedWallet.asset.symbol && amount.amount().isGreaterThan(0)
      ),
    [selectedWallet.asset.symbol, walletBalances]
  )
  const enableDropdown = filteredWalletBalances.length > 0

  const cellRenderer = useCallback(
    ({ asset, amount, walletAddress, walletType }: WalletBalance) => {
      const node = (
        <Row align={'middle'} gutter={[8, 0]} onClick={() => onChange({ asset, walletAddress, walletType })}>
          <Col>
            <AssetData asset={asset} network={network} />
          </Col>
          <Col>{formatAssetAmountCurrency({ amount: baseToAsset(amount), asset })}</Col>
        </Row>
      )

      return { node, key: walletAddress + assetToString(asset) }
    },
    [onChange, network]
  )

  const menu = useMemo(
    () => (
      <FilterMenu
        placeholder={intl.formatMessage({ id: 'common.searchAsset' })}
        searchEnabled
        data={filteredWalletBalances}
        cellRenderer={cellRenderer}
        filterFunction={filterFunction}
      />
    ),
    [filteredWalletBalances, cellRenderer, intl]
  )

  return (
    <Styled.Card bordered={false}>
      <Styled.AssetWrapper>
        <AssetIcon asset={selectedWallet.asset} size={size} network={network} />
        <Styled.AssetInfoWrapper>
          <Styled.AssetTitle>{selectedWallet.asset.ticker}</Styled.AssetTitle>
          <Styled.AssetSubTitle>{selectedWallet.asset.chain}</Styled.AssetSubTitle>

          {enableDropdown && (
            <Dropdown overlay={menu} trigger={['click']}>
              {/* Important note:
                  Label has to be wrapped into a `div` to avoid error render messages
                  such as "Function components cannot be given refs"
              */}
              <div>
                <Styled.Label>{intl.formatMessage({ id: 'common.change' })}</Styled.Label>
              </div>
            </Dropdown>
          )}
        </Styled.AssetInfoWrapper>
        {isLedgerWallet(selectedWallet.walletType) && (
          <Styled.LedgerWalletType>{intl.formatMessage({ id: 'ledger.title' })}</Styled.LedgerWalletType>
        )}
      </Styled.AssetWrapper>
    </Styled.Card>
  )
}
