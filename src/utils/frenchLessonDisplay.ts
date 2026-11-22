import { Lesson } from '../types/curriculum';

export function formatTrimesterFr(trimester?: string): string {
  switch (trimester) {
    case 'الثلاثي الأول':
      return '1er Trimestre';
    case 'الثلاثي الثاني':
      return '2e Trimestre';
    case 'الثلاثي الثالث':
      return '3e Trimestre';
    default:
      return trimester ?? '';
  }
}

const FRENCH_LESSON_DISPLAY_MAP: Record<string, { titleFr: string; subtitleFr: string }> = {
  // Core & Extra Curriculum Lessons
  'g3-french-articles': {
    titleFr: 'Les articles (un / une / le / la / les)',
    subtitleFr: 'Distinguer les articles indéfinis et définis au masculin, au féminin et au pluriel.',
  },
  'g3-french-presentation': {
    titleFr: 'Se présenter : Être, Avoir et Parler (3e année)',
    subtitleFr: 'Utiliser les verbes être, avoir et parler pour dire son prénom et son âge.',
  },
  'g3-french-salutations-famille': {
    titleFr: 'Les salutations, les nombres et la famille (3e année)',
    subtitleFr: 'Saluer poliment, compter et présenter les membres de sa famille.',
  },
  'g3-french-ecole-couleurs': {
    titleFr: 'Dans ma trousse : les couleurs et l’école (3e année)',
    subtitleFr: 'Nommer les fournitures scolaires et les couleurs avec les bons déterminants.',
  },
  'g3-french-t2-saisons': {
    titleFr: 'Les jours, les mois et les saisons (3e année)',
    subtitleFr: 'Nommer les jours de la semaine et les quatre saisons dans de courtes phrases.',
  },
  'g4-french-verbs': {
    titleFr: 'Les verbes du 1er groupe, Être et Avoir (4e année)',
    subtitleFr: 'Conjuguer les verbes en -er, être et avoir au présent de l’indicatif.',
  },
  'g4-french-articles-accord': {
    titleFr: 'Le genre, le nombre et les adjectifs (4e année)',
    subtitleFr: 'Accorder l’adjectif qualificatif avec le nom en genre et en nombre.',
  },
  'g4-french-verbes-2groupe-aller': {
    titleFr: 'Les verbes en -ir (finir) et aller / faire au présent (4e année)',
    subtitleFr: 'Conjuguer finir, choisir, aller et faire au présent dans des phrases simples.',
  },
  'g4-french-types-phrases': {
    titleFr: 'La phrase affirmative, négative et interrogative (4e année)',
    subtitleFr: 'Transformer une phrase affirmative en phrase négative (ne… pas) ou interrogative.',
  },
  'french-verbs': {
    titleFr: 'Les verbes au présent : 1er, 2e groupe & Être/Avoir (5e année)',
    subtitleFr: 'Maîtriser les terminaisons du présent pour les 1er et 2e groupes et les auxiliaires.',
  },
  'g5-french-futur-passe': {
    titleFr: 'Le futur simple et le passé composé (5e année)',
    subtitleFr: 'Situer une action dans le passé ou dans l’avenir avec les bons temps verbaux.',
  },
  'g5-french-determinants': {
    titleFr: 'Les déterminants possessifs et démonstratifs (5e année)',
    subtitleFr: 'Choisir avec précision entre mon/ton/son/notre/leur et ce/cet/cette/ces.',
  },
  'g5-french-complements-lecture': {
    titleFr: 'Les compléments du verbe (COD / COI) et la lecture (5e année)',
    subtitleFr: 'Repérer le COD et le COI dans la phrase et comprendre un texte court.',
  },
  'g6-french-verbs': {
    titleFr: 'Conjugaison, accord et production écrite (6e année)',
    subtitleFr: 'Accorder le verbe et l’adjectif et rédiger des phrases correctes pour le concours.',
  },
  'g6-french-imparfait-passe': {
    titleFr: 'L’imparfait et le passé composé dans le récit (6e année)',
    subtitleFr: 'Employer l’imparfait pour la description et le passé composé pour l’action soudaine.',
  },
  'g6-french-accord-participe': {
    titleFr: 'L’accord du participe passé et les pronoms (6e année)',
    subtitleFr: 'Accorder le participe passé avec être et éviter le piège avec avoir.',
  },
  'g6-french-production-ecrite': {
    titleFr: 'Connecteurs logiques et production écrite — Concours 6e',
    subtitleFr: 'Structurer un récit avec d’abord, ensuite et enfin pour le concours de 6e année.',
  },

  // Expansion French Lessons — Grade 3
  'g3-fr-greetings': {
    titleFr: 'Saluer et se présenter',
    subtitleFr: 'Apprendre les formules de politesse et présenter son nom et son âge.',
  },
  'g3-fr-classroom': {
    titleFr: 'En classe et les fournitures scolaires',
    subtitleFr: 'Nommer les objets du cartable et employer les articles un et une.',
  },
  'g3-fr-numbers-colors': {
    titleFr: 'Les nombres et les couleurs',
    subtitleFr: 'Compter de 1 à 20 et accorder les noms de couleurs.',
  },
  'g3-fr-family': {
    titleFr: 'Ma famille',
    subtitleFr: 'Nommer les membres de la famille et utiliser mon, ma, mes.',
  },
  'g3-fr-days-seasons': {
    titleFr: 'Les jours et les saisons',
    subtitleFr: 'Connaître les sept jours de la semaine et les quatre saisons.',
  },
  'g3-fr-animals': {
    titleFr: 'Les animaux domestiques et de la ferme',
    subtitleFr: 'Décrire les animaux familiers et former leur pluriel.',
  },
  'g3-fr-avoir-simple': {
    titleFr: 'Le verbe Avoir au présent',
    subtitleFr: 'Conjuguer avoir à toutes les personnes pour exprimer l’âge et la possession.',
  },
  'g3-fr-body-parts': {
    titleFr: 'Le corps humain et l’hygiène',
    subtitleFr: 'Nommer les parties du corps et parler de l’hygiène quotidienne.',
  },
  'g3-fr-house-rooms': {
    titleFr: 'La maison et les pièces',
    subtitleFr: 'Identifier les pièces de la maison et le mobilier principal.',
  },

  // Expansion French Lessons — Grade 4
  'g4-fr-etre-avoir': {
    titleFr: 'Distinguer Être et Avoir',
    subtitleFr: 'Choisir avec précision entre être (état/lieu) et avoir (âge/possession).',
  },
  'g4-fr-plural-nouns': {
    titleFr: 'Le pluriel des noms',
    subtitleFr: 'Former le pluriel des noms en -s, -x et -aux avec des ou les.',
  },
  'g4-fr-adjectives': {
    titleFr: 'L’accord de l’adjectif',
    subtitleFr: 'Accorder l’adjectif qualificatif au masculin et au féminin.',
  },
  'g4-fr-aller-present': {
    titleFr: 'Le verbe Aller au présent',
    subtitleFr: 'Conjuguer aller au présent et indiquer une direction ou un lieu.',
  },
  'g4-fr-negation-simple': {
    titleFr: 'La phrase négative (ne… pas)',
    subtitleFr: 'Construire une phrase négative avec ne… pas ou n’… pas.',
  },
  'g4-fr-meals-food': {
    titleFr: 'Les repas et les aliments sains',
    subtitleFr: 'Parler des repas de la journée et d’une alimentation équilibrée.',
  },
  'g4-fr-possessives': {
    titleFr: 'Les adjectifs possessifs',
    subtitleFr: 'Exprimer l’appartenance avec mon, ton, son, ma, ta, sa, mes, tes, ses.',
  },
  'g4-fr-hobbies': {
    titleFr: 'Les loisirs et le sport',
    subtitleFr: 'Exprimer ses activités favorites avec les verbes du 1er groupe.',
  },
  'g4-fr-faire-present': {
    titleFr: 'Le verbe Faire au présent',
    subtitleFr: 'Conjuguer faire au présent pour parler du sport, des devoirs et de la météo.',
  },

  // Expansion French Lessons — Grade 5
  'g5-fr-second-group': {
    titleFr: 'Les verbes du 2e groupe (-ir / -issons)',
    subtitleFr: 'Conjuguer finir, choisir, réussir et grandir au présent.',
  },
  'g5-fr-futur-simple': {
    titleFr: 'Le futur simple',
    subtitleFr: 'Parler de projets futurs avec l’infinitif + -ai, -as, -a, -ons, -ez, -ont.',
  },
  'g5-fr-sentence-types': {
    titleFr: 'Les quatre types de phrases',
    subtitleFr: 'Reconnaître les phrases déclarative, interrogative, exclamative et impérative.',
  },
  'g5-fr-prepositions': {
    titleFr: 'Les prépositions de lieu et de temps',
    subtitleFr: 'Situer dans l’espace et le temps avec dans, sur, sous, devant et chez.',
  },
  'g5-fr-demonstratives': {
    titleFr: 'Les déterminants démonstratifs (ce, cet, cette, ces)',
    subtitleFr: 'Choisir le bon démonstratif devant un nom masculin, féminin ou pluriel.',
  },
  'g5-fr-imperative': {
    titleFr: 'L’impératif présent',
    subtitleFr: 'Donner des conseils pour la santé et la nature sans sujet exprimé.',
  },
  'g5-fr-environment': {
    titleFr: 'Protéger l’environnement',
    subtitleFr: 'Enrichir son vocabulaire sur la forêt, l’eau, le reboisement et le tri.',
  },
  'g5-fr-jobs': {
    titleFr: 'Les métiers dans la société',
    subtitleFr: 'Nommer les professions courantes et décrire leur rôle utile.',
  },
  'g5-fr-reading-dialogue': {
    titleFr: 'Lire et comprendre un dialogue',
    subtitleFr: 'Repérer les interlocuteurs, la ponctuation du dialogue et les idées clés.',
  },

  // Expansion French Lessons — Grade 6
  'g6-fr-passe-compose': {
    titleFr: 'Le passé composé avec avoir et être',
    subtitleFr: 'Construire le passé composé et appliquer l’accord avec l’auxiliaire être.',
  },
  'g6-fr-imparfait': {
    titleFr: 'L’imparfait de description et d’habitude',
    subtitleFr: 'Employer les terminaisons -ais, -ais, -ait, -ions, -iez, -aient dans le récit.',
  },
  'g6-fr-pronoms-cod': {
    titleFr: 'Les pronoms personnels COD (le, la, les, l’)',
    subtitleFr: 'Éviter les répétitions dans la rédaction grâce aux pronoms COD.',
  },
  'g6-fr-cod-coi': {
    titleFr: 'Distinguer COD et COI',
    subtitleFr: 'Reconnaître le complément direct et le complément indirect introduit par à ou de.',
  },
  'g6-fr-homophones': {
    titleFr: 'Les homophones grammaticaux',
    subtitleFr: 'Distinguer a/à, et/est, on/ont et son/sont grâce aux astuces de remplacement.',
  },
  'g6-fr-cause-consequence': {
    titleFr: 'Exprimer la cause et la conséquence',
    subtitleFr: 'Relier ses idées logiquement avec car, parce que et donc.',
  },
  'g6-fr-travel-tunisia': {
    titleFr: 'Voyager et découvrir la Tunisie',
    subtitleFr: 'Raconter une visite culturelle à Carthage, Kairouan, Tozeur ou Tabarka.',
  },
  'g6-fr-technology-health': {
    titleFr: 'Technologie, sport et santé',
    subtitleFr: 'Présenter les atouts de la lecture et un usage équilibré des écrans.',
  },
  'g6-fr-production-ecrite': {
    titleFr: 'Rédiger un récit complet (Concours 6e)',
    subtitleFr: 'Structurer un texte narratif du début à la situation finale sans fautes.',
  },

  // Remedial / Parcours guidés
  'g3-rem-fr-hello': {
    titleFr: 'Parcours guidé : Salutations et fournitures',
    subtitleFr: 'Écouter et prononcer les mots essentiels de la classe sans hésitation.',
  },
  'g3-rem-fr-colors': {
    titleFr: 'Parcours guidé : Couleurs et nombres (1 à 20)',
    subtitleFr: 'Réviser les couleurs et les nombres avec prononciation guidée.',
  },
  'g3-rem-fr-family': {
    titleFr: 'Parcours guidé : Ma famille et la maison',
    subtitleFr: 'Construire de courtes phrases sur sa famille et son foyer.',
  },
  'g3-rem-fr-diag': {
    titleFr: 'Bilan progressif : Phrases de base (3e année)',
    subtitleFr: 'Révision courte avec indices pour consolider les acquis de 3e année.',
  },
  'g4-rem-fr-etre-avoir': {
    titleFr: 'Parcours guidé : Être et Avoir pas à pas',
    subtitleFr: 'Maîtriser les structures Je suis et J’ai dans des exercices guidés.',
  },
  'g4-rem-fr-days': {
    titleFr: 'Parcours guidé : Jours de la semaine et météo',
    subtitleFr: 'Parler des jours et du temps qu’il fait en phrases simples.',
  },
  'g4-rem-fr-diag': {
    titleFr: 'Bilan progressif : Révision de 4e année',
    subtitleFr: 'Questions ciblées sur les verbes, le pluriel et les déterminants.',
  },
  'g4-rem-fr-vocab': {
    titleFr: 'Parcours guidé : Animaux et nature',
    subtitleFr: 'Vocabulaire essentiel pour décrire les animaux et l’environnement.',
  },
  'g5-rem-fr-past': {
    titleFr: 'Parcours guidé : Présent et passé composé',
    subtitleFr: 'Raconter un fait passé avec l’auxiliaire avoir en deux étapes.',
  },
  'g5-rem-fr-future': {
    titleFr: 'Parcours guidé : Le futur proche',
    subtitleFr: 'Exprimer un projet proche avec la structure « Je vais + infinitif ».',
  },
  'g5-rem-fr-diag': {
    titleFr: 'Bilan progressif : Lecture et expression (5e année)',
    subtitleFr: 'Entraînement guidé avec aide audio et correction immédiate.',
  },
  'g6-rem-fr-sixieme': {
    titleFr: 'Parcours guidé : Réussir le récit court (6e année)',
    subtitleFr: 'Méthode en 4 étapes pour rédiger 6 phrases cohérentes sans erreur.',
  },
  'g6-rem-fr-connect': {
    titleFr: 'Parcours guidé : Cause et conséquence',
    subtitleFr: 'Enchaîner ses phrases avec parce que, car et donc.',
  },
  'g6-rem-fr-diag': {
    titleFr: 'Bilan progressif : Entraînement concours (6e année)',
    subtitleFr: 'Simulation douce de compréhension, conjugaison et production écrite.',
  },
};

export function getFrenchLessonDisplay(lesson: Lesson): {
  titleFr: string;
  subtitleFr: string;
} {
  const mapped = FRENCH_LESSON_DISPLAY_MAP[lesson.id];
  if (mapped) return mapped;

  const parenMatch = lesson.title.match(/\(([^)]+)\)/);
  const cleanTitle = !/[\u0600-\u06FF]/.test(lesson.title)
    ? lesson.title
    : parenMatch && !/[\u0600-\u06FF]/.test(parenMatch[1])
    ? parenMatch[1]
    : `Leçon de français · ${lesson.grade}e année`;

  const cleanSubtitle = !/[\u0600-\u06FF]/.test(lesson.subtitle)
    ? lesson.subtitle
    : `Activités interactives et exercices guidés — ${formatTrimesterFr(lesson.trimester)}.`;

  return { titleFr: cleanTitle, subtitleFr: cleanSubtitle };
}
