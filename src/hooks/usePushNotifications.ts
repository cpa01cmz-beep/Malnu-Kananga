import { useUnifiedNotifications } from './useUnifiedNotifications';

/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Import usePushNotifications from useUnifiedNotifications instead:
 * import { usePushNotifications } from '../hooks/useUnifiedNotifications'
 *
 * This wrapper exists only for backward compatibility during migration.
 * See issue #1114 for complete migration details.
 */
export const usePushNotifications = useUnifiedNotifications;