import { ConfigRequest } from '../types';

export function validateConfigRequest(data: any): data is ConfigRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.app_id === 'string' &&
    (data.platform === 'ios' || data.platform === 'android')
  );
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}