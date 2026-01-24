import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ContentOrderItem {
  @IsInt()
  id: number;

  @IsInt()
  displayOrder: number;
}

export class ReorderContentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentOrderItem)
  items: ContentOrderItem[];
}
