import { DEFAULT_MAX_ATTEMPTS, DEFAULT_POLLING_INTERVAL_SECONDS, DEFAULT_RETRY_ON, DEFAULT_RETRY_WAIT_SECONDS, EITHER_MINUTES_OR_SECONDS_ERR, getInputs } from '../inputs';
import { Inputs } from '../interfaces';

// TODO: don't do this
process.env.IS_TEST = 'true';

const DEFAULT_INPUTS: Inputs = {
  command: "node -e 'console.log('testing');'",
  max_attempts: 3,
  polling_interval_seconds: 1,
  retry_on: 'any',
  retry_wait_seconds: 5,
  timeout_seconds: 5,
  warning_on_retry: true
}

function resetInputs() {
  Object.keys(process.env).filter(env => env.startsWith('INPUT_')).forEach(key => delete process.env[key])
}

function mockInputs(inputs: Inputs): void {
  for (const input in inputs) {
    const envVar = `INPUT_${input}`.toUpperCase();
    // @ts-ignore
    process.env[envVar] = inputs[input]
  }
}

describe('getInputs', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    resetInputs();
  });
  afterEach(async () => {
    jest.resetModules();
  });

  test('returns expected defaults', async () => {
    const testData = { ...DEFAULT_INPUTS };
    mockInputs({
      ...testData
    })
    const inputs = getInputs()

    expect(inputs.command).toEqual(testData.command);
    expect(inputs.max_attempts).toEqual(testData.max_attempts);
    expect(inputs.polling_interval_seconds).toEqual(testData.polling_interval_seconds);
    expect(inputs.retry_on).toEqual(testData.retry_on);
    expect(inputs.retry_wait_seconds).toEqual(testData.retry_wait_seconds);
    expect(inputs.timeout_ms).toEqual(testData.timeout_seconds! * 1000);
    expect(inputs.warning_on_retry).toEqual(testData.warning_on_retry);
  });

  test('timeout_ms (timeout_seconds input)', async () => {
    const testData = { ...DEFAULT_INPUTS };
    mockInputs({
      ...testData
    })
    const inputs = getInputs()

    expect(inputs.timeout_ms).toEqual(testData.timeout_seconds! * 1000);
  });

  test('timeout_ms (timeout_minutes input)', async () => {
    const testData = { ...DEFAULT_INPUTS };
    delete testData.timeout_seconds
    testData.timeout_minutes = 1;
    mockInputs({
      ...testData
    })
    const inputs = getInputs()

    expect(inputs.timeout_ms).toEqual(testData.timeout_minutes! * (60000));
  });

  test('timeout_ms (error when no timeout_minutes or timeout_seconds)', async () => {
    const testData = { ...DEFAULT_INPUTS };
    delete testData.timeout_seconds
    delete testData.timeout_minutes
    mockInputs({
      ...testData
    })
    let err = '';

    try {
      getInputs()
    } catch (error) {
      err = error.message
    }

    expect(err).toEqual(EITHER_MINUTES_OR_SECONDS_ERR.message);
  });

  test('timeout_ms (error when both timeout_minutes or timeout_seconds)', () => {
    const testData = { ...DEFAULT_INPUTS };
    testData.timeout_seconds = 1;
    testData.timeout_minutes = 2;

    mockInputs({
      ...testData
    })
    let err = '';

    try {
      getInputs()
    } catch (error) {
      err = error.message
    }

    expect(err).toEqual(EITHER_MINUTES_OR_SECONDS_ERR.message);
  });

  test('max_attempts', async () => {
    const testData = { ...DEFAULT_INPUTS };
    // @ts-ignore
    delete testData.max_attempts
    mockInputs({
      ...testData
    })
    const inputs = getInputs()

    expect(inputs.max_attempts).toEqual(DEFAULT_MAX_ATTEMPTS);
  });

  test('retry_wait_seconds', async () => {
    const testData = { ...DEFAULT_INPUTS };
    // @ts-ignore
    delete testData.retry_wait_seconds
    mockInputs({
      ...testData
    })
    const inputs = getInputs()

    expect(inputs.retry_wait_seconds).toEqual(DEFAULT_RETRY_WAIT_SECONDS);
  });

  test('polling_interval_seconds', async () => {
    const testData = { ...DEFAULT_INPUTS };
    // @ts-ignore
    delete testData.polling_interval_seconds
    mockInputs({
      ...testData
    })
    const inputs = getInputs()

    expect(inputs.polling_interval_seconds).toEqual(DEFAULT_POLLING_INTERVAL_SECONDS);
  });

  test('retry_on', async () => {
    const testData = { ...DEFAULT_INPUTS };
    // @ts-ignore
    delete testData.retry_on
    mockInputs({
      ...testData
    })
    const inputs = getInputs()

    expect(inputs.retry_on).toEqual(DEFAULT_RETRY_ON);
  });

  test('invalid numeric input', async () => {
    const testData = { ...DEFAULT_INPUTS };

    mockInputs({
      ...testData
    })
    process.env.INPUT_TIMEOUT_SECONDS = 'ZZZ';
    let err = '';

    try {
      await getInputs();
    } catch (error) {
      err = error.message;
    }

    expect(err).toContain('only accepts numbers');
  });
});
