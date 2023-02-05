
const testOrigin = "https://my-site.com";

export const TEST_CONFIG = [
    "/myPath/:pathId1/:pathId2/test",
    "/myPath/:pathId1/:pathId2?query=:id1&version=5",
    "/myPath/:pathId1/:pathId2?query=:id1&version=:versionId",
].map((str) => new URL(`${testOrigin}${str}`));


export const INVALIDS = [
    "https://not-a-host.com/test",
    `${testOrigin}/myPath`
].map((str) => new URL(str));


export const VALIDS = [
    "/myPath/abced/12345/test",
    "/myPath/1231231/asdfsadvasdfsd?query=asdfas1&version=5",
    "/myPath/1231231/1231231?query=queryId&version=100",
].map((str) => new URL(`${testOrigin}${str}`));