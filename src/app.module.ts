import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiService } from './ai/ai.service';
import { AiController } from './ai/ai.controller';


@Module({
  imports: [],
  controllers: [AppController, AiController],
  providers: [AppService, AiService],
})
export class AppModule {}
