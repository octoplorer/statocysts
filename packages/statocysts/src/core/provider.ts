import type { Transport } from './transport'
import { assert } from '#/utils/assert'
import defu from 'defu'

// Utility type to infer Payload from Transport
type InferTransportPayload<T> = T extends Transport<infer P> ? P : never

export interface ServiceProvider<
  Protocol extends string,
  Payload,
  Options = void,
> {
  readonly $transport: Transport<Payload>
  readonly protocol: Protocol
  defaultOptions: Options | undefined
  send: (url: string, message: { title: string, body?: string }, options?: Options) => Promise<void>
}

export interface DefineProviderContext {
  url: URL
  message: { title: string, body?: string }
}

export interface DefineProviderOptions<T extends Transport<any>, Options> {
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
): ServiceProvider<Protocol, InferTransportPayload<T>, Options> {
  const send: ServiceProvider<Protocol, InferTransportPayload<T>, Options>['send'] = async (
    protocolUrl,
    message,
    options,
  ): Promise<void> => {
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
