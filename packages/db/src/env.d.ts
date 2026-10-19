declare module '*?url' {
  const url: string;
  export default url;
}

interface ImportMetaEnv {
  /** Family cloud (optional), set at build time, e.g. in Cloudflare Pages → Settings → Environment variables. */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
