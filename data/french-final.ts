import type { Question } from './types';

const NUMBERS_SMALL = ['vingt-neuf', 'quarante-cinq', 'cinquante-deux', 'soixante-trois', 'soixante-dix-huit', 'quatre-vingt-sept'];
const NUMBERS_HUNDREDS = ['cent quarante-cinq', 'deux cent soixante-trois', 'trois cent soixante-quatorze', 'cinq cent quatre-vingt-un', 'sept cent trente-six', 'huit cent quatre-vingt-douze'];
const NUMBERS_THOUSANDS = ['deux mille quatre cent cinquante', 'huit mille cent trente-sept', 'deux mille cent trente-sept', 'huit mille quatre cent cinquante'];
const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DEF_ARTICLES = ['le', 'la', 'les', "l'"];
const INDEF_ARTICLES = ['un', 'une', 'des'];
const VERB_DEFS = ['To speak', 'To have', 'To be', 'To be able to', 'To do', 'To prefer', 'To want'];
const PARLER = ['parle', 'parles', 'parlons', 'parlez', 'parlent'];
const AVOIR = ['ai', 'as', 'a', 'avons', 'avez', 'ont'];
const ETRE = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'];
const POUVOIR = ['peux', 'peut', 'pouvons', 'pouvez', 'peuvent'];
const FAIRE = ['fais', 'fait', 'faisons', 'faites', 'font'];
const PREFERER = ['préfère', 'préfères', 'préférons', 'préférez', 'préfèrent'];
const VOULOIR = ['veux', 'veut', 'voulons', 'voulez', 'veulent'];
const GREETINGS = ['Pour saluer', 'Prendre congé'];
const CATEGORIES = ['Numéro de téléphone', 'Ville', 'Prénom', 'Pays', 'E-mail', 'Nom', 'Langues parlées', 'Nationalité', 'Adresse'];
const MASC_PROFESSIONS = ['acteur', 'chanteur', 'coiffeur', 'danseur', 'écrivain', 'musicien', 'journaliste'];
const FEM_PROFESSIONS = ['actrice', 'chanteuse', 'coiffeuse', 'danseuse', 'écrivaine', 'musicienne', 'journaliste'];
const FAMILY = ['mon oncle', 'enfants', 'grands-parents', 'cousins', 'ma mère', 'frère', 'ta tante', 'parents', 'cousine', 'cousin', 'grand-mère', 'grand-père'];
const MON_MA_MES = ['Mon', 'Ma', 'Mes'];
const SON_SA_SES = ['Son', 'Sa', 'Ses'];
const VOTRE_VOS = ['Votre', 'Vos'];
const NOTRE_NOS = ['Notre', 'Nos'];
const LEUR_LEURS = ['Leur', 'Leurs'];
const TON_TA_TES = ['Ton', 'Ta', 'Tes'];

export const frenchFinalQuestions: Question[] = [
  // ── Section 1 — Write the Number in French ──────────────────────
  { cat: 'Numbers', question: 'Write 29 in French', answer: 'vingt-neuf', choices: NUMBERS_SMALL },
  { cat: 'Numbers', question: 'Write 45 in French', answer: 'quarante-cinq', choices: NUMBERS_SMALL },
  { cat: 'Numbers', question: 'Write 52 in French', answer: 'cinquante-deux', choices: NUMBERS_SMALL },
  { cat: 'Numbers', question: 'Write 63 in French', answer: 'soixante-trois', choices: NUMBERS_SMALL },
  { cat: 'Numbers', question: 'Write 78 in French', answer: 'soixante-dix-huit', choices: NUMBERS_SMALL },
  { cat: 'Numbers', question: 'Write 87 in French', answer: 'quatre-vingt-sept', choices: NUMBERS_SMALL },
  { cat: 'Numbers', question: 'Write 145 in French', answer: 'cent quarante-cinq', choices: NUMBERS_HUNDREDS },
  { cat: 'Numbers', question: 'Write 263 in French', answer: 'deux cent soixante-trois', choices: NUMBERS_HUNDREDS },
  { cat: 'Numbers', question: 'Write 374 in French', answer: 'trois cent soixante-quatorze', choices: NUMBERS_HUNDREDS },
  { cat: 'Numbers', question: 'Write 581 in French', answer: 'cinq cent quatre-vingt-un', choices: NUMBERS_HUNDREDS },
  { cat: 'Numbers', question: 'Write 736 in French', answer: 'sept cent trente-six', choices: NUMBERS_HUNDREDS },
  { cat: 'Numbers', question: 'Write 892 in French', answer: 'huit cent quatre-vingt-douze', choices: NUMBERS_HUNDREDS },
  { cat: 'Numbers', question: 'Write 2,450 in French', answer: 'deux mille quatre cent cinquante', choices: NUMBERS_THOUSANDS },
  { cat: 'Numbers', question: 'Write 8,137 in French', answer: 'huit mille cent trente-sept', choices: NUMBERS_THOUSANDS },

  // ── Section 2 — Days of the Week ────────────────────────────────
  { cat: 'Days of the Week', question: 'A day of the week in French is called:', answer: 'un jour de la semaine', choices: ['un jour de la semaine', "un mois de l'année", 'une saison', 'une heure'] },
  { cat: 'Days of the Week', question: 'Write Sunday in French', answer: 'dimanche', choices: DAYS },
  { cat: 'Days of the Week', question: 'Write Monday in French', answer: 'lundi', choices: DAYS },
  { cat: 'Days of the Week', question: 'Write Tuesday in French', answer: 'mardi', choices: DAYS },
  { cat: 'Days of the Week', question: 'Write Wednesday in French', answer: 'mercredi', choices: DAYS },
  { cat: 'Days of the Week', question: 'Write Thursday in French', answer: 'jeudi', choices: DAYS },
  { cat: 'Days of the Week', question: 'Write Friday in French', answer: 'vendredi', choices: DAYS },
  { cat: 'Days of the Week', question: 'Write Saturday in French', answer: 'samedi', choices: DAYS },

  // ── Section 3 — Months of the Year ──────────────────────────────
  { cat: 'Months', question: 'A month of the year in French is called:', answer: "un mois de l'année", choices: ["un mois de l'année", 'un jour de la semaine', 'une saison', 'une heure'] },
  { cat: 'Months', question: 'Write January in French', answer: 'janvier', choices: MONTHS },
  { cat: 'Months', question: 'Write February in French', answer: 'février', choices: MONTHS },
  { cat: 'Months', question: 'Write March in French', answer: 'mars', choices: MONTHS },
  { cat: 'Months', question: 'Write April in French', answer: 'avril', choices: MONTHS },
  { cat: 'Months', question: 'Write May in French', answer: 'mai', choices: MONTHS },
  { cat: 'Months', question: 'Write June in French', answer: 'juin', choices: MONTHS },
  { cat: 'Months', question: 'Write July in French', answer: 'juillet', choices: MONTHS },
  { cat: 'Months', question: 'Write August in French', answer: 'août', choices: MONTHS },
  { cat: 'Months', question: 'Write September in French', answer: 'septembre', choices: MONTHS },
  { cat: 'Months', question: 'Write October in French', answer: 'octobre', choices: MONTHS },
  { cat: 'Months', question: 'Write November in French', answer: 'novembre', choices: MONTHS },
  { cat: 'Months', question: 'Write December in French', answer: 'décembre', choices: MONTHS },

  // ── Section 4 — Definite Articles (le, la, les, l') ─────────────
  { cat: 'Definite Articles', question: '__________ nom', answer: 'le', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ numéro de téléphone', answer: 'le', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ classes', answer: 'les', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ tableau', answer: 'le', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ nationalité', answer: 'la', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ prénoms', answer: 'les', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ crayon', answer: 'le', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ semaine', answer: 'la', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ âge', answer: "l'", choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ adresse', answer: "l'", choices: DEF_ARTICLES },

  // ── Section 5 — Indefinite Articles (un, une, des) ──────────────
  { cat: 'Indefinite Articles', question: '__________ crayon', answer: 'un', choices: INDEF_ARTICLES },
  { cat: 'Indefinite Articles', question: '__________ semaine', answer: 'une', choices: INDEF_ARTICLES },
  { cat: 'Indefinite Articles', question: '__________ âge', answer: 'un', choices: INDEF_ARTICLES },
  { cat: 'Indefinite Articles', question: '__________ e-mail', answer: 'un', choices: INDEF_ARTICLES },

  // ── Section 6 — Conjugation: Parler, Avoir, Être ────────────────
  { cat: 'Verb Definitions', question: "What does 'Parler' mean?", answer: 'To speak', choices: VERB_DEFS },
  { cat: 'Conjugation: Parler', question: 'Je + Parler =', answer: 'parle', choices: PARLER },
  { cat: 'Conjugation: Parler', question: 'Tu + Parler =', answer: 'parles', choices: PARLER },
  { cat: 'Conjugation: Parler', question: 'Il / Elle / On + Parler =', answer: 'parle', choices: PARLER },
  { cat: 'Conjugation: Parler', question: 'Nous + Parler =', answer: 'parlons', choices: PARLER },
  { cat: 'Conjugation: Parler', question: 'Vous + Parler =', answer: 'parlez', choices: PARLER },
  { cat: 'Conjugation: Parler', question: 'Ils / Elles + Parler =', answer: 'parlent', choices: PARLER },

  { cat: 'Verb Definitions', question: "What does 'Avoir' mean?", answer: 'To have', choices: VERB_DEFS },
  { cat: 'Conjugation: Avoir', question: 'Je + Avoir =', answer: 'ai', choices: AVOIR },
  { cat: 'Conjugation: Avoir', question: 'Tu + Avoir =', answer: 'as', choices: AVOIR },
  { cat: 'Conjugation: Avoir', question: 'Il / Elle / On + Avoir =', answer: 'a', choices: AVOIR },
  { cat: 'Conjugation: Avoir', question: 'Nous + Avoir =', answer: 'avons', choices: AVOIR },
  { cat: 'Conjugation: Avoir', question: 'Vous + Avoir =', answer: 'avez', choices: AVOIR },
  { cat: 'Conjugation: Avoir', question: 'Ils / Elles + Avoir =', answer: 'ont', choices: AVOIR },

  { cat: 'Verb Definitions', question: "What does 'Être' mean?", answer: 'To be', choices: VERB_DEFS },
  { cat: 'Conjugation: Être', question: 'Je + Être =', answer: 'suis', choices: ETRE },
  { cat: 'Conjugation: Être', question: 'Tu + Être =', answer: 'es', choices: ETRE },
  { cat: 'Conjugation: Être', question: 'Il / Elle / On + Être =', answer: 'est', choices: ETRE },
  { cat: 'Conjugation: Être', question: 'Nous + Être =', answer: 'sommes', choices: ETRE },
  { cat: 'Conjugation: Être', question: 'Vous + Être =', answer: 'êtes', choices: ETRE },
  { cat: 'Conjugation: Être', question: 'Ils / Elles + Être =', answer: 'sont', choices: ETRE },

  // ── Section 7 — Adjective Agreement ─────────────────────────────
  { cat: 'Adjective Agreement', question: 'Elle est __________', answer: 'blonde', choices: ['blond', 'blonde'] },
  { cat: 'Adjective Agreement', question: 'Il est __________', answer: 'acteur', choices: ['acteur', 'actrice'] },
  { cat: 'Adjective Agreement', question: 'Lila est __________', answer: 'polonaise', choices: ['polonaise', 'polonais'] },
  { cat: 'Adjective Agreement', question: 'Elles sont __________', answer: 'espagnoles', choices: ['espagnole', 'espagnoles'] },
  { cat: 'Adjective Agreement', question: 'Timothée et Marc sont __________', answer: 'bruns', choices: ['brun', 'bruns'] },
  { cat: 'Adjective Agreement', question: 'Ils sont __________', answer: 'grands', choices: ['grande', 'grands'] },
  { cat: 'Adjective Agreement', question: 'Elle est __________', answer: 'chinoise', choices: ['chinois', 'chinoise'] },
  { cat: 'Adjective Agreement', question: 'Il est __________', answer: 'brésilien', choices: ['brésilien', 'brésilienne'] },
  { cat: 'Adjective Agreement', question: 'Elle est __________', answer: 'marocaine', choices: ['marocain', 'marocaine'] },
  { cat: 'Adjective Agreement', question: 'Guy est __________', answer: 'français', choices: ['français', 'française'] },

  // ── Section 8 — Possessive Adjectives ───────────────────────────
  { cat: 'Possessive Adjectives', question: "__________ pays, c'est le Ghana", answer: 'Mon', choices: MON_MA_MES },
  { cat: 'Possessive Adjectives', question: "__________ ville d'origine, c'est Accra", answer: 'Ma', choices: MON_MA_MES },
  { cat: 'Possessive Adjectives', question: '__________ père parle anglais', answer: 'Son', choices: SON_SA_SES },
  { cat: 'Possessive Adjectives', question: '__________ mère parle japonais', answer: 'Sa', choices: SON_SA_SES },
  { cat: 'Possessive Adjectives', question: '__________ grands-parents parlent japonais', answer: 'Ses', choices: SON_SA_SES },
  { cat: 'Possessive Adjectives', question: 'Écrivez __________ nom', answer: 'Votre', choices: VOTRE_VOS },
  { cat: 'Possessive Adjectives', question: 'Écrivez __________ prénom', answer: 'Votre', choices: VOTRE_VOS },
  { cat: 'Possessive Adjectives', question: "L'âge de __________ enfants", answer: 'Vos', choices: VOTRE_VOS },
  { cat: 'Possessive Adjectives', question: '__________ trois enfants sont artistes', answer: 'Nos', choices: NOTRE_NOS },
  { cat: 'Possessive Adjectives', question: '__________ fille est réalisatrice', answer: 'Notre', choices: NOTRE_NOS },
  { cat: 'Possessive Adjectives', question: '__________ fils sont chanteurs', answer: 'Nos', choices: NOTRE_NOS },
  { cat: 'Possessive Adjectives', question: 'Louise et Luc Pierret sont avec __________ fils Carl', answer: 'Leur', choices: LEUR_LEURS },
  { cat: 'Possessive Adjectives', question: '...et __________ filles Clara et Léa', answer: 'Leurs', choices: LEUR_LEURS },
  { cat: 'Possessive Adjectives', question: "Lucien, c'est __________ grand-père", answer: 'Ton', choices: TON_TA_TES },

  // ── Section 9 — Pour saluer ou prendre congé? ───────────────────
  { cat: 'Salutations', question: 'Au revoir, madame !', answer: 'Prendre congé', choices: GREETINGS },
  { cat: 'Salutations', question: 'Ça va ?', answer: 'Pour saluer', choices: GREETINGS },
  { cat: 'Salutations', question: 'Bonsoir monsieur ! Vous allez bien ?', answer: 'Pour saluer', choices: GREETINGS },
  { cat: 'Salutations', question: 'Bonne journée, madame !', answer: 'Prendre congé', choices: GREETINGS },
  { cat: 'Salutations', question: 'Ça va ! Et toi ?', answer: 'Pour saluer', choices: GREETINGS },
  { cat: 'Salutations', question: 'Salut ! Ça va ?', answer: 'Pour saluer', choices: GREETINGS },
  { cat: 'Salutations', question: 'Passez une bonne journée !', answer: 'Prendre congé', choices: GREETINGS },
  { cat: 'Salutations', question: 'Bonsoir ! Comment allez-vous ?', answer: 'Pour saluer', choices: GREETINGS },

  // ── Section 10 — Match to the Correct Category ──────────────────
  { cat: 'Categories', question: '06 41 65 28 12', answer: 'Numéro de téléphone', choices: CATEGORIES },
  { cat: 'Categories', question: 'Paris', answer: 'Ville', choices: CATEGORIES },
  { cat: 'Categories', question: 'Amélie', answer: 'Prénom', choices: CATEGORIES },
  { cat: 'Categories', question: 'France', answer: 'Pays', choices: CATEGORIES },
  { cat: 'Categories', question: 'amelieprice@gmail.com', answer: 'E-mail', choices: CATEGORIES },
  { cat: 'Categories', question: 'Dupont', answer: 'Nom', choices: CATEGORIES },
  { cat: 'Categories', question: 'Français et anglais', answer: 'Langues parlées', choices: CATEGORIES },
  { cat: 'Categories', question: 'Française', answer: 'Nationalité', choices: CATEGORIES },
  { cat: 'Categories', question: '12 rue de la Tour', answer: 'Adresse', choices: CATEGORIES },

  // ── Section 11 — Professions (Masculine & Feminine) ─────────────
  { cat: 'Professions (Masc.)', question: 'Write the masculine French form of Actor', answer: 'acteur', choices: MASC_PROFESSIONS },
  { cat: 'Professions (Fem.)', question: 'Write the feminine French form of Actor', answer: 'actrice', choices: FEM_PROFESSIONS },
  { cat: 'Professions (Masc.)', question: 'Write the masculine French form of Singer', answer: 'chanteur', choices: MASC_PROFESSIONS },
  { cat: 'Professions (Fem.)', question: 'Write the feminine French form of Singer', answer: 'chanteuse', choices: FEM_PROFESSIONS },
  { cat: 'Professions (Masc.)', question: 'Write the masculine French form of Hairdresser', answer: 'coiffeur', choices: MASC_PROFESSIONS },
  { cat: 'Professions (Fem.)', question: 'Write the feminine French form of Hairdresser', answer: 'coiffeuse', choices: FEM_PROFESSIONS },
  { cat: 'Professions (Masc.)', question: 'Write the masculine French form of Dancer', answer: 'danseur', choices: MASC_PROFESSIONS },
  { cat: 'Professions (Fem.)', question: 'Write the feminine French form of Dancer', answer: 'danseuse', choices: FEM_PROFESSIONS },
  { cat: 'Professions (Masc.)', question: 'Write the masculine French form of Writer', answer: 'écrivain', choices: MASC_PROFESSIONS },
  { cat: 'Professions (Fem.)', question: 'Write the feminine French form of Writer', answer: 'écrivaine', choices: FEM_PROFESSIONS },
  { cat: 'Professions (Masc.)', question: 'Write the masculine French form of Musician', answer: 'musicien', choices: MASC_PROFESSIONS },
  { cat: 'Professions (Fem.)', question: 'Write the feminine French form of Musician', answer: 'musicienne', choices: FEM_PROFESSIONS },
  { cat: 'Professions (Masc.)', question: 'Write the masculine French form of Journalist', answer: 'journaliste', choices: MASC_PROFESSIONS },
  { cat: 'Professions (Fem.)', question: 'Write the feminine French form of Journalist', answer: 'journaliste', choices: FEM_PROFESSIONS },

  // ── Section 12 — Family Members ─────────────────────────────────
  { cat: 'Family', question: "C'est le frère de ma mère. C'est…", answer: 'mon oncle', choices: FAMILY },
  { cat: 'Family', question: "Natalia a une fille, Léa, et un garçon, Théo. Ce sont ses…", answer: 'enfants', choices: FAMILY },
  { cat: 'Family', question: "Ce sont les parents de ma mère. Ce sont mes…", answer: 'grands-parents', choices: FAMILY },
  { cat: 'Family', question: "Mon oncle a une fille et un garçon. Ce sont mes…", answer: 'cousins', choices: FAMILY },
  { cat: 'Family', question: "Je l'appelle « Maman ». C'est…", answer: 'ma mère', choices: FAMILY },
  { cat: 'Family', question: "Emma et Léo sont sa sœur et son…", answer: 'frère', choices: FAMILY },
  { cat: 'Family', question: "C'est la sœur de ton père. C'est…", answer: 'ta tante', choices: FAMILY },
  { cat: 'Family', question: "Ce sont la mère et le père de Moussa ? Oui, ce sont ses…", answer: 'parents', choices: FAMILY },
  { cat: 'Family', question: "C'est la fille de ma tante. C'est ma…", answer: 'cousine', choices: FAMILY },
  { cat: 'Family', question: "C'est le fils de ton oncle. C'est ton…", answer: 'cousin', choices: FAMILY },
  { cat: 'Family', question: "C'est la mère de sa mère. C'est sa…", answer: 'grand-mère', choices: FAMILY },
  { cat: 'Family', question: "C'est le père de leur père. C'est leur…", answer: 'grand-père', choices: FAMILY },

  // ── Section 13 — Definite Articles (le, la, les, l') ────────────
  { cat: 'Definite Articles', question: '__________ pantalon', answer: 'le', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ amie', answer: "l'", choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ lunettes', answer: 'les', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ chanson', answer: 'la', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ chemise', answer: 'la', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ oncles', answer: 'les', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ sac', answer: 'le', choices: DEF_ARTICLES },
  { cat: 'Definite Articles', question: '__________ coiffeur', answer: 'le', choices: DEF_ARTICLES },

  // ── Section 14 — Possessive Adjectives (continued) ──────────────
  { cat: 'Possessive Adjectives', question: '__________ lunettes', answer: 'Vos', choices: VOTRE_VOS },
  { cat: 'Possessive Adjectives', question: '__________ fils', answer: 'Ton', choices: TON_TA_TES },
  { cat: 'Possessive Adjectives', question: '__________ chien', answer: 'Mon', choices: MON_MA_MES },
  { cat: 'Possessive Adjectives', question: '__________ deux chats', answer: 'Leurs', choices: LEUR_LEURS },
  { cat: 'Possessive Adjectives', question: '__________ invité', answer: 'Notre', choices: NOTRE_NOS },
  { cat: 'Possessive Adjectives', question: '__________ chemise', answer: 'Sa', choices: SON_SA_SES },

  // ── Section 15 — Adjective Agreement (with English hints) ───────
  { cat: 'Adjective Agreement', question: 'Il est __________ (tall)', answer: 'grand', choices: ['grand', 'grande'] },
  { cat: 'Adjective Agreement', question: 'Elle a les cheveux __________ (short)', answer: 'courts', choices: ['court', 'courts'] },
  { cat: 'Adjective Agreement', question: 'Sarah est __________ (blonde)', answer: 'blonde', choices: ['blond', 'blonde'] },
  { cat: 'Adjective Agreement', question: 'Charles est __________ (athletic)', answer: 'sportif', choices: ['sportif', 'sportive'] },
  { cat: 'Adjective Agreement', question: 'Marc et Lucie sont __________ (nice)', answer: 'sympas', choices: ['sympa', 'sympas'] },
  { cat: 'Adjective Agreement', question: 'Elles sont __________ (beautiful)', answer: 'belles', choices: ['beau', 'belles'] },

  // ── Section 16 — Negative Form ──────────────────────────────────
  { cat: 'Negative Form', question: "Write the negative: Il aime courir.", answer: "Il n'aime pas courir.", choices: ["Il n'aime pas courir.", "Il ne aime pas courir.", "Il n'aime courir pas.", "Il aime pas courir."] },
  { cat: 'Negative Form', question: "Write the negative: J'aime la pizza.", answer: "Je n'aime pas la pizza.", choices: ["Je n'aime pas la pizza.", "Je ne aime pas la pizza.", "Je n'aime la pizza pas.", "J'aime pas la pizza."] },
  { cat: 'Negative Form', question: "Write the negative: Elles aiment le foot.", answer: "Elles n'aiment pas le foot.", choices: ["Elles n'aiment pas le foot.", "Elles ne aiment pas le foot.", "Elles n'aiment le foot pas.", "Elles aiment pas le foot."] },
  { cat: 'Negative Form', question: 'Write the negative: Nous parlons français.', answer: 'Nous ne parlons pas français.', choices: ['Nous ne parlons pas français.', 'Nous ne parlons français pas.', "Nous n'parlons pas français.", 'Nous parlons pas français.'] },
  { cat: 'Negative Form', question: 'Write the negative: Vous préférez lire.', answer: 'Vous ne préférez pas lire.', choices: ['Vous ne préférez pas lire.', 'Vous ne préférez lire pas.', "Vous n'préférez pas lire.", 'Vous préférez pas lire.'] },
  { cat: 'Negative Form', question: "Write the negative: Il est sportif.", answer: "Il n'est pas sportif.", choices: ["Il n'est pas sportif.", "Il ne est pas sportif.", "Il n'est sportif pas.", "Il est pas sportif."] },
  { cat: 'Negative Form', question: 'Write the negative: Tu danses bien !', answer: 'Tu ne danses pas bien !', choices: ['Tu ne danses pas bien !', 'Tu ne danses bien pas !', "Tu n'danses pas bien !", 'Tu danses pas bien !'] },
  { cat: 'Negative Form', question: 'Write the negative: Je suis italienne.', answer: 'Je ne suis pas italienne.', choices: ['Je ne suis pas italienne.', 'Je ne suis italienne pas.', "Je n'suis pas italienne.", 'Je suis pas italienne.'] },

  // ── Section 17 — Conjugation: Pouvoir, Faire, Préférer, Vouloir ─
  { cat: 'Verb Definitions', question: "What does 'Pouvoir' mean?", answer: 'To be able to', choices: VERB_DEFS },
  { cat: 'Conjugation: Pouvoir', question: 'Je + Pouvoir =', answer: 'peux', choices: POUVOIR },
  { cat: 'Conjugation: Pouvoir', question: 'Tu + Pouvoir =', answer: 'peux', choices: POUVOIR },
  { cat: 'Conjugation: Pouvoir', question: 'Il / Elle / On + Pouvoir =', answer: 'peut', choices: POUVOIR },
  { cat: 'Conjugation: Pouvoir', question: 'Nous + Pouvoir =', answer: 'pouvons', choices: POUVOIR },
  { cat: 'Conjugation: Pouvoir', question: 'Vous + Pouvoir =', answer: 'pouvez', choices: POUVOIR },
  { cat: 'Conjugation: Pouvoir', question: 'Ils / Elles + Pouvoir =', answer: 'peuvent', choices: POUVOIR },

  { cat: 'Verb Definitions', question: "What does 'Faire' mean?", answer: 'To do', choices: VERB_DEFS },
  { cat: 'Conjugation: Faire', question: 'Je + Faire =', answer: 'fais', choices: FAIRE },
  { cat: 'Conjugation: Faire', question: 'Tu + Faire =', answer: 'fais', choices: FAIRE },
  { cat: 'Conjugation: Faire', question: 'Il / Elle / On + Faire =', answer: 'fait', choices: FAIRE },
  { cat: 'Conjugation: Faire', question: 'Nous + Faire =', answer: 'faisons', choices: FAIRE },
  { cat: 'Conjugation: Faire', question: 'Vous + Faire =', answer: 'faites', choices: FAIRE },
  { cat: 'Conjugation: Faire', question: 'Ils / Elles + Faire =', answer: 'font', choices: FAIRE },

  { cat: 'Verb Definitions', question: "What does 'Préférer' mean?", answer: 'To prefer', choices: VERB_DEFS },
  { cat: 'Conjugation: Préférer', question: 'Je + Préférer =', answer: 'préfère', choices: PREFERER },
  { cat: 'Conjugation: Préférer', question: 'Tu + Préférer =', answer: 'préfères', choices: PREFERER },
  { cat: 'Conjugation: Préférer', question: 'Il / Elle / On + Préférer =', answer: 'préfère', choices: PREFERER },
  { cat: 'Conjugation: Préférer', question: 'Nous + Préférer =', answer: 'préférons', choices: PREFERER },
  { cat: 'Conjugation: Préférer', question: 'Vous + Préférer =', answer: 'préférez', choices: PREFERER },
  { cat: 'Conjugation: Préférer', question: 'Ils / Elles + Préférer =', answer: 'préfèrent', choices: PREFERER },

  { cat: 'Verb Definitions', question: "What does 'Vouloir' mean?", answer: 'To want', choices: VERB_DEFS },
  { cat: 'Conjugation: Vouloir', question: 'Je + Vouloir =', answer: 'veux', choices: VOULOIR },
  { cat: 'Conjugation: Vouloir', question: 'Tu + Vouloir =', answer: 'veux', choices: VOULOIR },
  { cat: 'Conjugation: Vouloir', question: 'Il / Elle / On + Vouloir =', answer: 'veut', choices: VOULOIR },
  { cat: 'Conjugation: Vouloir', question: 'Nous + Vouloir =', answer: 'voulons', choices: VOULOIR },
  { cat: 'Conjugation: Vouloir', question: 'Vous + Vouloir =', answer: 'voulez', choices: VOULOIR },
  { cat: 'Conjugation: Vouloir', question: 'Ils / Elles + Vouloir =', answer: 'veulent', choices: VOULOIR },
];
