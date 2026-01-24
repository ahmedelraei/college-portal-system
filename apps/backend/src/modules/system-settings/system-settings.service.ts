import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettings } from '../../entities/system-settings.entity';

export const REGISTRATION_ENABLED_KEY = 'registration_enabled';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private systemSettingsRepository: Repository<SystemSettings>,
  ) {}

  async getSetting(key: string): Promise<SystemSettings | null> {
    return this.systemSettingsRepository.findOne({
      where: { settingKey: key },
    });
  }

  async getSettingValue(key: string, defaultValue: string): Promise<string> {
    const setting = await this.getSetting(key);
    return setting ? setting.settingValue : defaultValue;
  }

  async updateSetting(
    key: string,
    value: string,
    description?: string,
  ): Promise<SystemSettings> {
    let setting = await this.getSetting(key);

    if (setting) {
      setting.settingValue = value;
      if (description !== undefined) {
        setting.description = description;
      }
    } else {
      setting = this.systemSettingsRepository.create({
        settingKey: key,
        settingValue: value,
        description: description,
      });
    }

    return this.systemSettingsRepository.save(setting);
  }

  async isRegistrationEnabled(): Promise<boolean> {
    const value = await this.getSettingValue(REGISTRATION_ENABLED_KEY, 'true');
    return value === 'true';
  }

  async setRegistrationEnabled(enabled: boolean): Promise<SystemSettings> {
    return this.updateSetting(
      REGISTRATION_ENABLED_KEY,
      enabled ? 'true' : 'false',
      'Controls whether students can register for courses',
    );
  }

  async getAllSettings(): Promise<SystemSettings[]> {
    return this.systemSettingsRepository.find({
      order: { settingKey: 'ASC' },
    });
  }
}
