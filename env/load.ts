import { config } from 'dotenv';

const { error, parsed } = config();
export function loadAdminPagePrepath() {
  if (error) {
    console.warn('load env failed. please follow readme.md');
  }
  return parsed as {
    ME_CONFIG_BASICAUTH_USERNAME: string;
    ME_CONFIG_BASICAUTH_PASSWORD: string;
    host: string;
    page_prefix: string;
    protocol: string;
  };
}
