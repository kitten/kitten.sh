import { MarkdownFile } from '../../env';

const contentRe = /([^\/]+)(?:[\/]index)\.mdx?$/i;
const context = require.context('../../../blog', true, /([^\/]+)(?:[\/]index)\.mdx?$/i);

export const postsList = context
  .keys()
  .map((moduleName) => {
    const id = moduleName.match(contentRe)?.[1];
    return id ? { id, moduleName } : null;
  })
  .filter((entry) => entry != null);

export function getPost(postId: string): typeof MarkdownFile | null {
  const post = postsList.find((mod) => mod.id === postId);
  return post ? context(post.moduleName) : null;
}
