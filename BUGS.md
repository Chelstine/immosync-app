# Known Issues / To Do

- **Configuration**: Airtable API keys and Base ID are placeholders in `.env.local`. You must fill them.
- **Photo Upload**: Currently, photos are not attached to Airtable records because the Airtable API requires a public URL for attachments. The code extracts `photos` from the form but ignores them for the API call. To fix this, integrate Vercel Blob or AWS S3 to upload the file first, then pass the URL to Airtable.
- **NextAuth Secret**: A placeholder secret was generated. For production, generate a secure random string.
- **Facebook Publication**: Phase 8 (Facebook Marketplace automation) was skipped as it was marked optional.
- **Images**: The application uses standard `<img>` tags. consistently. For better performance, consider migrating to `next/image` and configuring `next.config.js` to allow Airtable domains.
