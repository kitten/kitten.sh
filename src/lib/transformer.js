const { transform: babelTransform } = require('@expo/metro-config/babel-transformer');
const { compile: compileMDX } = require('@mdx-js/mdx');

const { default: remarkSqueezeParagraphs } = require('remark-squeeze-paragraphs');
const { default: remarkSmartypants } = require('remark-smartypants');
const { default: remarkGFM } = require('remark-gfm');
const { default: rehypeUnwrapImages } = require('rehype-unwrap-images');
const { default: rehypeImportMedia } = require('rehype-mdx-import-media');
const { default: rehypeShiki } = require('@shikijs/rehype');
const { default: rehypeSlug } = require('rehype-slug');

async function transform(params) {
  const { src, filename, options } = params;
  if (/mdx?$/.test(filename)) {
    const outputFile = await compileMDX(
      { path: filename, value: src },
      {
        development: options.dev,
        jsx: true,
        remarkPlugins: [
          remarkGFM,
          remarkSqueezeParagraphs,
          remarkSmartypants,
        ],
        rehypePlugins: [
          rehypeSlug,
          rehypeUnwrapImages,
          rehypeImportMedia,
          [rehypeShiki, {
            theme: 'vitesse-dark',
          }],
        ],
      }
    );
    params.src = outputFile.toString();
  }
  return babelTransform(params);
}

module.exports = { transform };
