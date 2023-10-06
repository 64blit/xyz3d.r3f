import { AppProps } from "next/app";
import Head from "next/head";

import "./globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>WebCrafter</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};
