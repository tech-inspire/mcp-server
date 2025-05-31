import axios from "axios";
import sharp from "sharp";
import {
  Post,
  VariantType,
  ImageVariant,
} from "inspire-api-contracts/api/gen/ts/posts/v1/posts_pb.js";

const IMAGES_BASE_PATH = process.env.IMAGES_BASE_PATH;

export function getMainImage(post: Post): ImageVariant {
  return (
    post.images.find(
      (i: ImageVariant) => i.variantType === VariantType.ORIGINAL,
    ) ?? post.images[0]
  );
}

export function getPostImageURL(post: Post): string {
  return new URL(getMainImage(post).url, IMAGES_BASE_PATH).href;
}

export async function downloadImageAsBase64(
  post: Post,
): Promise<{ postId: string; base64: string; mimeType: string }> {
  const imageURL = getPostImageURL(post);

  try {
    const response = await axios.get(imageURL, { responseType: "arraybuffer" });

    const contentType = response.headers["content-type"];
    const buffer = await sharp(response.data)
      .resize(400)
      .jpeg({ quality: 70 })
      .toBuffer();

    return {
      postId: post.postId,
      base64: buffer.toString("base64"),
      mimeType: contentType,
    };
  } catch (error) {
    throw new Error(`Failed to download or convert image: ${error}`);
  }
}
