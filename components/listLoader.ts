import { Application, FeathersService } from "@feathersjs/feathers";
import _ from "lodash";

abstract class ListLoaderBase<T> {
  abstract readonly store: T[];
  abstract readonly loaded: boolean;
  loading = false;

  limit: number = 10;
  pageStart: number = 0;
  session: number = 0;

  abstract readonly total: number;
  abstract reset(delay?: boolean): void;

  executor: Promise<void> | null = null;

  execute() {
    if (this.executor) return this.executor;
    if (this.loaded) return Promise.resolve();
    this.executor = this._executeCore();
    return this.executor;
  }

  abstract executeCore(): Promise<void>;
  async _executeCore() {
    const session = this.session;
    try {
      this.loading = true;
      await this.executeCore();
    } catch (error) {
      console.warn(error.message);
      console.warn(error.stack);
    } finally {
      if (session === this.session) {
        this.loading = false;
        this.executor = null;
      }
    }
  }

  setLimit(limit: number) {
    this.limit = limit;
  }

  setPageStart(pageStart: number) {
    this.pageStart = pageStart;
    this.reset(false);
    return this.execute();
  }

  setStore(store: T[]) {
    this.store.splice(0, store.length);
    this.store.push(...store);
  }
}

export interface Props {
  feathers: Application;
  query?: any;
  noPaginate?: boolean;
  limit?: number;
}

export default class ListLoader<T> extends ListLoaderBase<T> {
  store: T[] = [];
  loaded: boolean = false;
  total: number = 0;
  path!: string;

  feathers!: Application;
  service: FeathersService;
  cursor: number = 0;
  query: any = {};
  noPaginate: boolean = false;

  apiLocks: (() => void)[] = null;

  constructor(path: string, { feathers, query, noPaginate, limit }: Props) {
    super();
    this.path = path;
    this.feathers = feathers;
    this.query = query;
    this.noPaginate = noPaginate;
    this.limit = Math.max(10, limit || this.limit);
    this.service = this.feathers.service(path);
    this.execute();
  }

  setQuery(query: any) {
    if (_.isEqual(this.query, query)) return this.executor;
    this.query = query;
    this.reset(false);
    return this.execute();
  }

  reset(delay?: boolean): void {
    this.session++;
    this.cursor = 0;
    this.total = 0;
    this.loading = false;
    this.loaded = false;
    if (!delay) {
      this.store.splice(0, this.store.length);
    }
    this.executor = null;
    this.apiLocks = null;
  }
  async executeCore(): Promise<void> {
    const session = this.session;
    await Promise.resolve();
    if (session !== this.session) return;

    try {
      let query = {
        ...this.query,
        ...(this.noPaginate ? {} : { $limit: this.limit }),
        $skip: this.cursor + this.pageStart,
      };
      query = JSON.parse(JSON.stringify(query));

      if (this.apiLocks) {
        await new Promise<void>((resolve) => this.apiLocks.push(resolve));
        if (session !== this.session) return;
      } else {
        this.apiLocks = [];
      }

      // Assume service using paginated data
      /**  @type {Paginated} contains total, limit, skip and data */
      let paged: any = await this.service.find({ query });
      if (session !== this.session) return;
      if (this.noPaginate) {
        this.loaded = true;
        paged = {
          total: paged.length,
          data: paged,
        };
      }

      if (Array.isArray(paged)) {
        console.warn(`Need no paginate for ${this.path}`);
      }

      let count = paged.data.length;

      this.total = paged.total;

      if (!this.cursor) {
        this.store.splice(0, this.store.length);
      }
      this.cursor += count;
      this.store.push(...paged.data);

      if (count === 0 || this.cursor >= paged.total) this.loaded = true;

      await Promise.resolve();

      if (session !== this.session) return;

      if (this.apiLocks && this.apiLocks.length) {
        this.apiLocks.shift()();
      } else {
        this.apiLocks = null;
      }
    } catch (error) {
      this.loaded = true;
      throw error;
    }
  }
}
