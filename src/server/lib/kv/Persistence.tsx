import "server-only";

import { type VercelKV } from "@vercel/kv";
import Redis from "ioredis";

// const URL = process.env.USERS_REST_API_URL ?? "https://major-hermit-40200.kv.vercel-storage.com";
// const TOKEN =
//   process.env.USERS_REST_API_TOKEN ??
//   "AZ0IASQgNzI2ZTljMjAtNjBhZC00MWYyLTk1MTYtZGVlYTk2ZDM0Zjk1YTgxNmI3OWYzYmZlNDMxZDgyMGY3YzIyZTBkODg3YmM=";

export type Persistence = {
  /**
   * VercelKV
   * @param namespace
   */
  getClient: () => VercelKV | Redis;
  /**
   * clean namespace data
   * @param namespace
   */
  clean: (pattern: string) => Promise<boolean>;
  /**
   * save
   * @param namespace
   * @param key
   * @param val
   */
  save: (namespace: unknown, kv: { [propName: string]: unknown }) => Promise<boolean>;
  /**
   * save by nx
   * @param namespace
   * @param key
   * @param val
   */
  saveNx: (namespace: unknown, key: string, val: string | number) => Promise<boolean>;
  /**
   * get by key
   * @param namespace
   * @param key
   */
  get: (namespace: string, key: string) => Promise<string | null>;
  /**
   * find list
   * @param namespace
   * @param page
   */
  list: (namespace: string) => Promise<Record<string, string>>;
  /**
   * find list
   * @param namespace
   * @param page
   */
  listKeys: (namespace: string) => Promise<string[]>;
};

class KvPersistence implements Persistence {
  client;

  constructor() {
    // this.client = createClient({ url: URL, token: TOKEN });
    this.client = new Redis(10086, "150.158.198.25", { password: "yyds-zeus-man" });
  }

  getClient() {
    return this.client;
  }

  async listKeys(namespace: string): Promise<string[]> {
    return await this.client.hkeys(namespace);
  }

  async get(namespace: string, key: string): Promise<string | null> {
    return await this.client.hget(namespace, key);
  }

  async list(namespace: string): Promise<Record<string, string>> {
    const data = await this.client.hgetall(namespace);
    return data ?? {};
  }

  async save(namespace: unknown, kv: { [p: string]: unknown }): Promise<boolean> {
    const data = await this.client.hset(namespace as string, kv);
    return data == 1;
  }

  async saveNx(namespace: unknown, key: string, val: string | number): Promise<boolean> {
    const data = await this.client.hsetnx(namespace as string, key, val);
    return data == 1;
  }

  async clean(pattern: string) {
    // const r = await this.client.scan(0, {
    //   match: pattern,
    //   count: 100,
    // });
    let c = 0;
    const keys = await this.__scanKeys(pattern);
    if (keys.length > 0) {
      c = await this.client.del(...keys);
    }
    return c > 0;
  }

  // 定义一个函数来遍历键空间
  private async __scanKeys(pattern: string) {
    let cursor = "0";
    const keys = [];
    do {
      const result = await this.client.scan(cursor, "MATCH", pattern, "COUNT", 20);
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== "0");
    return keys;
  }
}

const kvStore: Persistence = new KvPersistence();

export { kvStore };
