// ⚠️ PHASE DE TEST — toutes les notifications courriel sont temporairement
// redirigées vers une seule boîte de réception (catch-all).
//
// Pour RÉTABLIR les vrais destinataires (clients + notifications internes),
// mettre REDIRECT_ALL_TO à "" (chaîne vide) :
//   const REDIRECT_ALL_TO = ""
const REDIRECT_ALL_TO = "govocali@gmail.com"

/** Destinataire effectif d'un courriel (redirigé pendant la phase de test). */
export function mailTo(realRecipient: string): string {
  return REDIRECT_ALL_TO || realRecipient
}
