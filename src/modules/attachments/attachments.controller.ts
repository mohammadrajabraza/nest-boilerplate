import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImageValidationPipe } from './pipes/image-validation.pipe';
import { DocumentValidationPipe } from './pipes/document-validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AttachmentResponseDto } from './dtos/response/attachment.dto';
import { ListAttachmentDto } from './dtos/response/list-attachment.dto';
import { AttachmentQueryDto } from './dtos/query/attachment-query.dto';
import { Roles } from '@/decorators/role.decorator';
import { RoleType } from '@/constants/role-type';
import SuccessMessage from '@/constants/success-message';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { UserDto } from '@/modules/users/domain/user.dto';
import { CreateAttachmentBodyDto } from './dtos/body/create-attachment.dto';

@ApiTags('Attachments')
@Controller({ path: 'attachments', version: '1' })
export class AttachmentsController {
  constructor(
    private attachmentsService: AttachmentsService,
    private imageValidationPipe: ImageValidationPipe,
    private documentValidationPipe: DocumentValidationPipe,
  ) {}

  @Post('/upload/image')
  @ApiOperation({
    summary: 'Uploads an image attachment',
    description: `Uploads an image for a specific tenant/entity/category.\n\nThis endpoint allows uploading an image file (e.g., profile picture, product image) for a specific tenant and entity. The file is stored in S3 under a hierarchical key based on the provided parameters.\n\n**Request Body:**\n- tenantId: UUID of the tenant (e.g., 123e4567-e89b-12d3-a456-426614174000)\n- entityType: Type of entity (e.g., user, company)\n- entityId: UUID of the entity (e.g., user ID, company ID)\n- category: Logical grouping (e.g., user_profile)\n- fileName: (Optional) File name for the uploaded file (e.g., avatar.jpg)`,
  })
  @ApiBody({
    type: CreateAttachmentBodyDto,
    description: 'Attachment metadata for the upload',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AttachmentResponseDto,
    description: 'Returns the uploaded attachment metadata and public URL.',
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles(RoleType.ADMIN, RoleType.USER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateAttachmentBodyDto,
    @CurrentUser() user: UserDto,
  ) {
    // Validate the file using the pipe
    const imagePipe = this.imageValidationPipe.create(true);
    const validatedFile = await imagePipe.transform(file);

    const { id, url } = await this.attachmentsService.uploadHierarchical({
      file: validatedFile,
      ...body,
      fileType: 'image', // override to ensure correct type
      uploadedById: user.id,
    });
    return {
      id,
      url,
      message: SuccessMessage.ATTACHMENT.UPLOAD,
      key: body.fileName,
    };
  }

  @Post('/upload/document')
  @ApiOperation({
    summary: 'Upload a document attachment',
    description: `Uploads a document for a specific tenant/entity/category.\n\nThis endpoint allows uploading a document file (e.g., PDF, DOCX) for a specific tenant and entity. The file is stored in S3 under a hierarchical key based on the provided parameters.\n\n**Request Body:**\n- tenantId: UUID of the tenant (e.g., 123e4567-e89b-12d3-a456-426614174000)\n- entityType: Type of entity (e.g., user, company)\n- entityId: UUID of the entity (e.g., user ID, company ID)\n- category: Logical grouping (e.g., user_profile)\n- fileName: (Optional) File name for the uploaded file (e.g., document.pdf)`,
  })
  @ApiBody({
    type: CreateAttachmentBodyDto,
    description: 'Attachment metadata for the upload',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AttachmentResponseDto,
    description: 'Returns the uploaded document metadata and public URL.',
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles(RoleType.ADMIN, RoleType.USER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateAttachmentBodyDto,
    @CurrentUser() user: UserDto,
  ) {
    // Validate the file using the pipe
    const documentPipe = this.documentValidationPipe.create(true);
    const validatedFile = await documentPipe.transform(file);

    const { id, url } = await this.attachmentsService.uploadHierarchical({
      file: validatedFile,
      ...body,
      fileType: 'document', // override to ensure correct type
      uploadedById: user.id,
    });
    return {
      id,
      url,
      message: SuccessMessage.ATTACHMENT.UPLOAD,
      key: body.fileName,
    };
  }

  @Get('/')
  @ApiOperation({
    summary: 'List attachments',
    description: `Lists all attachments for a specific tenant/entity/category with pagination support.\n\n**Query Parameters:**\n- tenantId: UUID of the tenant\n- entityType: Type of entity\n- entityId: UUID of the entity\n- category: Logical grouping\n- page: Page number (default: 1)\n- take: Items per page (default: 10, max: 50)\n- order: Sort order (ASC/DESC, default: DESC)\n- q: Search query for file name or type`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ListAttachmentDto,
    description:
      'Returns a paginated list of attachments for the specified parameters.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles(RoleType.ADMIN)
  async listAttachments(@Query() query: AttachmentQueryDto) {
    const [attachments, count] = await Promise.all([
      this.attachmentsService.listHierarchical(query),
      this.attachmentsService.countAttachments(query),
    ]);

    const attachmentDtos = attachments.map((attachment) => attachment.toDto());

    return {
      attachments: attachmentDtos,
      message: SuccessMessage.ATTACHMENT.LIST,
      meta: {
        page: query.page,
        take: query.take,
        itemCount: count,
        pageCount: Math.ceil(count / query.take),
        hasPreviousPage: query.page > 1,
        hasNextPage: query.page < Math.ceil(count / query.take),
      },
    };
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Download an attachment by ID',
    description:
      'Downloads the attachment file by its unique ID. Only authorized users can access.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attachment file stream.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles(RoleType.ADMIN, RoleType.USER)
  async downloadAttachmentById(@Param('id') id: Uuid, @Res() res: Response) {
    const { stream, fileName, mimeType } =
      await this.attachmentsService.downloadById(id);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', mimeType);
    stream.pipe(res);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Delete an attachment by ID',
    description:
      'Deletes the attachment and its file from S3 by its unique ID. Only authorized users can delete.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attachment deleted successfully.',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles(RoleType.ADMIN, RoleType.USER)
  async deleteAttachmentById(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDto,
  ) {
    await this.attachmentsService.deleteById(id, currentUser.id);
    return { message: SuccessMessage.ATTACHMENT.DELETE };
  }
}
