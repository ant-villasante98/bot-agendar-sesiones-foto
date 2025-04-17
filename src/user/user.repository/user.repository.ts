import { Injectable } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { User } from 'src/interfeces/user.interface';

@Injectable()
export class UserRepository {
  readonly db: User[];
  constructor() {
    this.db = [];
  }

  async add(data: User) {
    return await lastValueFrom(of(this.db.push(data)));
  }
  async getAll() {
    return await lastValueFrom(of(this.db));
  }
}
