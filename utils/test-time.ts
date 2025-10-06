// Tiny helper to freeze and restore Date.now()/Date for deterministic tests
export function freezeTime(when: Date | number) {
  const ts = typeof when === 'number' ? when : when.getTime();
  const RealDate = Date;
  // @ts-ignore override constructor for tests
  global.Date = class extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) return new RealDate(ts);
      // @ts-ignore intentionally super
      return new RealDate(...(args as any));
    }
    static now() { return ts; }
  } as any;
  return () => { global.Date = RealDate as any; };
}
