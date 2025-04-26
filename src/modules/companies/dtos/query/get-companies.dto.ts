import { PageOptionsDto } from "@/common/dto/page-options.dto";
import { BooleanFieldOptional } from "@/decorators/field.decorator";

export class GetCompaniesQueryDto extends PageOptionsDto {
    @BooleanFieldOptional({ swagger: true, default: false })
    user?: boolean;
}