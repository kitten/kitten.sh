import { useLocalSearchParams } from 'expo-router';
import { BlogScreen, blogPosts } from '~/screens/BlogScreen';

export async function generateStaticParams(): Promise<{ post: string }[]> {
  return blogPosts.map((post) => ({ post: post.id }));
}

export default function Route() {
  const { post: postId } = useLocalSearchParams<{ post: string }>();
  return <BlogScreen postId={postId} />;
}
