import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { HelpersService } from 'src/helpers/helpers.service';
import { keyNames } from 'src/interfeces/constas';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private configService: ConfigService,
    private helperService: HelpersService,
    private googleCalendarService: GoogleCalendarService,
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
        `[Haz clic aquí para autorizar acceso a tu calendario] (${authUrl})`,
        { parse_mode: 'Markdown' },
      );
    });

    this.bot.hears('ping', (ctx) => {
      ctx.reply('pong');
    });

    this.bot.command('agendar', (ctx) => {
      const text = ctx.message.text.replace('/agendar', '').trim();
      ctx.reply(`🗓️ Vamos a agendar: "${text}"`);
    });

    this.bot.hears(/(H|h)ola.*/, (ctx) => {
      ctx.reply(`Hola Chavon!!`);
    });

    this.bot.hears(/.*/, (ctx) => {
      console.log(ctx.from);
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

      this.googleCalendarService
        .addEvent('hilares33v@gmail.com', `Sesion para ${name}`, dateFull)
        .then(() => {
          // Acá podrías invocar un servicio que procese el mensaje y cree eventos
          ctx.reply(
            `Recibí tu mensaje: \nfecha: ${date} \nhora: ${time} \nnombre: ${name} \ndia: ${dateFull}`,
          );
        });
    });

    this.bot.launch();
    console.log('✅ Bot de Telegram iniciado');
  }
}
