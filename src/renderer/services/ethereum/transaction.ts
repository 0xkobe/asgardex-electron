import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { ETHAddress, isApproved } from '@xchainjs/xchain-ethereum'
import { baseAmount, ETHChain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import {
  IPCLedgerApproveERC20TokenParams,
  ipcLedgerApproveERC20TokenParamsIO,
  IPCLedgerSendTxParams,
  ipcLedgerSendTxParamsIO
} from '../../../shared/api/io'
import { LedgerError, Network } from '../../../shared/api/types'
import { DEFAULT_APPROVE_GAS_LIMIT_FALLBACK } from '../../../shared/ethereum/const'
import { isError, isLedgerWallet } from '../../../shared/utils/guard'
import { addressInERC20Whitelist, getEthAssetAddress } from '../../helpers/assetHelper'
import { sequenceSOption } from '../../helpers/fpHelpers'
import { LiveData } from '../../helpers/rx/liveData'
import { Network$ } from '../app/types'
import { ChainTxFeeOption } from '../chain/const'
import * as C from '../clients'
import { ethRouterABI } from '../const'
import { ApiError, ErrorId, TxHashLD } from '../wallet/types'
import {
  ApproveParams,
  Client$,
  Client as EthClient,
  TransactionService,
  IsApprovedLD,
  SendPoolTxParams,
  IsApproveParams,
  SendTxParams
} from './types'

export const createTransactionService = (client$: Client$, network$: Network$): TransactionService => {
  const common = C.createTransactionService(client$)

  const runSendPoolTx$ = (client: EthClient, { ...params }: SendPoolTxParams): TxHashLD => {
    // helper for failures
    const failure$ = (msg: string) =>
      Rx.of(
        RD.failure({
          errorId: ErrorId.POOL_TX,
          msg
        })
      )

    return FP.pipe(
      sequenceSOption({ address: getEthAssetAddress(params.asset), router: params.router }),
      O.fold(
        () => failure$(`Invalid values: Asset ${params.asset} / router address ${params.router}`),
        ({ address, router }) =>
          FP.pipe(
            Rx.from(client.estimateGasPrices()),
            RxOp.switchMap((gasPrices) => {
              const isETHAddress = address === ETHAddress
              const amount = isETHAddress ? baseAmount(0) : params.amount
              const gasPrice = gasPrices.fast.amount().toFixed(0) // no round down needed
              return Rx.from(
                // Call deposit function of Router contract
                // Note:
                // Amounts need to use `toFixed` to convert `BaseAmount` to `Bignumber`
                // since `value` and `gasPrice` type is `Bignumber`
                client.call<{ hash: TxHash }>({
                  contractAddress: router,
                  abi: ethRouterABI,
                  funcName: 'deposit',
                  funcParams: [
                    params.recipient,
                    address,
                    // Send `BaseAmount` w/o decimal and always round down for currencies
                    amount.amount().toFixed(0, BigNumber.ROUND_DOWN),
                    params.memo,
                    isETHAddress
                      ? {
                          // Send `BaseAmount` w/o decimal and always round down for currencies
                          value: params.amount.amount().toFixed(0, BigNumber.ROUND_DOWN),
                          gasPrice
                        }
                      : { gasPrice }
                  ]
                })
              )
            }),
            RxOp.map((txResult) => txResult.hash),
            RxOp.map(RD.success),
            RxOp.catchError((error): TxHashLD => failure$(error?.message ?? error.toString())),
            RxOp.startWith(RD.pending)
          )
      )
    )
  }

  const sendPoolTx$ = (params: SendPoolTxParams): TxHashLD =>
    client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => runSendPoolTx$(client, params)
          )
        )
      )
    )

  const runApproveERC20Token$ = (
    client: EthClient,
    { walletIndex, contractAddress, spenderAddress }: ApproveParams
  ): TxHashLD => {
    const signer = client.getWallet(walletIndex)

    // check contract address before approving
    if (!signer)
      return Rx.of(
        RD.failure({
          msg: `Can't get signer from client`,
          errorId: ErrorId.APPROVE_TX
        })
      )

    // send approve tx
    return FP.pipe(
      Rx.from(
        client.approve({
          signer,
          contractAddress,
          spenderAddress,
          feeOptionKey: ChainTxFeeOption.APPROVE,
          gasLimitFallback: DEFAULT_APPROVE_GAS_LIMIT_FALLBACK
        })
      ),
      RxOp.switchMap((txResult) => Rx.from(txResult.wait(1))),
      RxOp.map(({ transactionHash }) => transactionHash),
      RxOp.map(RD.success),
      RxOp.catchError(
        (error): TxHashLD =>
          Rx.of(
            RD.failure({
              msg: error?.message ?? error.toString(),
              errorId: ErrorId.APPROVE_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )
  }

  const runApproveLedgerERC20Token$ = ({
    network,
    contractAddress,
    spenderAddress,
    walletIndex
  }: ApproveParams): TxHashLD => {
    const ipcParams: IPCLedgerApproveERC20TokenParams = {
      network,
      contractAddress,
      spenderAddress,
      walletIndex
    }
    const encoded = ipcLedgerApproveERC20TokenParamsIO.encode(ipcParams)

    return FP.pipe(
      Rx.from(window.apiHDWallet.approveLedgerERC20Token(encoded)),
      RxOp.switchMap(
        FP.flow(
          E.fold<LedgerError, TxHash, TxHashLD>(
            ({ msg }) =>
              Rx.of(
                RD.failure({
                  errorId: ErrorId.APPROVE_LEDGER_TX,
                  msg: `Approve Ledger ERC20 token failed. (${msg})`
                })
              ),
            (txHash) => Rx.of(RD.success(txHash))
          )
        )
      ),
      RxOp.catchError((error) =>
        Rx.of(
          RD.failure({
            errorId: ErrorId.APPROVE_LEDGER_TX,
            msg: `Approve Ledger ERC20 token failed. ${
              isError(error) ? error?.message ?? error.toString() : error.toString()
            }`
          })
        )
      ),
      RxOp.startWith(RD.pending)
    )
  }

  const approveERC20Token$ = (params: ApproveParams): TxHashLD => {
    const { contractAddress, network, walletType } = params
    // check contract address before approving
    if (network === 'mainnet' && !addressInERC20Whitelist(contractAddress))
      return Rx.of(
        RD.failure({
          msg: `Contract address ${contractAddress} is black listed`,
          errorId: ErrorId.APPROVE_TX
        })
      )

    if (isLedgerWallet(walletType)) return runApproveLedgerERC20Token$(params)

    return client$.pipe(
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => runApproveERC20Token$(client, params)
          )
        )
      )
    )
  }

  const runIsApprovedERC20Token$ = (
    client: EthClient,
    { contractAddress, spenderAddress, fromAddress }: IsApproveParams
  ): LiveData<ApiError, boolean> => {
    const provider = client.getProvider()

    return FP.pipe(
      Rx.from(isApproved({ provider, contractAddress, spenderAddress, fromAddress })),
      RxOp.map(RD.success),
      RxOp.catchError(
        (error): LiveData<ApiError, boolean> =>
          Rx.of(
            RD.failure({
              msg: error?.message ?? error.toString(),
              errorId: ErrorId.APPROVE_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )
  }

  const isApprovedERC20Token$ = (params: IsApproveParams): IsApprovedLD =>
    client$.pipe(
      RxOp.debounceTime(300),
      RxOp.switchMap((oClient) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.of(RD.initial),
            (client) => runIsApprovedERC20Token$(client, params)
          )
        )
      )
    )

  const sendLedgerTx = ({ network, params }: { network: Network; params: SendTxParams }): TxHashLD => {
    const sendLedgerTxParams: IPCLedgerSendTxParams = {
      chain: ETHChain,
      network,
      asset: params.asset,
      feeAsset: undefined,
      amount: params.amount,
      sender: params.sender,
      recipient: params.recipient,
      memo: params.memo,
      walletIndex: params.walletIndex,
      feeRate: NaN,
      feeOption: params.feeOption
    }
    const encoded = ipcLedgerSendTxParamsIO.encode(sendLedgerTxParams)

    return FP.pipe(
      Rx.from(window.apiHDWallet.sendLedgerTx(encoded)),
      RxOp.switchMap(
        FP.flow(
          E.fold<LedgerError, TxHash, TxHashLD>(
            ({ msg }) =>
              Rx.of(
                RD.failure({
                  errorId: ErrorId.SEND_LEDGER_TX,
                  msg: `Sending Ledger ETH tx failed. (${msg})`
                })
              ),
            (txHash) => Rx.of(RD.success(txHash))
          )
        )
      ),
      RxOp.startWith(RD.pending)
    )
  }

  const sendTx = (params: SendTxParams) =>
    FP.pipe(
      network$,
      RxOp.switchMap((network) => {
        if (isLedgerWallet(params.walletType)) return sendLedgerTx({ network, params })

        return common.sendTx(params)
      })
    )

  return {
    ...common,
    sendTx,
    sendPoolTx$,
    approveERC20Token$,
    isApprovedERC20Token$
  }
}
