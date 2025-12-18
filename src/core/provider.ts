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
  buildRequest: (url: string, message: string, options?: Options) => Promise<Request>
}

export interface DefineProviderContext<Data = unknown> {
  url: URL
  message: string
  data: Data
}

export interface DefineProviderOptions<Data = unknown, Options = unknown> {
  defaultOptions?: Options
  extractor?: (url: URL) => Data
  createRequest: (this: DefineProviderContext<Data>, ctx: DefineProviderContext<Data>, Options: Options) => Request
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
  const createOpt = defu(createOptions, { extractor: DEFAULT_EXTRACTOR }) as Required<DefineProviderOptions<Data>>

  const buildRequest: ServiceProvider<Protocol, Data, Options>['buildRequest'] = async (
    protocolUrl: string,
    message: string,
    options?: Options,
  ): Promise<Request> => {
    const url = new URL(protocolUrl)

    assert(url.protocol === protocol, `Unexpected protocol "${url.protocol}"`)

    const data = createOpt.extractor(url)

    const ctx: DefineProviderContext<Data> = {
      data,
      url,
      message,
    }

    const opts = defu(createOptions.defaultOptions ?? {}, options ?? {}) as Options

    return createOptions.createRequest.call(ctx, ctx, opts)
  }
  return {
    get protocol() {
      return protocol
    },
    buildRequest,
    get defaultOptions() {
      return createOptions.defaultOptions
    },
    $infer: {} as Data,
  }
}
