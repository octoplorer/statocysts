import { assert } from '#/utils/assert'
import defu from 'defu'

export interface ServiceProvider<
  Protocol extends string,
  Data = unknown,
  Options = unknown,
> {
  readonly protocol: Protocol
  $infer: Data
  defaultOptions: Options | undefined
  send: (
    url: string,
    message: { title: string, body?: string },
    options?: Options,
  ) => Promise<void>
}

export interface DefineProviderContext<Data = unknown> {
  url: URL
  message: { title: string, body?: string }
  data: Data
}

export interface DefineProviderOptions<Data = unknown, Options = unknown> {
  defaultOptions?: Options
  extractor?: (url: URL) => Data
  send: (
    this: DefineProviderContext<Data>,
    ctx: DefineProviderContext<Data>,
    options: Options,
  ) => Promise<void>
}

export const DEFAULT_EXTRACTOR = (url: URL): unknown => Object.fromEntries(url.searchParams.entries())

export function defineProvider<
  const Protocol extends string,
  Data = unknown,
  Options = unknown,
>(
  protocol: Protocol,
  createOptions: DefineProviderOptions<Data, Options>,
): ServiceProvider<Protocol, Data, Options> {
  const createOpt = defu(createOptions, { extractor: DEFAULT_EXTRACTOR }) as Required<Omit<DefineProviderOptions<Data, Options>, 'send'>>

  const send: ServiceProvider<Protocol, Data, Options>['send'] = async (
    protocolUrl,
    message,
    options,
  ): Promise<void> => {
    const url = new URL(protocolUrl)

    assert(url.protocol === protocol, `Unexpected protocol "${url.protocol}"`)

    const data = createOpt.extractor(url)

    const ctx: DefineProviderContext<Data> = {
      data,
      url,
      message,
    }

    const opts = defu(createOptions.defaultOptions ?? {}, options ?? {}) as Options

    await createOptions.send.call(ctx, ctx, opts)
  }
  return {
    get protocol() {
      return protocol
    },
    send,
    get defaultOptions() {
      return createOptions.defaultOptions
    },
    $infer: {} as Data,
  }
}
