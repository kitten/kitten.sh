import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="preload" href="/fonts/188-70.woff2" as="font" />
        <link rel="preload" href="/fonts/188-100.woff2" as="font" />
        <link rel="preload" href="/fonts/departure.woff2" as="font" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="robots" content="index,follow" />
        <title>kitten.sh</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

