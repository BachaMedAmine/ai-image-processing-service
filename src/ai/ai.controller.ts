

import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import * as fs from 'fs';
import * as path from 'path';
import { diskStorage } from 'multer';


export const editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = path.extname(file.originalname);
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
};

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('process-image')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
              destination: './uploads',
              filename: editFileName,
            }),
            fileFilter: imageFileFilter,
          }),
    )
    async processImage(@UploadedFile() image){
        const response = {
            originalname: image.originalname,
            filename: image.filename,
        };


        return await this.aiService.processImage(image);
    }
}
