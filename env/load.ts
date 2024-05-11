import { config } from 'dotenv';

const { error, parsed } = config();
export function loadAdminPagePrepath() {
  if (error) {
    console.warn('load env failed. please follow readme.md');
  } else {
    console.log('loading env...', parsed);
  }
  return parsed as {
    ME_CONFIG_BASICAUTH_USERNAME: string;
    ME_CONFIG_BASICAUTH_PASSWORD: string;
    host: string;
    page_prefix: string;
  };
}
