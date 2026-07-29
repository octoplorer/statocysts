import type { Notification } from './notification'
import type { Transport } from './transport'
import defu from 'defu'
import { assert } from '#/utils'
import { assertNotification } from './notification'

// Utility type to infer Payload from Transport
type InferTransportPayload<T> = T extends Transport<infer P> ? P : never

export interface NotificationProvider<
  Protocol extends string,
  Options = void,
> {
  readonly protocol: Protocol
  send: (target: string, notification: Notification, options?: Options) => Promise<void>
}

export interface DefineProviderContext {
  url: URL
  message: Notification
}

export interface DefineProviderOptions<T extends Transport, Options> {
  defaultOptions?: Options
  transport: T
  prepare: (
    this: DefineProviderContext,
    ctx: DefineProviderContext,
    options: Options,
  ) => Promise<InferTransportPayload<T>>
}

export function defineProvider<const Protocol extends string, T extends Transport<any>, Options = void>(
  protocol: Protocol,
  createOptions: DefineProviderOptions<T, Options>,
): NotificationProvider<Protocol, Options> {
  const send: NotificationProvider<Protocol, Options>['send'] = async (
    target,
    notification,
    options,
  ): Promise<void> => {
    assertNotification(notification)

    const url = new URL(target)

    assert(url.protocol === protocol, `Unexpected protocol "${url.protocol}"`)

    const ctx: DefineProviderContext = {
      url,
      message: notification,
    }

    const opts = defu(options ?? {}, createOptions.defaultOptions ?? {}) as Options

    const payload = await createOptions.prepare.call(ctx, ctx, opts)

    await createOptions.transport.send(payload)
  }
  return {
    get protocol() {
      return protocol
    },
    send,
  }
}
