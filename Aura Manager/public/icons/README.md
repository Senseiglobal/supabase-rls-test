Place the exported branding assets in this folder so they are served by Vite/Vercel:

Required filenames (copy or rename from the `Logo/` folder):

- apple-touch-icon.png                     # 180x180 for iOS home screen
- light_icon_16x16.png                     # favicon (light) 16x16
- light_icon_32x32.png                     # favicon (light) 32x32
- dark_icon_16x16.png                      # favicon (dark) 16x16
- dark_icon_32x32.png                      # favicon (dark) 32x32
- og_light_logo.png                        # Open Graph image (recommended 1200x630)
- og_dark_logo.png                         # Optional dark OG variant
 - light_icon_192.png                      # PWA icon 192x192 (light)
 - light_icon_512.png                      # PWA icon 512x512 (light)
 - dark_icon_192.png                       # PWA icon 192x192 (dark)
 - dark_icon_512.png                       # PWA icon 512x512 (dark)
 - light_icon_512_maskable.png            # PWA maskable icon 512x512 (light, transparent padding)

Notes:
- Browsers can switch favicons using the media query on <link rel="icon">.
- Open Graph does not auto-switch by theme; we provide light as default.
- Keep file names exactly as above to match index.html link/meta tags.
 - For PWA install prompts, the 192/512 PNGs are required on most platforms.
 - The maskable icon improves adaptive icon rendering on Android (ensure safe zone: keep glyph within center 66%).
