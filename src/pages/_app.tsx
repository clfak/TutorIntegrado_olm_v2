import { Auth0Provider } from "@auth0/auth0-react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { CombinedRQGQLProvider } from "rq-gql";
import { SyncAuth } from "../components/Auth";
import { MainLayout } from "../components/MainLayout";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { ErrorToast, queryClient, rqGQLClient } from "../rqClient";
import "../app.css";

const theme = extendTheme({});

export default function App({ Component, pageProps }: AppProps) {
  const isMobile = false;
  return (
    <>
      <Auth0Provider
        domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
        clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
        redirectUri={typeof window !== "undefined" ? window.location.origin : undefined}
      >
        <CombinedRQGQLProvider client={queryClient} rqGQLClient={rqGQLClient}>
          <ChakraProvider theme={theme}>
            <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
              <SyncAuth />
              <ErrorToast />
              <MainLayout>
                <Component {...pageProps} />
              </MainLayout>
            </DndProvider>
          </ChakraProvider>
        </CombinedRQGQLProvider>
      </Auth0Provider>
    </>
  );
}
