import { styled } from 'goober';
import { FullBleed } from './article';

const Container = styled('div')`
  margin-bottom: 2rem;
`;

const Wrapper = styled(FullBleed)`
  position: fixed;
  background: var(--color-background);
  height: 2rem;
  z-index: 3;
  top: 0;
`;

const Label = styled('h4')`
  color: var(--color-text);
  text-align: center;
  font-size: 1rem;
  margin: auto;
`;

const Icon = styled('span')`
  &:before {
    display: inline-block;
    content: '🚧 ';
    margin-right: 1ch;
  }
`

export const InfoOverlay = ({ title }) => (
  <Container>
    <Wrapper role="dialog" aria-labelledby="title">
      <Label id="title">
        <Icon />
        {title}
      </Label>
    </Wrapper>
  </Container>
);
