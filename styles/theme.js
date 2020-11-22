export const sizes = {
  page: 1200
};

export const mobile = css => `
  @media (max-width: 699px) {
    ${css}
  }
`;

export const tablet = css => `
  @media (max-width: ${sizes.page - 1}px) {
    ${css}
  }
`;

export const desktop = css => `
  @media (min-width: ${sizes.page}px) {
    ${css}
  }
`;
