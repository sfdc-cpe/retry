import { getInput } from '@actions/core';
import ms from 'milliseconds';
import { ActionConfig } from './interfaces';

export const DEFAULT_MAX_ATTEMPTS = 3
export const DEFAULT_RETRY_WAIT_SECONDS = 10
export const DEFAULT_POLLING_INTERVAL_SECONDS = 1
export const DEFAULT_RETRY_ON = 'any'
export const EITHER_MINUTES_OR_SECONDS_ERR = new Error('Must specify either timeout_minutes or timeout_seconds inputs')

function getInputNumber(id: string, required: boolean): number | undefined {
  const input = getInput(id, { required });
  const num = Number.parseInt(input);

  // empty is ok
  if (!input && !required) {
    return;
  }

  if (!Number.isInteger(num)) {
    throw `Input ${id} only accepts numbers.  Received ${input}`;
  }

  return num;
}

export function getInputs(): ActionConfig {
  const timeout_minutes = getInputNumber('timeout_minutes', false);
  const timeout_seconds = getInputNumber('timeout_seconds', false);
  const max_attempts = getInputNumber('max_attempts', false) || DEFAULT_MAX_ATTEMPTS;
  const command = getInput('command', { required: true });
  const retry_wait_seconds = getInputNumber('retry_wait_seconds', false) || DEFAULT_RETRY_WAIT_SECONDS;
  const polling_interval_seconds = getInputNumber('polling_interval_seconds', false) || DEFAULT_POLLING_INTERVAL_SECONDS;
  const retry_on = getInput('retry_on') || DEFAULT_RETRY_ON;
  const warning_on_retry = getInput('warning_on_retry').toLowerCase() === 'true';

  if ((!timeout_minutes && !timeout_seconds) || (timeout_minutes && timeout_seconds)) {
    throw EITHER_MINUTES_OR_SECONDS_ERR;
  }

  const timeout_ms = timeout_minutes ? ms.minutes(timeout_minutes) : ms.seconds(timeout_seconds!);

  return {
    timeout_ms,
    max_attempts,
    command,
    retry_on,
    retry_wait_seconds,
    polling_interval_seconds,
    warning_on_retry
  }
}