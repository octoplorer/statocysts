import { assert } from '#/utils/assert'
import defu from 'defu'

export interface ServiceProvider<Protocol extends string, Data = unknown> {
  readonly protocol: Protocol
  $infer: Data
  buildRequest: (url: string, message: string) => Promise<Request>
}

export interface DefineProviderContext<Data = unknown> {
  url: URL
  message: string
  data: Data
}

export interface DefineProviderOptions<Data = unknown> {
  extractor?: (url: URL) => Data
  createRequest: (this: DefineProviderContext<Data>) => Request
}

export const DEFAULT_EXTRACTOR = (url: URL): unknown => Object.fromEntries(url.searchParams.entries())

export function defineProvider<
  const Protocol extends string,
  Data = unknown,
>(
  protocol: Protocol,
  createOptions: DefineProviderOptions<Data>,
): ServiceProvider<Protocol, Data> {
  const createOpt = defu(createOptions, { extractor: DEFAULT_EXTRACTOR }) as Required<DefineProviderOptions<Data>>

  const send: ServiceProvider<Protocol>['buildRequest'] = async (
    protocolUrl: string,
    message: string,
  ): Promise<Request> => {
    const url = new URL(protocolUrl)

    assert(url.protocol === protocol, `Unexpected protocol "${url.protocol}"`)

    const data = createOpt.extractor(url)

    const ctx: DefineProviderContext<Data> = {
      data,
      url,
      message,
    }

    return createOptions.createRequest.call(ctx)
  }
  return {
    get protocol() {
      return protocol
    },
    buildRequest: send,
    $infer: {} as Data,
  }
}
