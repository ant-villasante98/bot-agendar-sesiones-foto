// google-calendar.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';
import { UserService } from './user/user.service';
import { google } from 'googleapis';

@Controller()
export class AppController {
  constructor(
    private readonly calendarService: GoogleCalendarService,
    private readonly userService: UserService,
  ) {}

  @Get()
  hello() {
    return 'hola';
  }

  @Get('google/auth')
  redirectToGoogle(
    @Res() res: Response,
    @Query('telegramId') telegramId: string,
  ) {
    const url = this.calendarService.generateAuthUrl(telegramId);
    return res.redirect(url);
  }

  @Get('oauth2callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') telegramId: string,
  ) {
    const tokens = await this.calendarService.getTokens(code);
    const { access_token, refresh_token } = tokens;

    if (access_token && refresh_token) {
      // Guardá tokens en tu DB (junto con telegramId)
      const client = this.calendarService.getNewOAuth2Client(
        access_token,
        refresh_token,
      );
      const userInfo = await this.calendarService.getUserIfo(client);
      const googleCalendar = google.calendar({ version: 'v3', auth: client });
      const calendarInfo = await googleCalendar.calendars.get({
        calendarId: 'primary',
      });

      await this.userService.saveGoogleTokens(
        userInfo.email!,
        telegramId,
        access_token,
        refresh_token,
        calendarInfo.data.timeZone!,
      );
      return 'Autenticación exitosa. Ya podés usar el bot para agendar.';
    }
  }
}
