import { Body, Controller, FilesInterceptor, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('content')
  getContent(): string {
    return JSON.stringify({ content: this.appService.getContent() } );
  }

  @Post('content')
  updateContent(@Body() body): string {
    this.appService.setContent(body.content);
    return JSON.stringify({ isSucceed: true });
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('upload'))
  uploadFile(@UploadedFiles() files) {
    return `"http://localhost:3000/images/${files[0].filename}"`;
  }
}
