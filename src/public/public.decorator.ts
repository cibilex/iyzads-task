import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator<boolean>();
export const Auth = Reflector.createDecorator<string[]>();
