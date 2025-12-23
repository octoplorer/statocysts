import { getQuery } from 'ufo'

export function getValidateQuery<T>(
  url: URL | string,
  parser: (params: unknown) => T,
): T {
  const query = getQuery(url.toString())
  return parser(query)
}

export function withoutPathname(input: string): string {
  const _url = new URL(input)
  _url.pathname = ''
  return _url.toString()
}
