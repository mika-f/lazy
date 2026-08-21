export class Lazy<T> {
  private _value: T | undefined;
  private _factory: (() => T) | undefined;
  private _isValueInitialized: boolean = false;

  constructor(factory: () => T) {
    this._factory = factory;
  }

  get value(): T {
    if (!this._isValueInitialized) {
      this._value = this._factory!();
      this._factory = undefined;
      this._isValueInitialized = true;
    }

    return this._value!;
  }

  get isValueCreated(): boolean {
    return this._isValueInitialized;
  }
}

export class AsyncLazy<T> {
  private _value: Promise<T> | undefined;
  private _factory: (() => Promise<T>) | undefined;

  constructor(factory: () => Promise<T>) {
    this._factory = factory;
  }

  get value(): Promise<T> {
    if (!this._value) {
      this._value = this._factory?.().then((value) => {
        this._factory = undefined;
        return value;
      }).catch((error) => {
        this._value = undefined;
        throw error;
      });
    }

    return this._value!;
  }

  get isValueCreated(): boolean {
    return this._value !== undefined;
  }
}