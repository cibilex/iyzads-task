import { CreateUserDto } from './dto/create-user.dto';

export interface UserT extends CreateUserDto {
  id: string;
}

export enum UserTypes {
  ADMIN = 1,
  USER,
}
