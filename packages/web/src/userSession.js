import { UserSession, AppConfig } from '@stacks/auth';

import { DOMAIN_NAME } from './types/const';

const appConfig = new AppConfig(['store_write'], DOMAIN_NAME);
const userSession = new UserSession({ appConfig: appConfig });

export default userSession;
