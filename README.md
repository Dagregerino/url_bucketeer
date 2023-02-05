# URL Bucketeer
This is a package to help take raw urls that may have high cardinality, and bucket them into preconfigured URLs.

## Use Case and Example
Let's say you are using `PerformanceObserver` to monitor XHR and fetch requests in your browser, which you then emit metrics for. You may have APIs or Routes that contain identifiers, resulting in high cardinality of emitted metrics. By using URL Bucketeer, you can group these into one metric to get API metrics.

```ts
const testOrigin = "https://my-site.com";

// These are the APIs which I want metrics for.
const CONFIG = [
    "/myPath/:pathId1/:pathId2/test",
    "/myPath/:pathId1/:pathId2?query=:id1&version=:versionId",
].map((str) => new URL(`${testOrigin}${str}`));

const urlBucketeer = createBucketeerFromConfig(CONFIG);
const testUrl = new URL(`${testOrigin}/myPath/abc/123?query=code&version=100`);
const testUrl2 = new URL(`${testOrigin}/myPath/abc/123/test`);
const mappedUrl = urlBucketeer.bucketUrl(testUrl); // mappedUrl will match second element in `CONFIG` here "https://my-site.com/myPath/:pathId1/:pathId2?query=:id1&version=:versionId"
const mappedUrl2 = urlBucketeer.bucketUrl(testUrl); // mappedUrl2 will match first argument and return "https://my-site.com/myPath/:pathId1/:pathId2/test"
```

## Performance

Under the hood all the configured routes are stored in a Trie so we can search all configured routes at once. Individual configurations are not checked one by one. This is the main benefit of this library is if you need to check a url against many different patterns, instead of just one.