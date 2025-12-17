import { assert } from '#/utils/assert'
import defu from 'defu'

export interface ServiceProvider<
  Protocol extends string,
  ServiceParams,
> {
  readonly protocol: Protocol
  $infer: ServiceParams
  send: (url: string, message: string) => Promise<Request>
}

export interface DefineProviderContext<
  ServiceParams,
> {
  url: URL
  params: ServiceParams
  message: string
}

export interface DefineProviderOptions<ServiceParams> {
  extractor?: (url: URL) => unknown
  parser: (data: unknown) => Promise<ServiceParams> | ServiceParams
  createRequest: (this: DefineProviderContext<ServiceParams>, params: ServiceParams) => Request
}

export const DEFAULT_EXTRACTOR = (url: URL): unknown => Object.fromEntries(url.searchParams.entries())

export function defineProvider<
  const Protocol extends string,
  ServiceParams,
>(
  protocol: Protocol,
  createOptions: DefineProviderOptions<ServiceParams>,
): ServiceProvider<Protocol, ServiceParams> {
  const createOpt = defu(createOptions, { extractor: DEFAULT_EXTRACTOR }) as Required<DefineProviderOptions<ServiceParams>>

  const send: ServiceProvider<Protocol, ServiceParams>['send'] = async (
    protocolUrl: string,
    message: string,
  ): Promise<Request> => {
    const url = new URL(protocolUrl)

    assert(url.protocol === protocol, `Unexpected protocol "${url.protocol}"`)

    const data = createOpt.extractor(url)
    const params = createOptions.parser(data)

    const ctx: DefineProviderContext<ServiceParams> = {
      url,
      params: params instanceof Promise ? await params : params,
      message,
    }

    return createOptions.createRequest.call(ctx, ctx.params)
  }
  return {
    get protocol() {
      return protocol
    },
    send,
    $infer: {} as ServiceParams,
  }
}
