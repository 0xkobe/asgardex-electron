import { reloadBalances, balances$ } from './balances'
import { client$, address$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createDepositService, createTransactionService } from './transaction'

const { txs$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService(client$)
const { sendTx: sendDepositTx } = createDepositService(client$)

export {
  address$,
  client$,
  reloadBalances,
  balances$,
  txs$,
  reloadFees,
  fees$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  getExplorerTxUrl$,
  sendDepositTx
}