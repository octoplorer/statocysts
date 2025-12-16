import type { FetchOptions, MappedResponseType, ResponseType } from 'ofetch'
import { ofetch } from 'ofetch'

export interface ServiceProvider<
  Protocol extends string,
  ServiceParams,
> {
  readonly protocol: Protocol
  $infer: ServiceParams
  send: <Response, T extends ResponseType>(url: string, message: string, options?: FetchOptions<T, Response>) => Promise<MappedResponseType<T, Response>>

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

export function defineProvider<
  const Protocol extends string,
  ServiceParams,
>(
  protocol: Protocol,
  createOptions: DefineProviderOptions<ServiceParams>,
): ServiceProvider<Protocol, ServiceParams> {
  const send: ServiceProvider<Protocol, ServiceParams>['send'] = async <R, T extends ResponseType>(
    protocolUrl: string,
    message: string,
    options?: FetchOptions<T>,
  ): Promise<MappedResponseType<T, R>> => {
    const url = new URL(protocolUrl)

    const data = createOptions.extractor
      ? createOptions.extractor(url)
      : Object.fromEntries(url.searchParams.entries())
    const params = createOptions.parser(data)
    const ctx: DefineProviderContext<ServiceParams> = {
      url,
      params: params instanceof Promise ? await params : params,
      message,
    }

    const request = createOptions.createRequest.call(ctx, ctx.params)

    return ofetch<R, T>(request, options)
  }
  return {
    get protocol() {
      return protocol
    },
    send,
    $infer: {} as ServiceParams,
  }
}
