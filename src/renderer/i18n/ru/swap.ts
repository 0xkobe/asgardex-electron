import { SwapMessages } from '../types'

const swap: SwapMessages = {
  'swap.state.pending': 'Обмениваю',
  'swap.state.success': 'Обмен совершён',
  'swap.state.error': 'Ошибка при обмене',
  'swap.input': 'Отдаете',
  'swap.output': 'Получаете',
  'swap.recipient': 'Получатель',
  'swap.info.max.fee': 'Баланс актива за вычетом комиссии обмена',
  'swap.slip.title': 'Проскальзывание',
  'swap.slip.tolerance': 'Допуск по проскальзыванию',
  'swap.slip.tolerance.info':
    'Чем выше процент, тем большее проскальзывание вы допускаете. Большее проскальзывание включает также более широкий диапазон расчёта комиссий во избежание прерывания обмена.',
  'swap.slip.tolerance.btc-ledger-disabled.info':
    'Selecting slippage tolerance has been disabled due technical issues with Ledger and BTC. - RU',
  'swap.errors.amount.balanceShouldCoverChainFee':
    'Комиссия транзакции {fee} дожна покрываться вашим балансом (сейчас {balance}).',
  'swap.errors.amount.outputShouldCoverChainFee':
    'Исходящая комиссия {fee} должна покрываться получаемым количеством (сейчас {amount}).',
  'swap.note.lockedWallet': 'Для обмена необходимо разблокировать кошелек',
  'swap.note.nowallet': 'Для обмена создайте или импортируйте кошелек',
  'swap.errors.asset.missingSourceAsset': 'Исходный актив не поддерживается',
  'swap.errors.asset.missingTargetAsset': 'Целевой актив не поддерживается',
  'swap.ledger.sign': 'Нажмите далее что бы подписать транзакцию на вашем устройстве.'
}

export default swap
