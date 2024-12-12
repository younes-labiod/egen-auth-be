import { AsyncLocalStorage } from 'async_hooks';

interface RequestContextStore {
  transactionUuid: string;
}

export class RequestContext {
  private static storage = new AsyncLocalStorage<RequestContextStore>();

  static setTransactionUuid(transactionUuid: string) {
    const store = this.storage.getStore() || {};
    this.storage.enterWith({ ...store, transactionUuid });
  }

  static getTransactionUuid(): string {
    const store = this.storage.getStore();
    return store?.transactionUuid || null;
  }
}
