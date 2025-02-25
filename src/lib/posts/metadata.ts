import { Metadata } from '../mdx';

const contentRe = /([^\/]+)(?:[\/]index)\.[jt]sx?$/i;
const context = require.context('../../../blog', true, /([^\/]+)(?:[\/]index)\.[jt]sx?$/i);

const modules = context
  .keys()
  .map((moduleName) => {
    const id = moduleName.match(contentRe)?.[1];
    return id ? { id, moduleName } : null;
  })
  .filter((entry) => entry != null);

export const metadataList = modules
  .map(({ id, moduleName }) => {
    const metadata: Metadata = context(moduleName).metadata;
    return {
      id,
      title: metadata.title,
      subtitle: metadata.subtitle,
      createdAt: new Date(metadata.createdAt),
    };
  })
  .sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());

export function getMetadata(postId: string): Metadata | null {
  const meta = modules.find((mod) => mod.id === postId);
  return meta ? context(meta.moduleName).metadata : null;
}
