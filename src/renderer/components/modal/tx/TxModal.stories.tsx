import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import { Row } from 'antd'
import * as O from 'fp-ts/lib/Option'

import { ErrorId } from '../../../services/wallet/types'
import { Button } from '../../uielements/button'
import { Label } from '../../uielements/label'
import { TxModal } from './TxModal'

const onClose = () => console.log('onClose')
const onFinish = () => console.log('onFinish')
const onViewTxClick = (txHash: TxHash) => console.log('txHash', txHash)

export const StoryInitial: Story = () => (
  <TxModal title="intial" txRD={RD.initial} onClose={onClose} onFinish={onFinish} />
)
StoryInitial.storyName = 'initial'

export const StoryPending: Story = () => (
  <TxModal title="pending" startTime={Date.now()} txRD={RD.pending} onClose={onClose} onFinish={onFinish} />
)
StoryPending.storyName = 'pending'

export const StoryPendingTxHash: Story = () => (
  <TxModal
    title="pending"
    startTime={Date.now()}
    txRD={RD.pending}
    onClose={onClose}
    txHash={O.some('any-tx-hash')}
    onFinish={onFinish}
  />
)
StoryPendingTxHash.storyName = 'pending + txHash'

export const StorySuccess: Story = () => (
  <TxModal
    title="success"
    txRD={RD.success('txhash')}
    onClose={onClose}
    onViewTxClick={onViewTxClick}
    onFinish={onFinish}
  />
)
StorySuccess.storyName = 'success'

export const StoryFailure: Story = () => (
  <TxModal
    title="error"
    startTime={Date.now()}
    txRD={RD.failure({ errorId: ErrorId.SEND_TX, msg: 'something went wrong' })}
    onClose={onClose}
    onFinish={onFinish}
  />
)
StoryFailure.storyName = 'failure'

const extraContent = (): JSX.Element => (
  <Row align="middle" justify="center">
    <Label align="center" color="warning" textTransform="uppercase">
      Extra Content
    </Label>
    <Button onClick={() => console.log('extra button clicked')} typevalue="outline" color="warning">
      <SyncOutlined />
      Extra Button
    </Button>
  </Row>
)

export const StoryExtra: Story = () => (
  <TxModal
    title="success"
    txRD={RD.success('txhash')}
    onClose={onClose}
    onFinish={onFinish}
    onViewTxClick={onViewTxClick}
    extra={extraContent()}
  />
)
StoryExtra.storyName = 'success + extra content'

const meta: Meta = {
  component: TxModal,
  title: 'Components/TxModal',
  decorators: [
    (S: Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta