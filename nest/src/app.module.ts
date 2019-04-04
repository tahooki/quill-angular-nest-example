import { Module, MulterModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './images',
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
