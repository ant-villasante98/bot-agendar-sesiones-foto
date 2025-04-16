import { Injectable } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';

@Injectable()
export class UserRepository {
  readonly db: {
    email: string;
    telegramId: string;
    accessToken: string;
    refreshToken: string;
  }[];
  constructor() {
    this.db = [];
  }

  async add(data: {
    email: string;
    telegramId: string;
    accessToken: string;
    refreshToken: string;
  }) {
    return await lastValueFrom(of(this.db.push(data)));
  }
  async getAll() {
    return await lastValueFrom(of(this.db));
  }
}
