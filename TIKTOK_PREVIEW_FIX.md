# Social preview error boundary and responsive sizing

The earlier profile-only fallback experiment in local commit 9bd0563 was never deployed. It is superseded by this update: working Instagram and TikTok embeds remain available.

## Behaviour

- Both previews load only when selected. They remain hidden behind an original midnight/gold loading panel until their widget signals readiness. `iframe.onload` alone is deliberately not treated as success: provider protection/error pages often return HTTP 200.
- The page verifies exact provider origin **and** the sending iframe window before accepting any message. TikTok must also echo the current iframe token; Instagram uses its SDK MOUNTED/MEASURE messages. Unknown/malformed/oversized messages are ignored.
- Transport errors or a 15-second readiness timeout unmount the iframe and display the themed recovery panel: “A short pause in the journey.” Visitors can retry, open the profile directly or close the preview. There is no automatic retry loop, scraping or protection bypass.
- A provider can signal readiness and later display its own error without notifying the parent. Cross-origin security prevents reading that error text. “Preview not working?” therefore remains available to switch immediately to the same custom panel. This is an explicit limitation, not a promise to detect every provider error.
- Valid height reports update the box throughout the preview's lifetime. Container width is observed with ResizeObserver. At unusually narrow widths the iframe keeps the provider's minimum layout width (Instagram 326px, TikTok 288px) and scales down geometrically; the outer height scales with it. Essential fitting still works with reduced motion enabled.
- Direct profile links, on-demand privacy, the homepage-only portrait policy, social figures and the rest of the site remain unchanged. No new dependency, API key or environment variable.

## Protocol sources

Readiness/height conventions were inspected in the existing downloaded official Instagram `embed.js` and TikTok creator embed SDK v1.0.15. No SDK implementation code was copied. Message decoding is a small original adapter and does not navigate to links supplied by postMessage.

## Testing

Unit tests cover provider message validation, malformed input, tokens and responsive geometry. Browser fixtures simulate healthy ready messages, changing heights, HTTP-200 protection pages without a ready message, spoofed origins/windows, recovery, retries and narrow layouts. These tests verify the site's boundary, not the availability of the real provider services. Final local results: lint, typecheck and production build passed; 46 unit tests and 76 Playwright cases passed. Mocked ready previews fitted 360px, 768px and 1440px without horizontal overflow. Axe reported no violations on the parent recovery screen at those widths (not an audit of cross-origin provider content). A real TikTok browser request hit this environment’s certificate-authority error; the themed fallback appeared correctly, but healthy live-provider rendering could not be independently verified here. TLS validation was not bypassed.
