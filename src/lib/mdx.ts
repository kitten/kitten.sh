import type { ImageSource } from 'expo-image';

type MediaSourceProps<K extends keyof JSX.IntrinsicElements> =
  { src: ImageSource | string | undefined; } extends infer T
    ? T & Omit<JSX.IntrinsicElements[K], keyof T>
    : never;

interface CustomComponents {
  img: (props: MediaSourceProps<'img'>) => JSX.Element;
}

export type JSXComponents = {
  [K in keyof JSX.IntrinsicElements]?: K |
    (CustomComponents extends { [_K in K]: infer T } ? T : ((props: JSX.IntrinsicElements[K]) => JSX.Element))
};

export interface Metadata {
  title: string;
  subtitle: string;
  createdAt: string;
}
