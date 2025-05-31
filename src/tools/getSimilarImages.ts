import { z } from "zod";
import { postsClient, searchClient } from "../clients.js";
import { downloadImageAsBase64 } from "../utils/imageUtils.js";
import { GetPostsResponse } from "inspire-api-contracts/api/gen/ts/posts/v1/posts_pb.js";
import { SearchImagesResponse } from "inspire-api-contracts/api/gen/ts/search/v1/search_pb.js";

export const getSimilarImagesTool = {
  name: "get-similar-images-by-description",
  inputSchema: {
    description: z.string().describe("image description"),
    limit: z
      .number()
      .min(1)
      .max(10)
      .default(10)
      .describe("pagination: limit. set at least 5"),
    offset: z.number().describe("pagination: offset"),
  },
  metadata: {
    title: "Get similar images by their text description",
  },
  handler: async ({
    description,
    limit,
    offset,
  }: {
    description: string;
    limit: number;
    offset: number;
  }) => {
    const results = (await searchClient.searchPosts({
      searchBy: { case: "textQuery", value: description },
      offset,
      limit,
    })) as SearchImagesResponse;

    if (!results) {
      return {
        content: [
          { type: "text" as const, text: "Failed to retrieve similar images" },
        ],
      };
    }

    const posts = (await postsClient.getPosts({
      postIds: results.results.map((res) => res.postId),
    })) as GetPostsResponse;

    if (!posts) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Failed to retrieve posts for images",
          },
        ],
      };
    }

    const postsImages = await Promise.all(
      posts.posts.map(downloadImageAsBase64),
    );

    const interleavedContent: (
      | { type: "text"; text: string }
      | { type: "image"; mimeType: string; data: string }
    )[] = [];

    const MAX_RESPONSE_SIZE = 1_048_576;
    let currentSize = 0;

    for (const imageData of postsImages) {
      const estimatedSize = Buffer.byteLength(imageData.base64, "base64");

      if (currentSize + estimatedSize > MAX_RESPONSE_SIZE) break;

      interleavedContent.push({
        type: "image" as const,
        data: imageData.base64,
        mimeType: imageData.mimeType,
      });

      currentSize += estimatedSize;
    }

    return { content: interleavedContent };
  },
};
