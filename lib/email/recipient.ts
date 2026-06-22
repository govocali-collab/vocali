// Redirection optionnelle des courriels vers une seule boîte (catch-all).
// Utile en développement/test pour ne JAMAIS écrire aux vrais destinataires.
//
// Par défaut (variable absente) : chaque courriel va à son VRAI destinataire.
//   → En production (Vercel), ne PAS définir EMAIL_REDIRECT_TO.
// Pour réactiver une redirection (ex. tests locaux), dans .env.local :
//   EMAIL_REDIRECT_TO=govocali@gmail.com
const REDIRECT_ALL_TO = process.env.EMAIL_REDIRECT_TO ?? ""

/** Destinataire effectif d'un courriel (redirigé seulement si EMAIL_REDIRECT_TO est défini). */
export function mailTo(realRecipient: string): string {
  return REDIRECT_ALL_TO || realRecipient
}
