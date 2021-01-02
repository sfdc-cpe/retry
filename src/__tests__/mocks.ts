import { Inputs } from "../interfaces";

export const DEFAULT_INPUTS: Inputs = {
  command: "node -e 'console.log('test'+'ing');'",
  max_attempts: 3,
  polling_interval_seconds: 1,
  retry_on: 'any',
  retry_wait_seconds: 5,
  timeout_seconds: 5,
  warning_on_retry: true
}

export function resetInputs() {
  Object.keys(process.env).filter(env => env.startsWith('INPUT_')).forEach(key => delete process.env[key])
}

export function mockInputs(inputs: Inputs): void {
  for (const input in inputs) {
    const envVar = `INPUT_${input}`.toUpperCase();
    // @ts-ignore
    process.env[envVar] = inputs[input]
  }
}