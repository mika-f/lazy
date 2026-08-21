# lazy

A tiny lazy initialization utility for TypeScript.  
Values are created only when they are first accessed and are cached afterwards.  
Both synchronous and asynchronous lazy values share the same failure semantics:

- successful initialization is cached
- failed initialization is not cached
- accessing the value again after a failure retries initialization

## Installation

```sh
npm install @natsuneko-laboratory/lazy
```

## Usage

### `Lazy<T>`

```ts
import { Lazy } from "@natsuneko-laboratory/lazy";

const value = new Lazy(() => {
  console.log("initialized");
  return expensiveOperation();
});

// The factory has not been called yet.
console.log(value.isValueCreated); // false

const first = value.value;
// "initialized"

console.log(value.isValueCreated); // true

const second = value.value;

// The factory is only called once.
console.log(first === second); // true
```

### `AsyncLazy<T>`

`AsyncLazy<T>` provides the same behavior for asynchronous initialization.

```ts
import { AsyncLazy } from "@natsuneko-laboratory/lazy";

const value = new AsyncLazy(async () => {
  const response = await fetch("https://example.com/data");
  return response.json();
});

const result = await value.value;
```

Concurrent accesses share the same initialization promise:

```ts
const first = value.value;
const second = value.value;

console.log(first === second); // true

await Promise.all([first, second]);
```

The factory is still executed only once.

## Failure behavior

Initialization failures are not cached.

### Synchronous

```ts
let attempts = 0;

const value = new Lazy(() => {
  attempts++;

  if (attempts === 1) {
    throw new Error("Failed");
  }

  return "success";
});

try {
  value.value;
} catch {
  // Initialization failed.
}

console.log(value.isValueCreated); // false

console.log(value.value); // "success"
console.log(attempts); // 2
```

### Asynchronous

```ts
let attempts = 0;

const value = new AsyncLazy(async () => {
  attempts++;

  if (attempts === 1) {
    throw new Error("Failed");
  }

  return "success";
});

try {
  await value.value;
} catch {
  // Initialization failed.
}

console.log(value.isValueCreated); // false

console.log(await value.value); // "success"
console.log(attempts); // 2
```

For `AsyncLazy`, concurrent accesses during initialization share the same promise. If that promise rejects, the cached promise is cleared and the next access starts a new initialization attempt.

## API

### `Lazy<T>`

```ts
new Lazy<T>(factory: () => T)
```

Creates a lazily initialized value.

#### `value`

```ts
get value(): T
```

Returns the initialized value.

On the first access, `factory` is called. If initialization succeeds, its result is cached and returned for all subsequent accesses.

If `factory` throws, the error is propagated and initialization remains incomplete. The next access retries the factory.

#### `isValueCreated`

```ts
get isValueCreated(): boolean
```

Returns whether a successfully initialized value is currently cached.

---

### `AsyncLazy<T>`

```ts
new AsyncLazy<T>(factory: () => Promise<T>)
```

Creates a lazily initialized asynchronous value.

#### `value`

```ts
get value(): Promise<T>
```

Returns the initialization promise.

The first access starts initialization. Concurrent accesses return the same promise.

If initialization succeeds, the promise remains cached. If initialization fails, the cached promise is cleared so that the next access retries initialization.

#### `isValueCreated`

```ts
get isValueCreated(): boolean
```

Returns whether an initialization is currently cached.

For `AsyncLazy`, this becomes `true` as soon as initialization starts. If initialization rejects, it becomes `false` again.

## License

MIT by [@6jz](https://twitter.com/6jz).