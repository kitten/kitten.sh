export const getAbsoluteURL = path => {
  if (!path.startsWith('/')) path = '/' + path;
  const baseURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://kitten.sh';
  return baseURL + path
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
