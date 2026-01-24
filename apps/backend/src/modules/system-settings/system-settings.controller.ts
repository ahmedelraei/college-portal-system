import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get('registration-enabled')
  async isRegistrationEnabled(): Promise<{ enabled: boolean }> {
    const enabled = await this.systemSettingsService.isRegistrationEnabled();
    return { enabled };
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  async getAllSettings() {
    return this.systemSettingsService.getAllSettings();
  }

  @UseGuards(AdminAuthGuard)
  @Patch('registration')
  async toggleRegistration(@Body('enabled') enabled: boolean) {
    return this.systemSettingsService.setRegistrationEnabled(enabled);
  }

  @UseGuards(AdminAuthGuard)
  @Patch()
  async updateSystemSetting(@Body() input: UpdateSettingDto) {
    return this.systemSettingsService.updateSetting(
      input.settingKey,
      input.settingValue,
    );
  }
}
