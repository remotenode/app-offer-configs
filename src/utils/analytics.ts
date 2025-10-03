export function trackEvent(eventName: string, properties: Record<string, any>): void {
  console.log('Analytics event:', eventName, properties);
}

export function trackError(error: Error, context: Record<string, any>): void {
  console.error('Analytics error:', error.message, context);
}