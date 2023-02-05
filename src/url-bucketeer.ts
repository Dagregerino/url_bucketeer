/**
 * Type to bucket urls to a specific configuration
 * @example
 */
export type UrlBucketeer = {
  bucketUrl: (url: URL) => URL | null;
};

type BucketeerMatch = {
  originSet: Set<string>;
  pathAndSearchTrie: URLTrie;
};

type URLTrie = {
  [key: string]: URLTrie;
} & { isLeaf?: boolean };

// Used to rebuild the URL after parsing
type CustomSplit = {
  delims: string[];
  tokens: string[];
};

/**
 * 
 * @param str raw url string to split
 * @returns tokens from split as well as delimiters in order to rebuild the string
 */
function customSplit(str: string): CustomSplit {
  const DELIM_SET = new Set("/?=&".split(""));
  const delims: string[] = [];
  const tokens: string[] = [];
  let prev = "";
  for (const token of str) {
    if (DELIM_SET.has(token)) {
      delims.push(token);
      if (prev !== "") tokens.push(prev);
      prev = "";
    } else {
      prev += token;
    }
  }
  if (prev !== "") tokens.push(prev);

  return { delims, tokens };
}

function buildTrieFromConfig(config: URL[]): BucketeerMatch {
  const pathAndSearchTrie:URLTrie = {};
  const originSet = new Set<string>();
  for (const url of config) {
    let curTrie = pathAndSearchTrie;
    const { origin, pathname, search } = url;
    originSet.add(origin);
    const combined = pathname + search;
    const { tokens } = customSplit(combined);
    for(const token of tokens) {
        if(!(token in curTrie)){
            curTrie[token] = {};
        }
        curTrie = curTrie[token];
    }
    curTrie.isLeaf = true;
  }
  return { originSet, pathAndSearchTrie };
}

/**
 * 
 * @param config configuration of URLs to match to. A url pathname or search can contain prefixes such as `:id` to match any string.
 * @returns A UrlBucketeer object configured to run bucketUrl on. 
 * @example 
 * ---------
 ```js
const testOrigin = "https://my-site.com";

const CONFIG = [
    "/myPath/:pathId1/:pathId2/test",
    "/myPath/:pathId1/:pathId2?query=:id1&version=5",
    "/myPath/:pathId1/:pathId2?query=:id1&version=:versionId",
].map((str) => new URL(`${testOrigin}${str}`));

const urlBucketeer = createBucketeerFromConfig(CONFIG);
const testUrl = new URL(`${testOrigin}/myPath/1231231/1231231?query=queryId&version=100`)
const mappedUrl = urlBucketeer.bucketUrl(testUrl); // mappedUrl will match third element in `CONFIG` here "https://my-site.com/myPath/:pathId1/:pathId2?query=:id1&version=:versionId"
 ```
 */
export function createBucketeerFromConfig(config: URL[]): UrlBucketeer {
  let {pathAndSearchTrie, originSet} = buildTrieFromConfig(config);
  function bucketUrl(url: URL): URL | null {
    const {origin, pathname, search} = url;
    if(!originSet.has(origin)){
        return null; // unknown host
    }
    const combined = pathname + search;
    const { tokens, delims } = customSplit(combined);

    function searchTrie(curTrie = pathAndSearchTrie, tokenIndex = 0 , currentPath:string[]  = []): string[] | null{
        const token = tokens[tokenIndex];
        if(tokenIndex >= tokens.length && curTrie.isLeaf){
            return currentPath;
        }

        if(!(token in curTrie)) {
            for(const key of Object.keys(curTrie)) {
                if(key.startsWith(":")) {
                    const pattern = searchTrie(curTrie[key], tokenIndex+1, [...currentPath, key]);
                    if(pattern !== null) {
                        return pattern;
                    }
                }
            }
            return null;
        }
        
        return searchTrie(curTrie[token], tokenIndex+1, [...currentPath, token]);
    }

    const solution = searchTrie();
    if(solution !== null){
        const rebuilt = solution.reduce((a,c,i) => a + delims[i]+c,"");
        return new URL(`${origin}${rebuilt}`);
    }

    return null;
  }

  return { bucketUrl };
}
