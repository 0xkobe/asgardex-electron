import React, { useCallback, useMemo } from 'react'

import {
  Asset,
  assetFromString,
  assetToString,
  BNBChain,
  BTCChain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import { Network } from '../../../../shared/api/types'
import { ErrorView } from '../../../components/shared/error/'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { SendParams } from '../../../routes/wallet'
import * as walletRoutes from '../../../routes/wallet'
import { DEFAULT_NETWORK } from '../../../services/const'
import { INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { SendViewBNB, SendViewBTC, SendViewETH } from './index'
import { SendViewLTC } from './SendViewLTC'
import { SendViewTHOR } from './SendViewTHOR'

type Props = {}

export const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset, walletAddress } = useParams<SendParams>()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

  const {
    balancesState$,
    getExplorerTxUrl$,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

  const { balances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)
  const getExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  const renderAssetError = useMemo(
    () => (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.asset' },
            {
              asset
            }
          )}
        />
      </>
    ),
    [asset, intl]
  )

  const renderSendView = useCallback(
    (asset: Asset) => {
      switch (asset.chain) {
        case BNBChain:
          return (
            <SendViewBNB
              asset={asset}
              balances={balances}
              getExplorerTxUrl={getExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case BTCChain:
          return (
            <SendViewBTC
              asset={asset}
              balances={balances}
              getExplorerTxUrl={getExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case ETHChain:
          return (
            <SendViewETH
              asset={asset}
              balances={balances}
              getExplorerTxUrl={getExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case THORChain:
          return (
            <SendViewTHOR
              asset={asset}
              balances={balances}
              getExplorerTxUrl={getExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case LTCChain:
          return (
            <SendViewLTC
              asset={asset}
              balances={balances}
              getExplorerTxUrl={getExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        default:
          return (
            <h1>
              {intl.formatMessage(
                { id: 'wallet.errors.invalidChain' },
                {
                  chain: asset.chain
                }
              )}
            </h1>
          )
      }
    },
    [balances, getExplorerTxUrl, network, validatePassword$, intl]
  )

  return FP.pipe(
    oSelectedAsset,
    O.fold(
      () => renderAssetError,
      (asset) => (
        <>
          <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(asset), walletAddress })} />
          {renderSendView(asset)}
        </>
      )
    )
  )
}
