import { getInput, error, warning, info, debug, setOutput } from '@actions/core';
import { exec } from 'child_process';
import ms from 'milliseconds';
import kill from 'tree-kill';
import { ActionConfig } from './interfaces';
import { getInputs } from './inputs';

import { wait } from './util';

const OUTPUT_TOTAL_ATTEMPTS_KEY = 'total_attempts';
const OUTPUT_EXIT_CODE_KEY = 'exit_code';
const OUTPUT_EXIT_ERROR_KEY = 'exit_error';

var exit: number;
var done: boolean;

async function retryWait(config: ActionConfig) {
  const waitStart = Date.now();
  await wait(config.retry_wait_seconds);
  debug(`Waited ${Date.now() - waitStart}ms`);
  debug(`Configured wait: ${config.retry_wait_seconds}ms`);
}

async function runCmd(config: ActionConfig) {
  const end_time = Date.now() + config.timeout_ms;

  exit = 0;
  done = false;

  var child = exec(config.command);

  child.stdout?.on('data', (data) => {
    process.stdout.write(data);
  });
  child.stderr?.on('data', (data) => {
    process.stdout.write(data);
  });

  child.on('exit', (code, signal) => {
    debug(`Code: ${code}`);
    debug(`Signal: ${signal}`);
    if (code && code > 0) {
      exit = code;
    }
    // timeouts are killed manually
    if (signal === 'SIGTERM') {
      return;
    }
    done = true;
  });

  do {
    await wait(ms.seconds(config.polling_interval_seconds));
  } while (Date.now() < end_time && !done);

  if (!done) {
    kill(child.pid);
    await retryWait(config);
    throw new Error(`Timeout of ${config.timeout_ms}ms hit`);
  } else if (exit > 0) {
    await retryWait(config);
    throw new Error(`Child_process exited with error code ${exit}`);
  } else {
    return;
  }
}

export async function runAction(config: ActionConfig) {

  for (let attempt = 1; attempt <= config.max_attempts; attempt++) {
    try {
      // just keep overwriting attempts output
      setOutput(OUTPUT_TOTAL_ATTEMPTS_KEY, attempt);
      await runCmd(config);
      info(`Command completed after ${attempt} attempt(s).`);
      break;
    } catch (error) {
      if (attempt === config.max_attempts) {
        throw new Error(`Final attempt failed. ${error.message}`);
      } else if (!done && config.retry_on === 'error') {
        // error: timeout
        throw error;
      } else if (exit > 0 && config.retry_on === 'timeout') {
        // error: error
        throw error;
      } else {
        if (config.warning_on_retry) {
          warning(`Attempt ${attempt} failed. Reason: ${error.message}`);
        } else {
          info(`Attempt ${attempt} failed. Reason: ${error.message}`);
        }
      }
    }
  }
}

// TODO: after tests added, fix this.  it's not great
if (!process.env.IS_TEST) {
  const inputs = getInputs();

  runAction(inputs)
    .then(() => {
      setOutput(OUTPUT_EXIT_CODE_KEY, 0);
      process.exit(0); // success
    })
    .catch((err) => {
      error(err.message);

      // these can be  helpful to know if continue-on-error is true
      setOutput(OUTPUT_EXIT_ERROR_KEY, err.message);
      setOutput(OUTPUT_EXIT_CODE_KEY, exit > 0 ? exit : 1);

      // exit with exact error code if available, otherwise just exit with 1
      process.exit(exit > 0 ? exit : 1);
    })
}