import { getQuery } from 'ufo'
import * as v from 'valibot'

export function safeParseQuery<const TSchema extends v.GenericSchema>(
  url: URL | string,
  schema: TSchema,
): v.SafeParseResult<TSchema> {
  return v.safeParse(schema, getQuery(url.toString()))
}

export function withoutPathname(input: string): string {
  const _url = new URL(input)
  _url.pathname = ''
  return _url.toString()
}
