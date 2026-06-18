import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const MAX_PAGES = 50
const MAX_CHARS_PER_PAGE = 7000
const MAX_TOTAL_CHARS = 90000
// Pages prioritaires (services/tarifs/formations) : scrapées en premier pour
// qu'elles tiennent dans le budget de caractères.
const PRIORITY_RE = /service|soin|traitement|tarif|prix|forfait|menu|catalogue|formation|cours|atelier|product|produit|boutique|magasin|shop/i

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getAdminClient()

  const { data: location } = await supabase
    .from("locations")
    .select("id, website_url")
    .eq("clinic_id", id)
    .single()

  if (!location?.website_url) {
    return new Response(
      `data: ${JSON.stringify({ type: "error", error: "Aucun site web configuré pour cette clinique" })}\n\n`,
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    )
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const baseUrl = new URL(location.website_url)
        const visited = new Set<string>()
        const queue: string[] = [normalizeUrl(location.website_url)]
        const allContent: string[] = []

        while (queue.length > 0 && visited.size < MAX_PAGES) {
          const pageUrl = queue.shift()!
          if (visited.has(pageUrl)) continue
          visited.add(pageUrl)

          const percent = Math.round((visited.size / MAX_PAGES) * 100)
          send({ type: "progress", pages: visited.size, percent })

          try {
            const ctrl = new AbortController()
            const timer = setTimeout(() => ctrl.abort(), 10_000)
            const res = await fetch(pageUrl, {
              signal: ctrl.signal,
              headers: { "User-Agent": "Mozilla/5.0 (compatible; AlexandraBot/1.0; +https://vocali.ca)" },
            })
            clearTimeout(timer)
            if (!res.ok) continue

            const html = await res.text()
            for (const link of extractLinks(html, baseUrl, pageUrl)) {
              if (visited.has(link) || queue.includes(link)) continue
              // Les pages services/tarifs/formations passent en tête de file.
              if (PRIORITY_RE.test(link)) queue.unshift(link)
              else queue.push(link)
            }

            const text = extractText(html, MAX_CHARS_PER_PAGE)
            if (text.trim().length > 100) {
              const label = pageUrl.replace(baseUrl.origin, "") || "/"
              allContent.push(`=== ${label} ===\n${text}`)
            }
          } catch { /* skip page */ }
        }

        // Beaucoup de boutiques (Lightspeed, Shopify…) chargent les produits en
        // JavaScript → invisibles dans le HTML. Le sitemap, lui, liste TOUTES les
        // pages produits. On en tire la liste complète (noms depuis les slugs).
        const sitemapNames = await fetchSitemapProducts(baseUrl.origin)

        let combined = allContent.join("\n\n").slice(0, MAX_TOTAL_CHARS)
        if (sitemapNames.length > 0) {
          combined +=
            `\n\n=== LISTE COMPLÈTE DES PRODUITS / SERVICES / FORMATIONS (depuis le sitemap) ===\n` +
            sitemapNames.map((n) => `- ${n}`).join("\n")
        }

        await supabase
          .from("locations")
          .update({ website_content: combined })
          .eq("id", location.id)

        send({ type: "done", chars: combined.length, pages: visited.size, sitemap: sitemapNames.length })
      } catch (err) {
        send({ type: "error", error: err instanceof Error ? err.message : "Erreur inconnue" })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}

// Lit /sitemap.xml et tire un nom lisible de chaque slug de produit/page.
async function fetchSitemapProducts(origin: string): Promise<string[]> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12_000)
    const res = await fetch(`${origin}/sitemap.xml`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AlexandraBot/1.0; +https://vocali.ca)" },
    })
    clearTimeout(timer)
    if (!res.ok) return []
    const xml = await res.text()
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1])
    const SKIP = /(account|cart|panier|search|recherche|pages\/|carte-cadeau|gift|login|compte|wishlist|checkout)/i
    const names = locs
      .map((u) => {
        const m = u.match(/\/products\/([^/?#]+)/i)
        return m ? m[1] : ""
      })
      .filter((slug) => slug && !SKIP.test(slug))
      .map((slug) =>
        decodeURIComponent(slug)
          .replace(/[-_]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      )
    return [...new Set(names)].slice(0, 400)
  } catch {
    return []
  }
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ""
    return u.toString()
  } catch {
    return url
  }
}

function extractLinks(html: string, baseUrl: URL, currentUrl: string): string[] {
  const links: string[] = []
  const hrefRegex = /href=["']([^"'#?][^"']*?)["']/gi
  let match
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1].trim()
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue
    try {
      const resolved = new URL(href, currentUrl)
      resolved.hash = ""
      resolved.search = ""
      if (resolved.hostname === baseUrl.hostname) links.push(resolved.toString())
    } catch { /* skip */ }
  }
  return links
}

function extractText(html: string, maxLen: number): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|section|article|td|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è").replace(/&agrave;/g, "à").replace(/&ccedil;/g, "ç")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return text.split("\n").filter(l => l.trim().length >= 3).join("\n").slice(0, maxLen)
}
