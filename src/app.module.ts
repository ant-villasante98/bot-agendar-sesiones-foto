import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, GoogleCalendarService],
})
export class AppModule {}
