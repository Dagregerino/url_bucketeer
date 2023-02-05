import { createBucketeerFromConfig } from "../src/url-bucketeer";
import { TEST_CONFIG, VALIDS, INVALIDS} from "./url-bucketeer-test.config";
describe("url bucketeer tests", () => {
    
    const bucketeer = createBucketeerFromConfig(TEST_CONFIG);

    test.each(VALIDS)("%s maps properly", (url) => {
        const mapped = bucketeer.bucketUrl(url);
        expect(mapped).not.toBeNull();
    });

    test.each(INVALIDS)("%s maps to null properly", (url) => {
        expect(bucketeer.bucketUrl(url)).toBeNull();
    });
})