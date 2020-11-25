export const getAbsoluteURL = (path, req) => {
  if (!path) path = '';
  if (!path.startsWith('/')) path = '/' + path;
  return 'https://kitten.sh' + path;
};

export const toDateString = date => {
  const x = new Date(date);
  const day = x.getDate();
  const month = x.toLocaleDateString('en-US', { month: 'long' });
  const year = x.getFullYear();
  return `${month} ${day}, ${year}`;
};

export const getPath = page =>
  page.__resourcePath.replace(/(?:\/(?:index)?)?\.mdx?$/, '');

export const getCoverURL = page => {
  const searchParams = new URLSearchParams();
  searchParams.set('slug', getPath(page));
  return getAbsoluteURL(`/api/cover?${searchParams}`);
};

export const getTwitterShareLink = page => {
  const searchParams = new URLSearchParams();
  searchParams.set('url', getAbsoluteURL(getPath(page)));
  searchParams.set('text', `“${page.title}”`);
  if (page.published && page.published.handle)
    searchParams.set('via', page.published.handle);
  return `https://twitter.com/share?${searchParams}`;
};
