import { useLocalSearchParams } from 'expo-router';
import { postsList } from '~/lib/posts/default';
import { BlogScreen } from '~/screens/BlogScreen';

export async function generateStaticParams(): Promise<{ post: string }[]> {
  return postsList.map(({ id }) => ({ post: id }));
}

export default function Route() {
  const { post: postId } = useLocalSearchParams<{ post: string }>();
  return <BlogScreen postId={postId} />;
}
