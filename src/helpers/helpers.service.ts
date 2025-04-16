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
      const starKey: number = 0;
      const endKey: number = field.indexOf(':');

      // set value Value
      const starValue: number = field.indexOf(':');

      if (endKey >= 0) {
        const key: string = field.substring(starKey, endKey).toLowerCase();
        let value: string = field.substring(starValue + 1).trim();
        if (key === keyNames.TIME) {
          value = value.split(' ')[0];
        }
        fieldsMap.set(key, value);
      }
    }
    return fieldsMap;
  }
}
