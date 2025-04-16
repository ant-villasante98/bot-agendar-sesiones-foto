import { Global, Injectable } from '@nestjs/common';
import { keyNames } from 'src/interfeces/constas';

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

  parseDateAndTime(dateStr: string, timeStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    // Asumiendo que "25" es el año 2025
    const fullYear = year < 100 ? 2000 + year : year;

    return new Date(fullYear, month - 1, day, hour, minute);
  }
}
