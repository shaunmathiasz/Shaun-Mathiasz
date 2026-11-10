/** Official GTM bootstrap wrapped by next/script after verified consent. */
export function gtmBootstrap(id: string) {
  if (!/^GTM-[A-Z0-9]+$/.test(id)) throw new Error("Invalid GTM container ID");
  return `
(function(w,d,s,l,i){
 if(!w.__sdmCanStartGtm || !w.__sdmCanStartGtm()) return;
 if(w.__sdmGtmStarted || d.querySelector('script[src^="https://www.googletagmanager.com/gtm.js"]')) return;
 w[l]=w[l]||[];
 function consent(){w[l].push(arguments);}
 consent('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',personalization_storage:'denied',wait_for_update:500});
 consent('set','ads_data_redaction',true);
 consent('set','url_passthrough',false);
 consent('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 w.__sdmGtmStarted=true;
 w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
 w.__sdmGtmLastPath=w.location.pathname;
 w[l].push({event:'portfolio_page_view',page_path:w.location.pathname,page_location:w.location.origin+w.location.pathname});
 var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.referrerPolicy='no-referrer';j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(id)});
`;
}
