# Kabuor Builds marketing

- `brand/`: the brand kit. `logo.html` is the source of the lockups (open it through the ad server below to
  see the fonts); `mark.svg` is the price-tag K; PNGs are exported lockups and app icons.
  Colours: ink #0F1115, orange #FF5B1F, cream #FFF7EC. Type: Bricolage (wdth 85, 800), Fraunces italic, Onest.
- `ad/`: the 30-second vertical ad (1080×1920). `ad.html` is the animation, `kabuor-builds-ad.mp4` the render.

## Re-rendering the ad

```bash
cd marketing/ad
npm install
node serve.mjs              # http://localhost:4300 (serves ad/ and brand/)
node render.mjs stills 2 10 # check single moments → stills/
node render.mjs video       # frames/ then kabuor-builds-ad.mp4
```

Rendering uses Google Chrome from its default Windows install path (see `render.mjs`).
