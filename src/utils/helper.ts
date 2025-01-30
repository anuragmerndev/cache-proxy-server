import { logger } from "../logger";
import { CacheType } from "../type";

// check the type of object

const getCacheHeader = (cacheStatus: number): string => {
    switch (cacheStatus) {
        case CacheType.HIT:
            return 'HIT'

        case CacheType.FAILED:
            return 'FAILED'


        case CacheType.MISS:
            return 'MISS';
        default:
            return 'FAILED';
    }
}

const deleteExpiredKey = (cb: () => Promise<void>, expiry = 60 * 60 * 1000) => {
    setTimeout(async () => {
        try {
            logger.info('🔁 Deleting the key')
            await cb()    
            logger.info('✅ Key deleted successfully')
        } catch (err) {
            logger.error('❌ Error deleting the key ==> ', err);
        }
        }, expiry);
}

export { getCacheHeader, deleteExpiredKey }