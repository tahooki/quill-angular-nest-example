import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  content: any;

  getContent(): string {
    return this.content;
  }

  setContent(content): void {
    this.content = content;
  }
}
