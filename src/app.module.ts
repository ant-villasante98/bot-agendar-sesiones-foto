import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram/telegram.service';
import { HelpersService } from './helpers/helpers.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [HelpersService, GoogleCalendarService, TelegramService],
})
export class AppModule {}
