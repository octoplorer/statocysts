import { getQuery } from 'ufo'

export function getValidateQuery<T>(
  url: URL | string,
  parser: (params: unknown) => T,
): T {
  const query = getQuery(url.toString())
  return parser(query)
}
