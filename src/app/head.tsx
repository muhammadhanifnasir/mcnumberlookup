const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const googleAdsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

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
          />
        </>
      ) : null}
      {googleAnalyticsId ? (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(googleAnalyticsId)});
              `,
            }}
          />
        </>
      ) : null}
    </>
  );
}
