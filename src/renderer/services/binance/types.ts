import * as RD from '@devexperts/remote-data-ts'
import { Transfer, Client } from '@xchainjs/xchain-binance'
import { Address } from '@xchainjs/xchain-binance'
import { Asset, AssetAmount, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { LedgerBNCTxInfo, Network } from '../../../shared/api/types'
import { LiveData } from '../../helpers/rx/liveData'
import * as C from '../clients'
import { ApiError, LedgerAddressLD, LedgerTxHashLD } from '../wallet/types'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type AssetWithPrice = {
  asset: Asset
  priceRune: BigNumber
}

export type AssetsWithPrice = AssetWithPrice[]

export type TransferRD = RD.RemoteData<Error, Transfer>

export type AddressValidation = Client['validateAddress']

/**
 * Fees of Transfers
 * https://docs.binance.org/trading-spec.html#fees
 */
export type TransferFees = {
  /**
   * Fee of a transfer to a single address
   */
  single: AssetAmount
  /**
   * Multi send fee to muliple addresses
   * If the count of output address is bigger than the threshold, currently it's 2,
   * then the total transaction fee is 0.0003 BNB per token per address.
   * https://docs.binance.org/trading-spec.html#multi-send-fees
   */
  multi: AssetAmount
}

export type FeesService = {
  fees$: C.FeesLD
  reloadFees: () => void
}

export type LoadTxsProps = {
  limit: number
  offset: number
}

export type TxWithState = { txHash: string; state: O.Option<string> }
export type TxWithStateRD = RD.RemoteData<ApiError, TxWithState>
export type TxWithStateLD = LiveData<ApiError, TxWithState>

export type SendTxParams = {
  recipient: Address
  amount: BaseAmount
  asset: Asset
  memo?: string
}

export type TransactionService = C.TransactionService<SendTxParams>

export type LedgerService = {
  ledgerAddress$: LedgerAddressLD
  retrieveLedgerAddress: (network: Network) => void
  removeLedgerAddress: () => void
  ledgerTxRD$: LedgerTxHashLD
  pushLedgerTx: (network: Network, params: LedgerBNCTxInfo) => Rx.Subscription
  resetLedgerTx: () => void
}
