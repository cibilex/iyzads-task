import { plainToClass } from 'class-transformer';
import { DBType, Mode } from './env.interface';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { Languages } from 'src/typings/common';

class Env {
  @IsEnum(Mode)
  NODE_ENV: Mode;

  @IsNumber()
  @Min(1)
  RATE_LIMIT: number;

  @IsNumber()
  @Min(1000)
  PORT: number;

  @IsString()
  ADMIN_USERNAME: string;

  @IsString()
  @MinLength(6)
  @MaxLength(40)
  ADMIN_PASSWORD: string;

  @IsNumber()
  @Min(2)
  @Max(50)
  BCRYPT_SALT: number;

  @IsEnum(DBType)
  DB_TYPE: DBType;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  @MinLength(4)
  DB_HOST: string;

  @IsString()
  @MinLength(1)
  DB_DATABASE: string;

  @IsString()
  @MinLength(1)
  DB_USERNAME: string;

  @IsString()
  @MinLength(2)
  DB_PASSWORD: string;

  @IsBoolean()
  DB_SYNCHRONIZE: true;

  @IsString()
  @MinLength(1)
  DB_SCHEMA: string;

  @IsEnum(Languages)
  FALLBACK_LANGUAGE: Languages;

  @IsNumber()
  REDIS_DB: number;

  @IsString()
  @MinLength(10)
  REDIS_PASSWORD: string;

  @IsString()
  @MinLength(4)
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsNumber()
  REDIS_COMMON_TTL: number;

  @IsNumber()
  REDIS_ACCESS_TOKEN_REMEMBER_ME_TTL: number;

  @IsNumber()
  REDIS_ACCESS_TOKEN_TTL: number;

  @IsString()
  @MinLength(10)
  REDIS_ACCESS_TOKEN_SECRET: string;
}

export default function (config: Record<string, unknown>) {
  console.log(process.env, 'env');

  const parsed = plainToClass(Env, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(parsed);
  if (errors.length) throw new Error(errors.toString());

  const {
    PORT,
    NODE_ENV,
    RATE_LIMIT,
    DB_TYPE,
    DB_PORT,
    DB_HOST,
    DB_DATABASE,
    DB_USERNAME,
    DB_PASSWORD,
    DB_SYNCHRONIZE,
    DB_SCHEMA,
    BCRYPT_SALT,
    FALLBACK_LANGUAGE,
    REDIS_DB,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD,
    REDIS_COMMON_TTL,
    REDIS_ACCESS_TOKEN_SECRET,
    REDIS_ACCESS_TOKEN_REMEMBER_ME_TTL,
    REDIS_ACCESS_TOKEN_TTL,
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
  } = parsed;

  return {
    PORT,
    NODE_ENV,
    RATE_LIMIT,
    BCRYPT_SALT,
    FALLBACK_LANGUAGE,
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
    DB: {
      DB_TYPE,
      DB_PORT,
      DB_HOST,
      DB_DATABASE,
      DB_USERNAME,
      DB_PASSWORD,
      DB_SYNCHRONIZE,
      DB_SCHEMA,
    },
    REDIS: {
      REDIS_DB,
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD,
      REDIS_COMMON_TTL,
      REDIS_ACCESS_TOKEN_SECRET,
      REDIS_ACCESS_TOKEN_REMEMBER_ME_TTL,
      REDIS_ACCESS_TOKEN_TTL,
    },
  };
}
