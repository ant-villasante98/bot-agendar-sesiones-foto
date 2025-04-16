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
      this.oauth2Client.setCredentials({
        access_token: 'a29.a0AZYkNZip5l8hWnQSBw0p2KKHkv9pq32-QdLe3XY2Mp6cpvzAM8FkBXoRe4HLd48rOVF3Nn_YKUkso3d5jBxRJLajGswp01RXNDO9T_UIq6DyGyPN21hz4imBx8otGecdLB1tfDFxgEtTrlAP6Hx-cZHx2FMObU2cQ3Os_N17aCgYKAX0SARMSFQHGX2Mi6FnwcBgC2KMpxu6pq9dykg0175',
        refresh_token: '1//0hMsZbjMZ3yoBCgYIARAAGBESNwF-L9Ire4X6Qml2huDzmqBltKHJ8hcP5y7IxOkfHbK0XiuUDeb2MAROEihGf8qvzUZTEkUZyoU',
      });
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
  ): Promise<string> {
    const event = {
      summary,
      start: {
        dateTime,
        timeZone: 'America/Lima',
      },
      end: {
        dateTime,
        timeZone: 'America/Lima',
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
