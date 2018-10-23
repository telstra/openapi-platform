import { apiBaseUrl } from '@openapi-platform/config';
import { createServerClient } from '@openapi-platform/server-client';

import { config } from './config';
export const { socket, client } = createServerClient(apiBaseUrl(config));
