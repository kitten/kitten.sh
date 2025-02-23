export const toDateString = (date: string | Date) => {
  const x = new Date(date);
  const day = x.getDate();
  const month = x.toLocaleDateString('en-US', { month: 'long' });
  const year = x.getFullYear();
  return `${month} ${day}, ${year}`;
};


