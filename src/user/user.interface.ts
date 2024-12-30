import { CreateUserDto } from './dto/create-user.dto';

export interface UserT extends CreateUserDto {
  id: string;
}
