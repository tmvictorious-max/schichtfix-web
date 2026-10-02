/* Schichtfix: consent-based analytics (GA4, Consent Mode v2) + click/form events + traffic source.
   GA is loaded only after "Akzeptieren". To activate, put the GA4 measurement ID below (e.g. "G-XXXXXXX"). */
var SF_GA_ID = "G-SW59PD5XMG";

window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });

function sfConsentGiven(){ try { return localStorage.getItem("sf_cookie") === "accepted"; } catch (e) { return false; } }

function sfLoadGA(){
  if (!SF_GA_ID || window.sfGALoaded) return;
  window.sfGALoaded = true;
  gtag("consent", "update", { analytics_storage: "granted" });
  var s = document.createElement("script");
  s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + SF_GA_ID;
  document.head.appendChild(s);
  gtag("js", new Date());
  gtag("config", SF_GA_ID, { anonymize_ip: true });
}

function sfTrack(name, params){ if (window.sfGALoaded) gtag("event", name, params || {}); }

/* Traffic source (utm_* / referrer): kept only for this page view, or stored after consent */
function sfSource(){
  var q = new URLSearchParams(location.search), src = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(function(k){ if (q.get(k)) src[k] = q.get(k); });
  if (!Object.keys(src).length && document.referrer && document.referrer.indexOf(location.host) < 0) src.referrer = document.referrer;
  if (Object.keys(src).length) { if (sfConsentGiven()) try { localStorage.setItem("sf_src", JSON.stringify(src)); } catch (e) {} return src; }
  try { return JSON.parse(localStorage.getItem("sf_src") || "{}"); } catch (e) { return {}; }
}
function sfSourceText(){ var s = sfSource(); return Object.keys(s).map(function(k){ return k + "=" + s[k]; }).join(", ") || "direkt"; }

document.addEventListener("click", function(e){
  var a = e.target.closest && e.target.closest("a");
  if (!a) return;
  var h = a.getAttribute("href") || "";
  if (h.indexOf("tel:") === 0) sfTrack("click_phone");
  else if (h.indexOf("whatsapp.com/channel") > -1) sfTrack("click_whatsapp_channel");
  else if (h.indexOf("wa.me") > -1) sfTrack("click_whatsapp");
  else if (h.indexOf("mailto:") === 0) sfTrack("click_email");
});

if (sfConsentGiven()) sfLoadGA();
