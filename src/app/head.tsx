const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const googleAdsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const googleScriptNonce = process.env.GOOGLE_SCRIPT_NONCE;

const analyticsBootstrapScript = googleAnalyticsId
  ? [
      "window.dataLayer = window.dataLayer || [];",
      "function gtag(){dataLayer.push(arguments);}",
      "gtag('js', new Date());",
      `gtag('config', ${JSON.stringify(googleAnalyticsId)});`,
    ].join("\n")
  : null;

export default function Head() {
  return (
    <>
      {googleSiteVerification ? (
        <meta name="google-site-verification" content={googleSiteVerification} />
      ) : null}
      {googleAdsenseClient ? (
        <>
          <meta name="google-adsense-account" content={googleAdsenseClient} />
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(googleAdsenseClient)}`}
            crossOrigin="anonymous"
            nonce={googleScriptNonce}
          />
        </>
      ) : null}
      {googleAnalyticsId && analyticsBootstrapScript ? (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}
            nonce={googleScriptNonce}
          />
          <script
            nonce={googleScriptNonce}
            dangerouslySetInnerHTML={{
              __html: analyticsBootstrapScript,
            }}
          />
        </>
      ) : null}
    </>
  );
}
