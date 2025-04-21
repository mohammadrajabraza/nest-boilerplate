import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { Public } from '@/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller({ path: 'images', version: '1' })
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('upload')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile()
    file?: Express.Multer.File,
  ) {
    try {
      if (!file) {
        return { message: 'No file uploaded' };
      }
      const fileUrl = await this.imageService.uploadImage(file);
      return { url: fileUrl, message: 'Image uploaded successfully' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to upload image');
    }
  }

  @Get('/download/:fileName')
  @UseInterceptors()
  @Public()
  async downloadImage(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const { headers, data } = await this.imageService.downloadImage(fileName);
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }

    return res.send(data);
  }
}
