import validate from './env.service';
export enum Mode {
  PROD = 'prod',
  DEV = 'dev',
}

export enum DBType {
  PG = 'postgres',
}

export type EnvType = ReturnType<typeof validate>;
