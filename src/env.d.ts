import type { ImageSource } from 'expo-image';
import type { JSXComponents, MarkdownFile } from '~/lib/mdx';

interface Props {
  components?: JSXComponents
}

export namespace MarkdownFile {
  var renderMarkdown: (props: Props) => JSX.Element;
  export default renderMarkdown;
}

declare module '*.md' {
  export = MarkdownFile;
}

declare module '*.mdx' {
  export = MarkdownFile;
}

declare module '*.png' {
  var source: ImageSource;
  export default source;
}

declare module '*.avif' {
  var source: ImageSource;
  export default source;
}
