import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram/telegram.service';
import { HelpersService } from './helpers/helpers.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [HelpersService, GoogleCalendarService, TelegramService],
})
export class AppModule {}
