import type { ImageSource } from 'expo-image';
import type { JSXComponents, Metadata } from '~/lib/mdx';

type Props = { components?: JSXComponents };

export namespace MarkdownFile {
  var renderMarkdown: (props: Props) => JSX.Element;
  export var metadata: Metadata;
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


