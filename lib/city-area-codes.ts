// Table ville → indicatif régional (Canada). Sert au repli quand une recherche
// par ville (InLocality) ne renvoie aucun numéro chez Twilio.
export const CITY_AREA_CODES: Record<string, number> = {
  // Québec
  "montréal": 514, "montreal": 514, "mont-réal": 514,
  "laval": 450, "longueuil": 450, "brossard": 450, "repentigny": 450,
  "terrebonne": 450, "blainville": 450, "mirabel": 450, "mascouche": 450,
  "saint-jérôme": 450, "saint-jerome": 450, "granby": 450,
  "saint-hyacinthe": 450, "sorel-tracy": 450, "vaudreuil-dorion": 450,
  "québec": 418, "quebec": 418, "saguenay": 418, "lévis": 418, "levis": 418,
  "chicoutimi": 418, "jonquière": 418, "jonquiere": 418,
  "gatineau": 819, "sherbrooke": 819, "trois-rivières": 819,
  "trois-rivieres": 819, "drummondville": 819, "shawinigan": 819,
  "rouyn-noranda": 819, "val-d'or": 819, "victoriaville": 819,
  // Ontario
  "toronto": 416, "north york": 416, "etobicoke": 416, "scarborough": 416,
  "mississauga": 905, "brampton": 905, "hamilton": 905, "oakville": 905,
  "markham": 905, "vaughan": 905, "richmond hill": 905, "oshawa": 905,
  "ajax": 905, "pickering": 905, "whitby": 905, "barrie": 705,
  "ottawa": 613, "kingston": 613, "cornwall": 613,
  "london": 519, "windsor": 519, "kitchener": 519, "waterloo": 519,
  "cambridge": 519, "guelph": 519, "brantford": 519,
  "sudbury": 705, "thunder bay": 807,
  // Colombie-Britannique
  "vancouver": 604, "surrey": 604, "burnaby": 604, "richmond": 604,
  "delta": 604, "langley": 604, "coquitlam": 604, "abbotsford": 604,
  "victoria": 250, "kelowna": 250, "kamloops": 250, "nanaimo": 250,
  // Alberta
  "calgary": 403, "lethbridge": 403, "medicine hat": 403, "red deer": 403,
  "edmonton": 780, "fort mcmurray": 780, "grande prairie": 780,
  // Autres
  "winnipeg": 204, "regina": 306, "saskatoon": 306, "halifax": 902,
  "moncton": 506, "fredericton": 506, "saint john": 506,
}

export function getAreaCode(city: string): number | undefined {
  return CITY_AREA_CODES[city.toLowerCase().trim()]
}
