// Tiny helper to freeze and restore Date.now()/Date for deterministic tests
export function freezeTime(when: Date | number) {
  const ts = typeof when === 'number' ? when : when.getTime();
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(ts);
      } else {
        // @ts-ignore
        super(...args);
      }
    }
    static now() { return ts; }
  }
  // @ts-ignore
  global.Date = FakeDate;
  return () => { /* @ts-ignore */ global.Date = RealDate; };
}
