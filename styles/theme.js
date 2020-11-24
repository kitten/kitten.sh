export const sizes = {
  mobile: 700,
  page: 1200
};

export const mobile = css => `
  @media (max-width: ${sizes.mobile - 1}px) {
    ${css}
  }
`;

export const notMobile = css => `
  @media (min-width: ${sizes.mobile}px) {
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
