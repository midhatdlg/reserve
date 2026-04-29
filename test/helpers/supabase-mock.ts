import { vi } from 'vitest';

/**
 * Minimal thenable chainable query builder compatible with the subset of the
 * Supabase JS client surface we actually use in this codebase:
 *   .from(table).select().eq().maybeSingle()
 *   .from(table).select().eq().order().order()
 *   .from(table).insert().select().single()
 *   .from(table).update().eq()
 *   .from(table).delete().eq()
 *
 * Tests register a per-table response once; the builder records every call so
 * we can assert ordering.
 */

export type TableResponse = { data: unknown; error?: unknown; count?: number | null };

type Method =
  | 'from'
  | 'select'
  | 'eq'
  | 'neq'
  | 'gte'
  | 'lte'
  | 'not'
  | 'order'
  | 'insert'
  | 'update'
  | 'delete'
  | 'maybeSingle'
  | 'single'
  | 'then';

export interface SupabaseMockCall {
  table: string;
  method: Method;
  args: unknown[];
}

export interface SupabaseMock {
  client: {
    from: (table: string) => ChainableBuilder;
    rpc: (fn: string, params: unknown) => Promise<{ data: unknown; error: unknown }>;
    auth: {
      getUser: () => Promise<{ data: { user: null }; error: null }>;
    };
  };
  calls: SupabaseMockCall[];
  rpcCalls: { fn: string; params: unknown }[];
  /** Sticky response for every query against `table`. */
  setResponse: (table: string, response: TableResponse) => void;
  setResponses: (map: Record<string, TableResponse>) => void;
  /**
   * Queue one-shot responses for `table`. Each terminal call (`maybeSingle`,
   * `single`, or awaiting the builder) pops the head of the queue. Once the
   * queue is empty, the sticky `setResponse` value (or `{ data: null }`) is
   * used again.
   */
  queueResponse: (table: string, response: TableResponse) => void;
  reset: () => void;
}

interface ChainableBuilder {
  select: (...args: unknown[]) => ChainableBuilder;
  eq: (...args: unknown[]) => ChainableBuilder;
  neq: (...args: unknown[]) => ChainableBuilder;
  gte: (...args: unknown[]) => ChainableBuilder;
  lte: (...args: unknown[]) => ChainableBuilder;
  not: (...args: unknown[]) => ChainableBuilder;
  order: (...args: unknown[]) => ChainableBuilder;
  insert: (...args: unknown[]) => ChainableBuilder;
  update: (...args: unknown[]) => ChainableBuilder;
  delete: (...args: unknown[]) => ChainableBuilder;
  maybeSingle: () => Promise<TableResponse>;
  single: () => Promise<TableResponse>;
  then: <T>(
    onFulfilled: (value: TableResponse) => T | PromiseLike<T>,
    onRejected?: (reason: unknown) => T | PromiseLike<T>
  ) => Promise<T>;
}

export function createSupabaseMock(): SupabaseMock {
  const responses = new Map<string, TableResponse>();
  const queues = new Map<string, TableResponse[]>();
  const calls: SupabaseMockCall[] = [];

  function record(table: string, method: Method, args: unknown[]) {
    calls.push({ table, method, args });
  }

  function makeBuilder(table: string): ChainableBuilder {
    const resolve = (): TableResponse => {
      const q = queues.get(table);
      if (q && q.length > 0) return q.shift() as TableResponse;
      const r = responses.get(table);
      if (!r) return { data: null, error: null };
      return r;
    };

    const builder: ChainableBuilder = {
      select: (...args) => {
        record(table, 'select', args);
        return builder;
      },
      eq: (...args) => {
        record(table, 'eq', args);
        return builder;
      },
      neq: (...args) => {
        record(table, 'neq', args);
        return builder;
      },
      gte: (...args) => {
        record(table, 'gte', args);
        return builder;
      },
      lte: (...args) => {
        record(table, 'lte', args);
        return builder;
      },
      not: (...args) => {
        record(table, 'not', args);
        return builder;
      },
      order: (...args) => {
        record(table, 'order', args);
        return builder;
      },
      insert: (...args) => {
        record(table, 'insert', args);
        return builder;
      },
      update: (...args) => {
        record(table, 'update', args);
        return builder;
      },
      delete: (...args) => {
        record(table, 'delete', args);
        return builder;
      },
      maybeSingle: () => {
        record(table, 'maybeSingle', []);
        return Promise.resolve(resolve());
      },
      single: () => {
        record(table, 'single', []);
        return Promise.resolve(resolve());
      },
      then: (onFulfilled, onRejected) => {
        record(table, 'then', []);
        return Promise.resolve(resolve()).then(onFulfilled, onRejected);
      },
    };

    return builder;
  }

  const rpcCalls: { fn: string; params: unknown }[] = [];

  const client = {
    from: vi.fn((table: string) => {
      record(table, 'from', []);
      return makeBuilder(table);
    }),
    rpc: vi.fn(async (fn: string, params: unknown) => {
      rpcCalls.push({ fn, params });
      return { data: null, error: null };
    }),
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    },
  };

  return {
    client,
    calls,
    rpcCalls,
    setResponse(table, response) {
      responses.set(table, response);
    },
    setResponses(map) {
      for (const [t, r] of Object.entries(map)) responses.set(t, r);
    },
    queueResponse(table, response) {
      const q = queues.get(table) ?? [];
      q.push(response);
      queues.set(table, q);
    },
    reset() {
      responses.clear();
      queues.clear();
      calls.length = 0;
      rpcCalls.length = 0;
      client.from.mockClear();
      client.rpc.mockClear();
      client.auth.getUser.mockClear();
    },
  };
}
