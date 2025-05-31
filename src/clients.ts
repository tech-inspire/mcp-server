import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { PostsService } from "inspire-api-contracts/api/gen/ts/posts/v1/posts_pb.js";
import { SearchService } from "inspire-api-contracts/api/gen/ts/search/v1/search_pb.js";

const INSPIRE_API_BASE =
  process.env.INSPIRE_API_BASE || "http://localhost:7080";

const transport = createConnectTransport({
  baseUrl: INSPIRE_API_BASE,
});

export const searchClient = createClient(SearchService, transport);
export const postsClient = createClient(PostsService, transport);
