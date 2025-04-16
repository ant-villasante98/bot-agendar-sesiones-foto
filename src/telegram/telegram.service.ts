import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelpersService } from 'src/helpers/helpers.service';
import { keyNames } from 'src/interfeces/constas';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private configService: ConfigService,
    private helperService: HelpersService,
  ) {}

  async onModuleInit() {
    this.bot = new Telegraf(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN')!,
    );

    this.bot.start((ctx) => {
      ctx.reply(
        'Hola 👋 soy tu asistente personal. Decime qué querés agendar.',
      );
    });

    this.bot.hears('ping', (ctx) => {
      ctx.reply('pong');
    });

    this.bot.command('agendar', (ctx) => {
      const text = ctx.message.text.replace('/agendar', '').trim();
      ctx.reply(`🗓️ Vamos a agendar: "${text}"`);
    });

    this.bot.hears(/.*/, (ctx) => {
      const message = ctx.message.text;
      console.log('Mensaje recibido:', message);
      const fields = this.helperService.getInformation(message);
      console.log(fields);
      const name = fields.get(keyNames.NAME) ?? '';
      const time = fields.get(keyNames.TIME) ?? '';
      const date = fields.get(keyNames.DATE) ?? '';
      const dateParts = date.split('/');

      const dateFull: string = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]} ${time}`;

      // Acá podrías invocar un servicio que procese el mensaje y cree eventos
      ctx.reply(
        `Recibí tu mensaje: \nfecha: ${date} \nhora: ${time} \nnombre: ${name}`,
      );
    });

    await this.bot.launch();
    console.log('✅ Bot de Telegram iniciado');
  }
}
