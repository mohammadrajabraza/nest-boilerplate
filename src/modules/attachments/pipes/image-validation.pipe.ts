import { Injectable, ParseFilePipeBuilder } from '@nestjs/common';
import { ApiConfigService } from '@/shared/services/api-config.service';

@Injectable()
export class ImageValidationPipe {
  constructor(private apiConfigService: ApiConfigService) {}

  create(fileIsRequired: boolean = false) {
    const { maxFileSize, allowedMimeTypes } =
      this.apiConfigService.imageUploadConfig;

    return new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: new RegExp(allowedMimeTypes.join('|').replace(/\//g, '\\/')),
      })
      .addMaxSizeValidator({ maxSize: maxFileSize })
      .build({
        fileIsRequired,
        errorHttpStatusCode: 400,
      });
  }
}
