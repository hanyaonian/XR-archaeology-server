import type { ReactElement, ReactNode } from "react";
import type { NextPage, NextPageContext } from "next";
import type { AppProps } from "next/app";
import "../styles/main.css";
import Head from "next/head";
import { FeathersProvider } from "@/contexts/feathers";

// server-side only code: to configure server api URL
MyApp.getInitialProps = async (ctx: NextPageContext) => {
  try {
    const { def: configs } = await import("@configs");
    const baseURL = configs.prod ? configs.getUrl("internal") : configs.getUrl("api");
    return { baseURL };
  } catch (error) {
    return {};
  }
};

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  baseURL?: string;
};

export default function MyApp({ Component, baseURL, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <title>APSAP</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FeathersProvider baseURL={baseURL}>{getLayout(<Component {...pageProps} />)}</FeathersProvider>
    </>
  );
}
