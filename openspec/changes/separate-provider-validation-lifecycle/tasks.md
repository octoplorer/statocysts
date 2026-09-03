## 1. Core provider lifecycle

- [ ] 1.1 Add core provider tests for synchronous `validate(target, options?)`, generic URL/protocol rejection, option merging, reusable validated bindings, notification validation, and zero transport calls during validation.
- [ ] 1.2 Extend the provider types and `defineProvider()` with a generic validated-state hook and validated target binding whose `send(notification)` performs `prepare()` followed by one transport call.
- [ ] 1.3 Make concrete provider `send(target, notification, options?)` delegate through `validate()` while preserving existing success results and original validation/transport errors.

## 2. Built-in provider migration

- [ ] 2.1 Migrate Slack, Discord, and Telegram hostname, credential, path, and query parsing into typed validation state; keep request/message construction in `prepare()` and preserve existing HTTP payload tests.
- [ ] 2.2 Migrate Lark and QQ Bot target parsing into typed validation state, with tests proving validation neither generates a Lark signature nor requests a QQ Bot access token.
- [ ] 2.3 Migrate Bark and Server Chan host/version, key/path, and query parsing into typed validation state while preserving their existing request payloads and error messages.
- [ ] 2.4 Migrate Email target/options/query parsing and Logger level parsing into typed validation state, including coverage for `defaultFrom` option-dependent validation and no transport calls on invalid input.
- [ ] 2.5 Adapt JSON and JSONS to the validation lifecycle with no extra provider restrictions, retaining URL/header/body mapping in the preparation stage.
- [ ] 2.6 Add or update direct provider validation tests so every existing provider-specific invalid-target case fails through `validate()` and every valid `validate()` remains free of transport or remote side effects.

## 3. Runtime binding and delivery

- [ ] 3.1 Update runtime test providers and add tests for provider-specific rejection during `createNotifier()`, cached validated binding reuse, synchronous/no-I/O creation, and unchanged parallel delivery/error aggregation.
- [ ] 3.2 Change the runtime provider contract and `BoundTarget` to store the result of provider validation at notifier creation, then deliver through that binding without revalidating the target.
- [ ] 3.3 Replace provider catalog tests' generic synthetic URLs with per-provider minimal valid fixtures while retaining catalog/export consistency, duplicate protocol, and direct notification validation coverage.

## 4. CLI verification and documentation

- [ ] 4.1 Extend CLI tests with a registered but provider-invalid URL, mixed valid/invalid results, and a valid remote-auth provider target that proves verify performs no transport or remote request.
- [ ] 4.2 Keep CLI verify routed through `createNotifier([url])` and confirm its existing per-URL output and exit-code behavior now reports provider-specific validation messages.
- [ ] 4.3 Update CLI/package documentation and English/Chinese site pages for CLI, error handling, troubleshooting, runtime concepts, and API failure timing to describe local provider validation and its no-remote-check boundary.

## 5. Verification

- [ ] 5.1 Run focused core, runtime, provider catalog, built-in provider, and CLI test suites and fix any lifecycle or payload regressions.
- [ ] 5.2 Run `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm docs:check`.
- [ ] 5.3 Run `openspec validate separate-provider-validation-lifecycle --strict` and confirm every changed runtime and CLI scenario is covered.
