type AllUrlResponseFormat = Record<string, object>;

interface SingleResponseFormat {
    data: Object;
    type: CacheType;
}

enum CacheType {
    HIT,
    MISS,
    FAILED
}

export { CacheType, SingleResponseFormat }
export type { AllUrlResponseFormat }