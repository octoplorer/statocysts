import { describe, expectTypeOf, it } from "vitest";
import { send } from "./sender";

describe("send type", () => { 
  it("send generic return type can be typed as expected", () => {
    const defaultReturn = send('generic://localhost:3000', 'Hello, world!')
    expectTypeOf(defaultReturn).toEqualTypeOf<Promise<unknown>>()

    const okReturn = send<{ ok: boolean }>('generic://localhost:3000', 'Hello, world!')
    expectTypeOf(okReturn).toEqualTypeOf<Promise<{ ok: boolean }>>()
  })
})
