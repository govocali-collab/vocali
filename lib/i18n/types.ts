export type Dictionary = {
  meta: {
    title: string
    description: string
    keywords: string
  }
  nav: {
    solution: string
    howItWorks: string
    franchise: string
    faq: string
    cta: string
    logo: string
  }
  hero: {
    badge: string
    headline: string
    subheadline: string
    ctaPrimary: string
    ctaSecondary: string
    trustedBy: string
    callCard: {
      live: string
      incomingCall: string
      newClient: string
      phone: string
      online: string
      aiName: string
      message: string
      stat1Label: string
      stat1Value: string
      stat2Label: string
      stat2Value: string
      stat3Label: string
      stat3Value: string
      captured: string
    }
  }
  problem: {
    badge: string
    title: string
    subtitle: string
    items: Array<{ title: string; desc: string }>
    revenueTitle: string
    revenueDesc: string
    revenueHighlight: string
  }
  solution: {
    badge: string
    title: string
    subtitle: string
    features: Array<{ title: string; desc: string }>
  }
  howItWorks: {
    badge: string
    title: string
    subtitle: string
    steps: Array<{ number: string; title: string; desc: string }>
  }
  benefits: {
    badge: string
    title: string
    subtitle: string
    items: Array<{ title: string; desc: string }>
  }
  franchise: {
    badge: string
    title: string
    subtitle: string
    features: Array<{ title: string; desc: string }>
    cta: string
  }
  pilot: {
    badge: string
    title: string
    subtitle: string
    testimonialPlaceholder: string
    cta: string
    spotsLeft: string
    ctaTitle: string
    ctaSubtitle: string
  }
  faq: {
    badge: string
    title: string
    items: Array<{ q: string; a: string }>
  }
  finalCta: {
    title: string
    subtitle: string
    cta: string
    note: string
  }
  footer: {
    tagline: string
    links: { privacy: string; terms: string; contact: string }
    copyright: string
    madeIn: string
  }
}
