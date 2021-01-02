import * as core from '@actions/core';
import { runAction } from '../index'
import { getInputs } from '../inputs';
import { DEFAULT_INPUTS, mockInputs, resetInputs } from "./mocks";

jest.mock('@actions/core');

// TODO: don't do this
process.env.IS_TEST = 'true';

describe('action', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    resetInputs();
  });
  afterEach(async () => {
    jest.resetModules();
  });

  test('runs only once if command succeeds', async () => {
    const testData = { ...DEFAULT_INPUTS };
    mockInputs({
      ...testData
    })
    const inputs = getInputs()
    await runAction(inputs)

    expect(core.info).toBeCalledWith('Command completed after 1 attempt(s).')
  });

});
