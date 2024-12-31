import { UserTypes } from 'src/user/user.interface';

export enum RedisKeys {
  ALL_PERMISSIONS = 'all_permissions',
  ACCESS_TOKEN = 'access_token',
}

export interface RedisAllPermissions {
  [key: string]: {
    id: number;
    perms: Record<
      string,
      {
        id: number;
        v: number;
      }
    >;
  };
}

export interface RedisAccessToken {
  userId: number;
  permissions: Record<string, number>;
  rememberMe: boolean;
  createdAt: number;
  userType: UserTypes;
}
