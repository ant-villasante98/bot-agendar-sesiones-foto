import { Global, Injectable } from '@nestjs/common';
import { keyNames } from 'src/interfeces/constas';
import { DateTime } from 'luxon';

@Global()
@Injectable()
export class HelpersService {
  getInformation(message: string) {
    message = message.replace(/\*/g, '');
    const fields: string[] = message.split('\n');
    return this.formatFields(fields);
  }

  formatFields(fieldList: string[]): Map<string, string> {
    const fieldsMap = new Map<string, string>();
    for (const field of fieldList) {
      // set value key
      const startKey: number = 0;
      const endKey: number = field.indexOf(':');

      // set value Value
      const startValue: number = field.indexOf(':');

      if (endKey >= 0) {
        const key: string = field.substring(startKey, endKey).toLowerCase();
        let value: string = field.substring(startValue + 1).trim();
        if (key === keyNames.TIME) {
          value = value.split(' ')[0];
        }
        fieldsMap.set(key, value);
      }
    }
    return fieldsMap;
  }

  parseDateAndTime(dateStr: string, timeStr: string): string {
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    // Asumiendo que "25" es el año 2025
    const fullYear = year < 100 ? 2000 + year : year;

    return new Date(fullYear, month - 1, day, hour, minute).toISOString();
  }

  getISODateTime(date: string, time: string, timeZone: string): string {
    // date = '16/04/25' -> dd/MM/yy
    const [day, month, year] = date.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    if (
      day !== undefined &&
      month !== undefined &&
      year !== undefined &&
      hour !== undefined &&
      minute !== undefined
    ) {
      const dateTime = DateTime.fromObject(
        {
          day,
          month,
          year: 2000 + year, // convertir 25 -> 2025
          hour,
          minute,
        },
        { zone: timeZone },
      );

      return dateTime.toISO() ?? ''; // retorna en formato ISO 8601
    }
    return '';
  }
}
