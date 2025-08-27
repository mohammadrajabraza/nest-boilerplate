import { Injectable, ParseFilePipeBuilder } from '@nestjs/common';
import { ApiConfigService } from '@/shared/services/api-config.service';

@Injectable()
export class DocumentValidationPipe {
  constructor(private apiConfigService: ApiConfigService) {}

  create(fileIsRequired: boolean = false) {
    const { maxFileSize, allowedMimeTypes } =
      this.apiConfigService.documentUploadConfig;

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
