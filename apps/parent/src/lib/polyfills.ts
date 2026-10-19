/**
 * pdf.js 6 uses Map/WeakMap `getOrInsert` / `getOrInsertComputed` (a 2025 JavaScript addition) when
 * drawing pages. Older browsers — and older iPads — don't have them yet, so add them when missing.
 */
type AnyMap = Map<unknown, unknown> | WeakMap<object, unknown>;

for (const C of [Map, WeakMap] as unknown as { prototype: AnyMap & Record<string, unknown> }[]) {
  const proto = C.prototype as unknown as Record<string, unknown>;
  if (typeof proto.getOrInsert !== 'function')
    Object.defineProperty(proto, 'getOrInsert', {
      configurable: true,
      writable: true,
      value(this: Map<unknown, unknown>, key: unknown, value: unknown) {
        if (!this.has(key)) this.set(key, value);
        return this.get(key);
      },
    });
  if (typeof proto.getOrInsertComputed !== 'function')
    Object.defineProperty(proto, 'getOrInsertComputed', {
      configurable: true,
      writable: true,
      value(this: Map<unknown, unknown>, key: unknown, compute: (k: unknown) => unknown) {
        if (!this.has(key)) this.set(key, compute(key));
        return this.get(key);
      },
    });
}

export {};
