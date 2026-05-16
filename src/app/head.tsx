export default function Head() {
  const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const googleAdsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  const googleScriptNonce = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_NONCE;
  const nonceProps = googleScriptNonce ? { nonce: googleScriptNonce } : {};
  const analyticsBootstrapScript = googleAnalyticsId
    ? [
        "window.dataLayer = window.dataLayer || [];",
        "function gtag(){dataLayer.push(arguments);}",
        "gtag('js', new Date());",
        `gtag('config', ${JSON.stringify(googleAnalyticsId)});`,
      ].join("\n")
    : null;
  const googleAnalyticsScriptSrc = googleAnalyticsId
    ? `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`
    : null;

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
            {...nonceProps}
          />
        </>
      ) : null}
      {analyticsBootstrapScript && googleAnalyticsScriptSrc ? (
        <>
          <script async src={googleAnalyticsScriptSrc} {...nonceProps} />
          <script
            {...nonceProps}
            dangerouslySetInnerHTML={{
              __html: analyticsBootstrapScript,
            }}
          />
        </>
      ) : null}
    </>
  );
}
