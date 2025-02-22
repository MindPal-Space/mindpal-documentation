import { useEffect } from "react";
import { useRouter } from "next/router";
import * as gtag from "../lib/gtag";
import Script from "next/script";

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Component {...pageProps} />
      <Script id="mindpal-friend2-setup">
        {`
        window.mindpalConfig = {
          chatbotId: "mindpal-friend2",
          chatbotAvatarUrl: "https://ph-files.imgix.net/9b89dafe-b565-431d-9093-23e626ae286a.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=64&h=64&fit=crop&dpr=1",
          chatbotTheme: "mindpal-light",
        };
      `}
      </Script>
      <Script
        id="mindpal-friend2-run"
        src="https://chatbot.getmindpal.com/embed.min.js"
      ></Script>
    </>
  );
};

export default App;
