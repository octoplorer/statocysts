import type { Transport } from './transport'
import { assert } from '#/utils/assert'
import defu from 'defu'

export interface ServiceProvider<
  Protocol extends string,
  T extends Transport<any>,
  Options = void,
> {
  readonly $transport: T
  readonly protocol: Protocol
  defaultOptions: Options | undefined
  send: (url: string, message: { title: string, body?: string }, options?: Options) => Promise<void>
}

export interface DefineProviderContext {
  url: URL
  message: { title: string, body?: string }
}

export interface DefineProviderOptions<Payload, Options> {
  defaultOptions?: Options
  transport: Transport<Payload>
  prepare: (
    this: DefineProviderContext,
    ctx: DefineProviderContext,
    options: Options,
  ) => Promise<Payload>
}

export function defineProvider<const Protocol extends string, Payload, Options>(
  protocol: Protocol,
  createOptions: DefineProviderOptions<Payload, Options>,
): ServiceProvider<Protocol, Transport<Payload>, Options> {
  const send: ServiceProvider<Protocol, Transport<Payload>, Options>['send'] = async (protocolUrl, message, options): Promise<void> => {
    const url = new URL(protocolUrl)

    assert(url.protocol === protocol, `Unexpected protocol "${url.protocol}"`)

    const ctx: DefineProviderContext = {
      url,
      message,
    }

    const opts = defu(createOptions.defaultOptions ?? {}, options ?? {}) as Options

    const payload = await createOptions.prepare.call(ctx, ctx, opts)

    await createOptions.transport.send(payload)
  }
  return {
    get protocol() {
      return protocol
    },
    get defaultOptions() {
      return createOptions.defaultOptions
    },
    get $transport() {
      return createOptions.transport
    },
    send,
  }
}
