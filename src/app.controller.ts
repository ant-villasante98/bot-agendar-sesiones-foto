// google-calendar.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';

@Controller()
export class AppController {
  constructor(private readonly calendarService: GoogleCalendarService) {}

  @Get()
  hello() {
    return 'hola';
  }

  @Get('google/auth')
  redirectToGoogle(@Res() res: Response) {
    const url = this.calendarService.generateAuthUrl();
    return res.redirect(url);
  }

  @Get('oauth2callback')
  async handleCallback(@Query('code') code: string) {
    const tokens = await this.calendarService.getTokens(code);
    return {
      message: 'Autenticación exitosa',
      tokens,
    };
  }
}
