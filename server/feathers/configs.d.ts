declare class config {
  _opts: any;
  [key: string]: any;
  constructor(opts: any);
  readonly mongodb: string;
  readonly prod: boolean;
  readonly dev: boolean;
  has(name: any): boolean;
  getConfig(name: any): any;
  getUrl(name: any): string;
  getPort(name: any): any;
  getHost(name: any): any;
  readonly sendGrid?: {
    email?: string;
    key?: string;
    templates?: {
      [key: string]:
        | string
        | {
            [lang: string]: string;
          };
    };
  };
  readonly internal?: {
    [key: string]: {
      password: string;
    };
  };
}
declare const _default: config;
export default _default;
