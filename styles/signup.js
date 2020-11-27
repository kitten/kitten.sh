import { styled } from 'goober';

import { sizes, mobile, tablet, desktop } from './theme';
import { h3 as H3 } from './article';

const Container = styled('aside')`
  position: relative;
  padding: 2.5rem 2ch 3.5rem 2ch;
  box-sizing: border-box;
  width: 100vw;
  left: 50%;
  margin-left: -50vw;
  margin-top: 2.5rem;
  background: var(--color-prism-bg);
`;

const Wrapper = styled('aside')`
  max-width: 65ch;
  width: 100%;
  margin: 2.5rem auto 0.5rem auto;
`;

const Signup = () => (
  <Container>
    <Wrapper>
      <H3>Thanks for reading!</H3>
    </Wrapper>
  </Container>
);

export default Signup;
