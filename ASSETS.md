# Media provenance — Midnight Executive V2

All new photos are downloaded local assets, served through next/image. They are contextual illustrations of travel and destinations, not evidence that Shaun visited a location, worked at the pictured resort or created a specific campaign.

| Local asset                             | Original source                                                                                          | License                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `public/images/editorial/maldives.jpg`  | https://images.unsplash.com/photo-1514282401047-d79a71a590e8                                             | Unsplash License: https://unsplash.com/license                                    |
| `public/images/editorial/london.jpg`    | https://images.unsplash.com/photo-1513635269975-59663e0ac1ad                                             | Unsplash License: https://unsplash.com/license                                    |
| `public/images/editorial/landscape.jpg` | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1                                             | Unsplash License: https://unsplash.com/license                                    |
| `src/content/land.json`                 | Simplified from https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson | Natural Earth public domain: https://www.naturalearthdata.com/about/terms-of-use/ |

Existing portrait and CV are user-supplied and retained. The public CV remains the redacted derivative from V1. Self-hosted fonts retain their SIL Open Font License notices in src/assets/fonts.

The Natural Earth coastlines use an orthographic equatorial projection. Hidden-side line segments are omitted. Location coordinates are geographic: Colombo 6.927 N / 79.861 E; Siyam World region 5.894 N / 73.322 E; UK market marker London 51.507 N / 0.128 W. The London marker indicates market focus, not residence or employment location.

V2 adds Latin and editorial-punctuation subsets of the supplied font sources in WOFF format (174,812 bytes combined versus 1,162,616 bytes of source TTF). Original font sources and license notices remain available. No runtime font service is used.

## V4 addition

- `public/images/editorial/colombo.jpg`: Dmitriy Sarychev, “City skyline with ocean view at dusk”, Colombo, Sri Lanka. [Original photograph](https://unsplash.com/photos/city-skyline-with-ocean-view-at-dusk-QsyDe3_7OV0), [Unsplash License](https://unsplash.com/license). Source page explicitly marks the image free under that licence. Downloaded locally at 1600px; Next Image generates responsive derivatives. Contextual city imagery; it does not document Shaun's workplace or a commissioned project. Original image URL: `https://images.unsplash.com/photo-1765153743359-cfd5b64b2b64`.

No reference-site imagery, video, code or logos were copied. Existing organisation marks retain their documented trademark restrictions in V3_LOGOS.md. No new organisation marks were required in V4.
- `public/images/career-globe-preview.svg`: original static orthographic rendering generated from the project's existing Natural Earth public-domain coordinates. Used as the no-JavaScript/near-viewport loading fallback for the existing interactive globe; no additional geographic source or external runtime.
