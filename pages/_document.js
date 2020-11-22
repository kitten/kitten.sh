import Document, { Html, Head, Main, NextScript } from 'next/document'
import { extractCss } from 'goober'

const dataThemeScript =
  "localStorage.getItem('prefers-theme') &&" +
    "document.documentElement.setAttribute('data-theme', localStorage.getItem('prefers-theme'))";

const description = 'Random and hopefully useful thoughts and posts around JS, React, GraphQL, and more.';

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }) {
    const page = await renderPage()
    const css = extractCss()
    return { ...page, css };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="description" content={description} />
          <meta name="og:description" content={description} />
          <meta name="og:type" content="website" />

          <script
            async={true}
            dangerouslySetInnerHTML={{ __html: dataThemeScript }}
          />
          <style
            id="_goober"
            dangerouslySetInnerHTML={{ __html: `${this.props.css}` }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
