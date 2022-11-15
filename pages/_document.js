import Document, { Html, Head, Main, NextScript } from 'next/document';
import { extractCss } from 'goober';

const dataThemeScript =
  "localStorage.getItem('prefers-theme') &&" +
    "document.documentElement.setAttribute('data-theme', localStorage.getItem('prefers-theme'))";

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
          <script
            async={true}
            dangerouslySetInnerHTML={{ __html: dataThemeScript }}
          />
          <style
            id="_goober"
            dangerouslySetInnerHTML={{ __html: `${this.props.css}` }}
          />
          <link rel="me" href="https://toot.cafe/@philpl" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
