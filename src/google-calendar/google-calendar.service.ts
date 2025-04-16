import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleCalendarService {
  private logger = new Logger(GoogleCalendarService.name);
  private calendar = google.calendar('v3');
  private oauth2Client: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }
  // constructor() {
  //   this.oauth2Client = new google.auth.OAuth2(
  //     process.env.GOOGLE_CLIENT_ID,
  //     process.env.GOOGLE_CLIENT_SECRET,
  //     process.env.GOOGLE_REDIRECT_URI,
  //   );
  //   console.log(process.env);
  //   this.oauth2Client.setCredentials({
  //     access_token: process.env.GOOGLE_ACCESS_TOKEN,
  //     refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  //   });
  // }

  async getCalendarId(): Promise<string> {
    try {
      const res = await this.calendar.calendarList.get({
        auth: this.oauth2Client,
        calendarId: 'primary',
      });
      return res.data.id!;
    } catch (error) {
      this.logger.error('Error al obtener el ID del calendario:', error);
      return '❌ No se pudo obtener el ID del calendario.';
    }
  }

  async addEvent(
    calendarId: string,
    summary: string,
    dateTime: string,
  ): Promise<string> {
    const event = {
      summary,
      start: {
        dateTime,
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime,
        timeZone: 'America/Mexico_City',
      },
    };

    try {
      await this.calendar.events.insert({
        auth: this.oauth2Client,
        calendarId,
        requestBody: event,
      });

      this.logger.log(
        `Evento creado en ${calendarId}: ${summary} el ${dateTime}`,
      );
      return `✅ Evento creado en ${calendarId}: ${summary} el ${dateTime}`;
    } catch (error) {
      this.logger.error('Error al crear el evento:', error);
      return '❌ No se pudo crear el evento.';
    }
  }

  generateAuthUrl(): string {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar'],
    });

    console.log('URL de autorización:', url);
    return url;
  }
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }
}
