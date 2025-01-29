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

export { getCacheHeader }