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
  validate: (target: string, options?: Options) => ValidatedNotificationTarget
  send: (target: string, notification: Notification, options?: Options) => Promise<void>
}

export interface ValidatedNotificationTarget {
  send: (notification: Notification) => Promise<void>
}

export interface DefineProviderValidationContext {
  url: URL
}

export interface DefineProviderContext<Validated = void> extends DefineProviderValidationContext {
  message: Notification
  validated: Validated
}

export interface DefineProviderOptions<T extends Transport, Options, Validated> {
  defaultOptions?: Options
  transport: T
  validate?: (
    this: DefineProviderValidationContext,
    ctx: DefineProviderValidationContext,
    options: Options,
  ) => Validated
  prepare: (
    this: DefineProviderContext<Validated>,
    ctx: DefineProviderContext<Validated>,
    options: Options,
  ) => Promise<InferTransportPayload<T>>
}

export function defineProvider<const Protocol extends string, T extends Transport<any>, Options = void, Validated = void>(
  protocol: Protocol,
  createOptions: DefineProviderOptions<T, Options, Validated>,
): NotificationProvider<Protocol, Options> {
  const validate: NotificationProvider<Protocol, Options>['validate'] = (
    target,
    options,
  ): ValidatedNotificationTarget => {
    const url = new URL(target)

    assert(url.protocol === protocol, `Unexpected protocol "${url.protocol}"`)

    const validationContext: DefineProviderValidationContext = { url }
    const opts = defu(options ?? {}, createOptions.defaultOptions ?? {}) as Options
    const validated = createOptions.validate
      ? createOptions.validate.call(validationContext, validationContext, opts)
      : undefined as Validated

    return {
      async send(notification): Promise<void> {
        assertNotification(notification)

        const ctx: DefineProviderContext<Validated> = {
          ...validationContext,
          message: notification,
          validated,
        }

        const payload = await createOptions.prepare.call(ctx, ctx, opts)

        await createOptions.transport.send(payload)
      },
    }
  }

  const send: NotificationProvider<Protocol, Options>['send'] = async (
    target,
    notification,
    options,
  ): Promise<void> => {
    await validate(target, options).send(notification)
  }

  return {
    get protocol() {
      return protocol
    },
    validate,
    send,
  }
}
