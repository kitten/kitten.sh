const withPlugins = require('next-compose-plugins');
const withPreact = require('next-plugin-preact');
const withMdxEnhanced = require('next-mdx-enhanced');

module.exports = withPlugins(
  [
    withMdxEnhanced({
      remarkPlugins: [
        require('@silvenon/remark-smartypants'),
        require('remark-squeeze-paragraphs'),
        require('remark-unwrap-images'),
        require('remark-emoji'),
        require('remark-gfm'),
      ],
      rehypePlugins: [
        require('@mapbox/rehype-prism'),
        require('rehype-slug'),
      ],
      layoutPath: 'layouts',
      defaultLayout: true,
      fileExtensions: ['md'],
      usesSrc: false,
    }),
    withPreact,
  ],
  {
    pageExtensions: ['js', 'md'],
    experimental: {
      modern: true,
    },
    webpack(config, { isServer }) {
      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash].[ext]',
              outputPath: 'static/chunks/images/',
              publicPath: '/_next/static/chunks/images/',
            },
          },
        ],
      });

      config.module.rules.unshift({
        test: /\.(jpe?g|png|gif|webp)$/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              adapter: require('responsive-loader/sharp'),
              outputPath: 'static/chunks/images/',
              publicPath: '/_next/static/chunks/images/',
              sizes: [350, 700, 1000, 2000],
              progressive: true,
              quality: 70,
              emitFile: !isServer,
            },
          },
        ],
      });

      return config;
    },
  }
);
