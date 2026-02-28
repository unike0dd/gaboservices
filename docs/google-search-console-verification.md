# Google Search Console verification

`<meta name="google-site-verification" ...>` is used by Google to prove you own the site.

## Where to get the token
1. Open **Google Search Console**: https://search.google.com/search-console
2. Add your property (recommended: **URL prefix** for `https://www.gabo.services/`).
3. Choose **HTML tag** verification.
4. Google will show a tag like:

```html
<meta name="google-site-verification" content="abc123XYZ..." />
```

5. Copy only the `content` value and paste it into `index.html`:

```html
<meta name="google-site-verification" content="YOUR_SEARCH_CONSOLE_TOKEN" />
```

## Notes
- Keep this tag on the homepage (`/index.html`) only.
- Alternative method: use Google's verification HTML file upload instead of the meta tag.
