import { wait } from "../util";

describe('wait', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });
  afterEach(async () => {
    jest.resetModules();
  });

  test('it works', async () => {
    const duration = 1000; // ms
    const start = Date.now();
    await wait(duration);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(duration);
  });
});
