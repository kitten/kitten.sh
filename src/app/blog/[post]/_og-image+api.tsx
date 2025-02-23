import { getBlogOGImage } from '~/screens/BlogOGImage';

export async function GET(request: Request, { post }: { post: string }) {
  return getBlogOGImage(request, { postId: post });
}
