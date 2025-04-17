import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleCalendarService {
  private logger = new Logger(GoogleCalendarService.name);
  private calendar = google.calendar('v3');
  private oauth2Client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  getNewOAuth2Client(accessToken: string, refreshToken: string) {
    const client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );

    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return client;
  }

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
    client: OAuth2Client,
    description?: string,
  ): Promise<string> {
    const event = {
      summary,
      start: {
        dateTime,
      },
      end: {
        dateTime,
      },
      description,
    };

    try {
      await this.calendar.events.insert({
        auth: client,
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

  generateAuthUrl(telegramId: string) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      prompt: 'consent',
      state: telegramId,
    });
  }
  async getTokens(code: string) {
    const response = await this.oauth2Client.getToken(code);
    const { tokens } = response;
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async getUserIfo(client: OAuth2Client) {
    const oauth2 = google.oauth2({
      auth: client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();
    return data;
  }
}
