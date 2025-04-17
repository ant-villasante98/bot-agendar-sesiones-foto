import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRespository: UserRepository) {}
  async saveGoogleTokens(
    email: string,
    telegramId: string,
    accessToken: string,
    refreshToken: string,
    timeZone: string,
  ) {
    await this.userRespository.add({
      email,
      accessToken,
      refreshToken,
      telegramId,
      timeZone,
    });
  }

  async getByTelegramId(telegramId: string) {
    const db = await this.userRespository.getAll();
    return db.find((x) => x.telegramId == telegramId);
  }
}
