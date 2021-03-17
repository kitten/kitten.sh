import React, { useCallback } from 'react';
import { styled } from 'goober';
import galite from '@philpl/ga-lite';

import { sizes, mobile, tablet, desktop } from './theme';
import { h3 as H3, p as P } from './article';

const Container = styled('aside')`
  position: relative;
  padding: 3.5rem 2ch;
  box-sizing: border-box;
  width: 100vw;
  left: 50%;
  margin-left: -50vw;
  margin-top: 4.5rem;
  background: var(--color-gray-background);
  color: var(--color-gray-text);

  & h3 {
    margin-top: 0.5rem;
  }

  & p {
    line-height: 2.6ch;
  }

  ${mobile`
    padding-bottom: 1.5rem;
  `}
`;

const Wrapper = styled('div')`
  display: grid;
  max-width: 65ch;
  width: 100%;
  margin: 0 auto;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  grid-gap: 2ch;
  place-items: end;

  > p {
    font-weight: var(--text-weight-medium);
    font-variation-settings:
      "wght" var(--text-weight-medium)
      "opsz" var(--text-width-label);
  }

  ${mobile`
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    place-items: start;
    grid-gap: 2.5rem;
  `}
`;

const Form = styled('form')`
  width: 90%;

  ${mobile`
    width: calc(100% - 2ch);
  `}
`;

const Label = styled('label')`
  font-size: 1rem;
  text-transform: uppercase;
  font-family: var(--font-heading);
  color: var(--color-active);

  font-weight: var(--text-weight-bold);
  font-variation-settings:
    "wght" var(--text-weight-bold)
    "opsz" var(--text-width-label);
`;

const Input = styled('input')`
  display: block;
  color: var(--color-gray-text);
  letter-spacing: -0.1px;
  appearance: none;
  box-shadow: none;
  background: none;
  border: none;
  outline: none;

  &:required, &:invalid {
    appearance: none;
    box-shadow: none;
    border: none;
    outline: none;
  }

  font-family: var(--font-code);
  font-size: 1rem;
  line-height: 1.5rem;
  padding: 0.5em 0 1em 0;
  width: 100%;

  background-size: 100% 2px;
  background-repeat: no-repeat;
  background-position: 0 2.4rem;

  transition:
    font-size 0.15s ease-out,
    background-position 0.15s ease-out,
    background-size 0.15s ease-out;

  background-image: linear-gradient(
    to bottom,
    var(--color-active) 0%,
    var(--color-active) 100%
  );

  &:focus {
    background-position: 0 2.7rem;
    background-size: 100% 3px;
    font-size: 1.1rem;
  }
`;

const Submit = styled('button')`
  font-family: var(--font-heading);
  font-size: 1.2rem;
  padding: 0.5em 1ch;
  border: none;
  border-radius: 100em;
  float: right;

  color: inherit;
  background-color: inherit;
  margin: 0.7rem -0.5ch 0 auto;
  cursor: pointer;

  font-weight: var(--text-weight-medium);
  font-variation-settings:
    "wght" var(--text-weight-medium)
    "opsz" var(--text-width-label);

  transition:
    opacity 0.15s ease-out,
    box-shadow 0.2s ease-out;
  box-shadow: var(--shadow);

  &:hover {
    color: var(--color-text);
  }

  &:active {
    box-shadow: var(--shadow-inv);
  }
`;

const Signup = () => {
  const onSubmit = useCallback(() => {
    galite('send', 'event', 'Newsletter', 'subscribe', document.location.pathname);
  }, []);

  return (
    <Container>
      <Wrapper>
        <div>
          <H3>Thanks for reading!</H3>
          <P>
            Subscribe to receive new posts around JS, React, GraphQL, and more,
            delivered straight to your inbox as I publish them.
          </P>
        </div>
        <Form
          onSubmit={onSubmit}
          action="https://app.convertkit.com/forms/1847042/subscriptions"
          method="post"
        >
          <Label>
            Email
            <Input
              type="email"
              spellcheck="false"
              placeholder="you@awesome.com"
              name="email_address"
              required
            />
          </Label>
          <Submit type="submit">
            Subscribe
          </Submit>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default Signup;
