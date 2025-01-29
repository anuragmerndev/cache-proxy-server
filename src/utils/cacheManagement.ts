import axios from "axios";
import { AllUrlResponseFormat, CacheType, SingleResponseFormat } from "./type";

class UrlCacheManagement {
    baseUrl: string;
    private cachedUrls: Map<string, object>;

    constructor(host: string) {
        this.cachedUrls = new Map();
        this.baseUrl = host;
    }

    public async getData(url: string): Promise<SingleResponseFormat> {
        try {

            if (this.cachedUrls.has(url)) {
                return {
                    data: this.cachedUrls.get(url) || {},
                    type: CacheType.HIT,
                }
            }
            
            const apiData = await axios.get(url);
            this.cachedUrls.set(url, apiData.data);
            return {
                data: apiData.data,
                type: CacheType.MISS
            };
        } catch (err: Error | any) {
            console.log(`Error: calling api ==>`, err);
            return {
                data: {},
                type: CacheType.FAILED
            };
        }
    }

    public getAllCachedUrl(): AllUrlResponseFormat {
        const formattedResponse: AllUrlResponseFormat = {};
        this.cachedUrls.forEach((val, key) => {
            formattedResponse[key] = val
        })
        return formattedResponse;
    }

    public totalUrlCached(): number {
        return this.cachedUrls.size;
    }
}


export { UrlCacheManagement };