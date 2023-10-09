// import { AppProps } from "next/app";
import Head from "next/head";

import "./globals.css";
import Script from "next/script";

export default function App({ Component, pageProps })
{
  return (
    <>
      <Head>
        <title>WebCrafter</title>

      </Head>

      <Component {...pageProps} />
    </>
  );
};
