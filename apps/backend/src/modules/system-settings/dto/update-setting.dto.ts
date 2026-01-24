import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  settingKey: string;

  @IsString()
  @IsNotEmpty()
  settingValue: string;
}
