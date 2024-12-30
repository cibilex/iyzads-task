import fastify from 'fastify';
import { UserT } from 'src/user/user.interface';

declare module 'fastify' {
  export interface FastifyRequest {
    user: UserT;
    time: number;
  }
}
