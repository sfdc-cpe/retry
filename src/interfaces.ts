export interface ActionConfig extends Omit<Inputs, 'timeout_minutes' | 'timeout_seconds'> {
  timeout_ms: number;
}

export interface Inputs {
  timeout_minutes?: number;
  timeout_seconds?: number;
  max_attempts: number;
  command: string;
  retry_wait_seconds: number;
  polling_interval_seconds: number;
  retry_on: string;
  warning_on_retry: boolean;
}