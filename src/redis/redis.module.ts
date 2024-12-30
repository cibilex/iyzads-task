import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisSetService } from './redis-sets.service';
import { RedisListService } from './redis-lists.service';
import { RedisHashService } from './redis-hashes.service';

@Global()
@Module({
  providers: [
    RedisService,
    RedisSetService,
    RedisListService,
    RedisHashService,
    RedisListService,
  ],
  exports: [
    RedisSetService,
    RedisListService,
    RedisHashService,
    RedisListService,
  ],
})
export class RedisModule {}
