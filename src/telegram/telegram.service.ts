import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { HelpersService } from 'src/helpers/helpers.service';
import { keyNames } from 'src/interfeces/constas';
import { UserService } from 'src/user/user.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly helperService: HelpersService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly userService: UserService,
  ) {}

  onModuleInit() {
    this.bot = new Telegraf(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN')!,
    );

    this.bot.start(async (ctx) => {
      const telegramId = ctx.from.id;
      const host =
        this.configService.get<string>('HOST') ?? 'http://localhost:3000';
      const authUrl = `${host}/google/auth?telegramId=${telegramId}`;
      await ctx.reply(
        `[Haz clic aquí para autorizar acceso a tu calendario:]\n ${authUrl}`,
        { parse_mode: 'Markdown' },
      );
    });

    this.bot.hears('ping', (ctx) => {
      ctx.reply('pong');
    });

    this.bot.hears(/(H|h)ola.*/, (ctx) => {
      ctx.reply(`Hola Chavon!!`);
    });

    this.bot.hears(/.*/, async (ctx) => {
      console.log(ctx.from);
      const user = await this.userService.getByTelegramId(`${ctx.from.id}`);
      if (!user) {
        ctx.reply(`Usuario no registrado, ingrese el comando: \n/start`);
        return;
      }
      const message = ctx.message.text;
      console.log('Mensaje recibido:', message);
      const fields = this.helperService.getInformation(message);
      console.log(fields);
      const name = fields.get(keyNames.NAME) ?? '';
      const time = fields.get(keyNames.TIME) ?? '';
      const date = fields.get(keyNames.DATE) ?? '';

      const dateFull: string = this.helperService
        .parseDateAndTime(date, time)
        .toISOString();
      const client = this.googleCalendarService.getNewOAuth2Client(
        user.accessToken,
        user.refreshToken,
      );
      this.googleCalendarService
        .addEvent(user.email, `Sesion para ${name}`, dateFull, client)
        .then(() => {
          // Acá podrías invocar un servicio que procese el mensaje y cree eventos
          ctx.reply(`Evento agendado.`);
        });
    });

    this.bot.launch();
    console.log('✅ Bot de Telegram iniciado');
  }
}
