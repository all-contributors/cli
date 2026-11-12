/**
 * An error caused by the user's project setup rather than a bug in the CLI.
 * The CLI prints only the message for these, without a stack trace.
 */
export class UserError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'UserError';
  }
}
