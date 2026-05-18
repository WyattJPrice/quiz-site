import type { Question } from './types';

export const englishIIQuestions: Question[] = [
  // ── Composition / Information Literacy ──────────────────────────

  {
    cat: "Info Literacy",
    question: "What does the acronym CARS stand for when evaluating online sources?",
    answer: "Credibility, Accuracy, Reasonableness, Support",
    choices: [
      "Credibility, Accuracy, Reasonableness, Support",
      "Clarity, Accuracy, Reliability, Sources",
      "Credibility, Analysis, Reasonableness, Specificity",
      "Credibility, Accuracy, Relevance, Support",
    ],
  },
  {
    cat: "Rhetoric",
    question: "Which rhetorical strategy appeals to the audience's emotions?",
    answer: "Pathos",
    choices: ["Ethos", "Pathos", "Logos", "Kairos"],
  },
  {
    cat: "Rhetoric",
    question: "Which rhetorical strategy relies on the speaker's credibility or authority?",
    answer: "Ethos",
    choices: ["Ethos", "Pathos", "Logos", "Rhetoric"],
  },
  {
    cat: "Rhetoric",
    question: "Which rhetorical strategy uses logic, facts, and evidence to persuade?",
    answer: "Logos",
    choices: ["Ethos", "Pathos", "Logos", "Kairos"],
  },
  {
    cat: "Info Literacy",
    question: "A diary entry written by a Civil War soldier is classified as what type of source?",
    answer: "Primary source",
    choices: ["Primary source", "Secondary source", "Tertiary source", "Informal source"],
  },
  {
    cat: "Info Literacy",
    question: "A textbook chapter analyzing the causes of the Civil War is what type of source?",
    answer: "Secondary source",
    choices: ["Primary source", "Secondary source", "Tertiary source", "Reference source"],
  },
  {
    cat: "MLA Format",
    question: "In MLA format, where do your last name and page number appear?",
    answer: "Upper right-hand corner (header)",
    choices: [
      "Upper right-hand corner (header)",
      "Lower right-hand corner",
      "Upper left-hand corner",
      "Centered at the bottom",
    ],
  },
  {
    cat: "MLA Format",
    question: "In MLA format, works cited entries are organized how?",
    answer: "Alphabetically by the author's last name",
    choices: [
      "Alphabetically by the author's last name",
      "Chronologically by publication date",
      "By order of appearance in the essay",
      "By type of source",
    ],
  },
  {
    cat: "Composition",
    question: "What type of essay presents information without taking a side?",
    answer: "Expository essay",
    choices: ["Persuasive essay", "Expository essay", "Narrative essay", "Argumentative essay"],
  },
  {
    cat: "Composition",
    question: "What type of essay aims to convince the reader to adopt a specific viewpoint?",
    answer: "Persuasive essay",
    choices: ["Expository essay", "Persuasive essay", "Descriptive essay", "Informative essay"],
  },
  {
    cat: "Rhetoric",
    question: "A commercial showing sad, neglected animals to encourage donations is primarily using which rhetorical strategy?",
    answer: "Pathos",
    choices: ["Ethos", "Pathos", "Logos", "Anecdote"],
  },
  {
    cat: "Rhetoric",
    question: "A doctor citing peer-reviewed medical studies to recommend a treatment is primarily using which rhetorical strategies?",
    answer: "Ethos and logos",
    choices: ["Pathos and logos", "Ethos and pathos", "Ethos and logos", "Logos only"],
  },

  // ── Persepolis ──────────────────────────────────────────────────

  {
    cat: "Persepolis",
    question: "Who is the author of Persepolis?",
    answer: "Marjane Satrapi",
    choices: ["Azar Nafisi", "Marjane Satrapi", "Shirin Ebadi", "Khaled Hosseini"],
  },
  {
    cat: "Persepolis",
    question: "What type of book is Persepolis?",
    answer: "An autobiographical graphic novel",
    choices: [
      "A historical fiction novel",
      "An autobiographical graphic novel",
      "A biography written by a journalist",
      "A fictional graphic novel",
    ],
  },
  {
    cat: "Persepolis",
    question: "In what country is Persepolis set?",
    answer: "Iran",
    choices: ["Iraq", "Iran", "Afghanistan", "Turkey"],
  },
  {
    cat: "Persepolis",
    question: "What major political event occurs at the beginning of Persepolis?",
    answer: "The Islamic Revolution",
    choices: [
      "The Iran-Iraq War",
      "The Islamic Revolution",
      "The fall of the Ottoman Empire",
      "The Persian Gulf War",
    ],
  },
  {
    cat: "Persepolis",
    question: "What war takes place during the events of Persepolis?",
    answer: "The Iran-Iraq War",
    choices: ["The Persian Gulf War", "The Iran-Iraq War", "The Afghan-Soviet War", "The Six-Day War"],
  },
  {
    cat: "Persepolis",
    question: "Approximately how old is Marjane at the start of the book?",
    answer: "About 10 years old",
    choices: ["About 6 years old", "About 10 years old", "About 14 years old", "About 18 years old"],
  },
  {
    cat: "Persepolis",
    question: "What decade do the events of Persepolis primarily take place in?",
    answer: "The 1980s",
    choices: ["The 1970s", "The 1980s", "The 1990s", "The 2000s"],
  },
  {
    cat: "Persepolis",
    question: "What is Marjane's approximate age range throughout the book?",
    answer: "10 to 14",
    choices: ["6 to 10", "10 to 14", "14 to 18", "18 to 22"],
  },
  {
    cat: "Persepolis",
    question: "Because Persepolis is autobiographical, the story is told from whose perspective?",
    answer: "The author's own (Marjane Satrapi)",
    choices: [
      "A fictional narrator",
      "The author's own (Marjane Satrapi)",
      "A historical journalist",
      "Her grandmother's",
    ],
  },
  {
    cat: "Persepolis",
    question: "What visual format is Persepolis presented in?",
    answer: "Black and white illustrations",
    choices: [
      "Full color illustrations",
      "Black and white illustrations",
      "Photographs with captions",
      "Traditional prose with occasional sketches",
    ],
  },

  // ── Grammar — Conceptual ───────────────────────────────────────

  {
    cat: "Grammar",
    question: "What is another name for a main clause?",
    answer: "Independent clause",
    choices: ["Independent clause", "Subordinate clause", "Relative clause", "Noun clause"],
  },
  {
    cat: "Grammar",
    question: "What is another name for a dependent clause?",
    answer: "Subordinate clause",
    choices: ["Independent clause", "Subordinate clause", "Main clause", "Simple clause"],
  },
  {
    cat: "Grammar",
    question: "A nonessential (nonrestrictive) clause is set off by what punctuation?",
    answer: "Commas",
    choices: ["Semicolons", "Commas", "Colons", "Parentheses"],
  },
  {
    cat: "Grammar",
    question: "An essential (restrictive) clause does what?",
    answer: "Provides information necessary to identify the noun it modifies",
    choices: [
      "Provides information necessary to identify the noun it modifies",
      "Adds extra, removable information about a noun",
      "Always begins with the word 'which'",
      "Is always set off by commas",
    ],
  },
  {
    cat: "Grammar",
    question: "What is a prepositional phrase?",
    answer: "A phrase beginning with a preposition and ending with its object",
    choices: [
      "A phrase beginning with a preposition and ending with its object",
      "A phrase containing a verb form used as another part of speech",
      "A group of words that can stand alone as a sentence",
      "A phrase that modifies the entire sentence",
    ],
  },
  {
    cat: "Verbals",
    question: "Which type of verbal functions as a noun and ends in -ing?",
    answer: "Gerund",
    choices: ["Participle", "Gerund", "Infinitive", "Predicate"],
  },
  {
    cat: "Verbals",
    question: "Which type of verbal functions as an adjective and often ends in -ing or -ed?",
    answer: "Participle",
    choices: ["Participle", "Gerund", "Infinitive", "Conjunction"],
  },
  {
    cat: "Verbals",
    question: 'Which type of verbal is formed using "to" + a verb (e.g., "to run")?',
    answer: "Infinitive",
    choices: ["Participle", "Gerund", "Infinitive", "Preposition"],
  },
  {
    cat: "Grammar",
    question: 'When a compound subject is joined by "and," the verb is usually what form?',
    answer: "Plural",
    choices: ["Singular", "Plural", "Either singular or plural", "Past tense"],
  },
  {
    cat: "Grammar",
    question: 'The indefinite pronoun "everyone" takes what kind of verb?',
    answer: "Singular",
    choices: ["Singular", "Plural", "Either", "It depends on the context"],
  },
  {
    cat: "Punctuation",
    question: "An apostrophe is used to show what two things?",
    answer: "Possession and contractions",
    choices: [
      "Possession and contractions",
      "Plurals and possession",
      "Emphasis and contractions",
      "Quotations and possession",
    ],
  },
  {
    cat: "Punctuation",
    question: "A colon is used after an independent clause to introduce what?",
    answer: "A list, explanation, or quotation",
    choices: [
      "A list, explanation, or quotation",
      "Another independent clause",
      "A dependent clause",
      "A prepositional phrase",
    ],
  },
  {
    cat: "Punctuation",
    question: "A semicolon can be used to join what?",
    answer: "Two closely related independent clauses",
    choices: [
      "Two closely related independent clauses",
      "A dependent and independent clause",
      "Items in a simple list",
      "A subject and its verb",
    ],
  },
  {
    cat: "Punctuation",
    question: "What is the difference between a hyphen and a dash?",
    answer: "A hyphen joins compound words; a dash sets off information or adds emphasis",
    choices: [
      "A hyphen joins compound words; a dash sets off information or adds emphasis",
      "They are the same thing with different names",
      "A hyphen separates clauses; a dash joins words",
      "A dash is shorter than a hyphen",
    ],
  },
  {
    cat: "Punctuation",
    question: "What is the general rule for formatting titles of short works vs. long works?",
    answer: "Short works in quotation marks; long works in italics",
    choices: [
      "Short works in quotation marks; long works in italics",
      "Both in italics",
      "Short works in italics; long works in quotation marks",
      "Both in quotation marks",
    ],
  },

  // ── Grammar — Applied: End Marks ───────────────────────────────

  {
    cat: "End Marks",
    question: '"Watch out for that angry goose" — choose the correct end mark and sentence type.',
    answer: "! Exclamatory",
    choices: [". Declarative", ". Imperative", "? Interrogative", "! Exclamatory"],
  },
  {
    cat: "End Marks",
    question: '"Draw me a sheep, please" — choose the correct end mark and sentence type.',
    answer: ". Imperative",
    choices: [". Declarative", ". Imperative", "? Interrogative", "! Exclamatory"],
  },
  {
    cat: "End Marks",
    question: '"Did you remember to feed the dog" — choose the correct end mark and sentence type.',
    answer: "? Interrogative",
    choices: [". Declarative", ". Imperative", "? Interrogative", "! Exclamatory"],
  },
  {
    cat: "End Marks",
    question: '"Johnny left about an hour ago" — choose the correct end mark and sentence type.',
    answer: ". Declarative",
    choices: [". Declarative", ". Imperative", "? Interrogative", "! Exclamatory"],
  },

  // ── Grammar — Applied: Colon vs Semicolon ──────────────────────

  {
    cat: "Punctuation",
    question: '"Tourists flock to these shops __ therefore, the economy has steadily grown." — colon or semicolon?',
    answer: "Semicolon",
    choices: ["Colon", "Semicolon"],
  },
  {
    cat: "Punctuation",
    question: '"The ship is set to arrive at 3__45 P.M. today." — colon or semicolon?',
    answer: "Colon",
    choices: ["Colon", "Semicolon"],
  },
  {
    cat: "Punctuation",
    question: '"Now Nelson\'s Dockyard is full of shops __ the Saw Pit, the Cooper and Lumber Store, and many others." — colon or semicolon?',
    answer: "Colon",
    choices: ["Colon", "Semicolon"],
  },
  {
    cat: "Punctuation",
    question: '"Old towns can be revived __ the story of English Harbor proves it." — colon or semicolon?',
    answer: "Semicolon",
    choices: ["Colon", "Semicolon"],
  },
  {
    cat: "Punctuation",
    question: '"In 1951, the governor founded the Society __ its purpose was to restore the harbor." — colon or semicolon?',
    answer: "Semicolon",
    choices: ["Colon", "Semicolon"],
  },

  // ── Grammar — Applied: Titles ──────────────────────────────────

  {
    cat: "Titles",
    question: "The Little Prince (book) — quotation marks or italics?",
    answer: "Italics",
    choices: ["Quotation marks", "Italics"],
  },
  {
    cat: "Titles",
    question: "The Two-Headed Calf (poem) — quotation marks or italics?",
    answer: "Quotation marks",
    choices: ["Quotation marks", "Italics"],
  },
  {
    cat: "Titles",
    question: "Good Housekeeping (magazine) — quotation marks or italics?",
    answer: "Italics",
    choices: ["Quotation marks", "Italics"],
  },
  {
    cat: "Titles",
    question: "The Masque of the Red Death (short story) — quotation marks or italics?",
    answer: "Quotation marks",
    choices: ["Quotation marks", "Italics"],
  },
  {
    cat: "Titles",
    question: "The Phantom of the Opera (play) — quotation marks or italics?",
    answer: "Italics",
    choices: ["Quotation marks", "Italics"],
  },

  // ── Grammar — Applied: Possessives ─────────────────────────────

  {
    cat: "Possessives",
    question: 'What is the correct possessive form of "geese"?',
    answer: "Geese's",
    choices: ["Geese's", "Geeses'", "Geeses's"],
  },
  {
    cat: "Possessives",
    question: 'What is the correct possessive form of "dogs"?',
    answer: "Dogs'",
    choices: ["Dog's", "Dogs'", "Dogs's"],
  },
  {
    cat: "Possessives",
    question: 'What is the correct possessive form of "Ms. Mina"?',
    answer: "Ms. Mina's",
    choices: ["Ms. Minas'", "Ms.'s Mina", "Ms. Mina's"],
  },
  {
    cat: "Possessives",
    question: 'What is the correct possessive form of "children"?',
    answer: "Children's",
    choices: ["Children's", "Childrens'", "Childrens's"],
  },

  // ── Grammar — Applied: Hyphen / Dash / Parentheses ─────────────

  {
    cat: "Punctuation",
    question: '"The country has been self governing since 1981." — the phrase "self governing" needs a:',
    answer: "Hyphen",
    choices: ["Hyphen", "Dash", "Parentheses"],
  },
  {
    cat: "Punctuation",
    question: '"Redonda — an uninhabited island — is also part of the island country." The phrase "an uninhabited island" is set off by:',
    answer: "Dashes",
    choices: ["Hyphens", "Dashes", "Parentheses"],
  },
  {
    cat: "Punctuation",
    question: '"One tree may have as many as forty two uses." — the phrase "forty two" needs a:',
    answer: "Hyphen",
    choices: ["Hyphen", "Dash", "Parentheses"],
  },
  {
    cat: "Punctuation",
    question: '"The total land area is 171 square miles (442 square kilometers)." The measurement "442 square kilometers" is enclosed in:',
    answer: "Parentheses",
    choices: ["Hyphens", "Dashes", "Parentheses"],
  },

  // ── Grammar — Applied: Verbal Identification ───────────────────

  {
    cat: "Verbals",
    question: 'In the sentence "Running is my favorite exercise," what type of verbal is "running"?',
    answer: "Gerund",
    choices: ["Participle", "Gerund", "Infinitive", "Verb"],
  },

  // ── Hamlet — General / Acts I–III ──────────────────────────────

  {
    cat: "Hamlet",
    question: "What genre is Hamlet?",
    answer: "Tragedy",
    choices: ["Comedy", "Tragedy", "Romance", "History"],
  },
  {
    cat: "Hamlet",
    question: "Hamlet is often sub-categorized as what specific type of play?",
    answer: "A revenge play",
    choices: ["A revenge play", "A comedy of errors", "A morality play", "A pastoral drama"],
  },
  {
    cat: "Hamlet",
    question: "In what country is Hamlet set?",
    answer: "Denmark",
    choices: ["England", "Denmark", "Norway", "Sweden"],
  },
  {
    cat: "Hamlet",
    question: "Who is the ghost that appears at the beginning of the play?",
    answer: "King Hamlet (Hamlet's dead father)",
    choices: [
      "Polonius",
      "King Hamlet (Hamlet's dead father)",
      "Fortinbras's father",
      "Yorick",
    ],
  },
  {
    cat: "Hamlet",
    question: "What does the ghost tell Hamlet?",
    answer: "That he was murdered by his brother Claudius",
    choices: [
      "That Gertrude murdered him",
      "That he was murdered by his brother Claudius",
      "That he died of natural causes",
      "That Laertes plotted against him",
    ],
  },
  {
    cat: "Hamlet",
    question: "What is Hamlet's relationship to Claudius?",
    answer: "Claudius is Hamlet's uncle and stepfather",
    choices: [
      "Claudius is Hamlet's brother",
      "Claudius is Hamlet's uncle and stepfather",
      "Claudius is Hamlet's cousin",
      "Claudius is Hamlet's father-in-law",
    ],
  },
  {
    cat: "Hamlet",
    question: "Who is Gertrude?",
    answer: "Hamlet's mother and Queen of Denmark",
    choices: [
      "Hamlet's sister",
      "Hamlet's mother and Queen of Denmark",
      "Ophelia's mother",
      "Claudius's first wife",
    ],
  },
  {
    cat: "Hamlet",
    question: "What device does Hamlet use to confirm Claudius's guilt?",
    answer: 'A play-within-a-play ("The Mousetrap")',
    choices: [
      "A forged letter",
      'A play-within-a-play ("The Mousetrap")',
      "A confession from Gertrude",
      "Testimony from the ghost in front of the court",
    ],
  },
  {
    cat: "Hamlet",
    question: 'What is a "foil character"?',
    answer: "A character who contrasts with another to highlight particular qualities",
    choices: [
      "A character who is the main character's enemy",
      "A character who contrasts with another to highlight particular qualities",
      "A character who appears only in flashbacks",
      "A character who serves as comic relief",
    ],
  },
  {
    cat: "Hamlet",
    question: "Which of the following is NOT a feature of a revenge play?",
    answer: "A happy ending for the hero",
    choices: [
      "A happy ending for the hero",
      "Insanity or feigned insanity of the main character",
      "A play-within-a-play",
      "Death of the main character",
    ],
  },

  // ── Hamlet — Act IV ────────────────────────────────────────────

  {
    cat: "Hamlet Act IV",
    question: "How do the peasants feel about Laertes's return to the kingdom?",
    answer: "They feel like he should be king",
    choices: [
      "They feel as if he abandoned his royal duties and now dislike him",
      "They feel like he should be king",
      "They want him to kill Hamlet",
      "They want him to take Ophelia away",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "What news does the Queen bring at the end of Act IV?",
    answer: "Ophelia is dead",
    choices: [
      "Ophelia has found a new lover",
      "Ophelia is dead",
      "Hamlet has survived the attack and is heading back",
      "She is pregnant with Claudius's child",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "How does the Queen protect Hamlet at the beginning of Act IV?",
    answer: "She tells Claudius that Hamlet feels remorse for Polonius's death",
    choices: [
      "She tells Claudius she will divorce him if he harms Hamlet",
      "She tells Claudius that Hamlet feels remorse for Polonius's death",
      "She threatens to tell the kingdom what Claudius did",
      "She does not protect him; she wants him dead just as much as Claudius does",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "What does Claudius arrange to happen when Hamlet arrives in England?",
    answer: "He wants the King of England to arrange having Hamlet killed",
    choices: [
      "He wants Rosencrantz and Guildenstern to kill him at the border",
      "He wants the King of England to arrange having Hamlet killed",
      "He tells the King of England to give Hamlet the finest luxury",
      "He wants Hamlet to marry an English princess",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: 'What is Claudius and Laertes\'s "Plan A" for getting rid of Hamlet?',
    answer: "Laertes will duel Hamlet with a poisoned sword",
    choices: [
      "They will have Hamlet drink poisoned wine from a chalice",
      "They will distract Hamlet with Ophelia while Laertes stabs him",
      "Laertes will duel Hamlet with a poisoned sword",
      "They will send Hamlet back to England to be executed",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: 'What is Claudius and Laertes\'s "Plan B" for getting rid of Hamlet?',
    answer: "They will have Hamlet drink poisoned wine from a chalice",
    choices: [
      "They will have Hamlet drink poisoned wine from a chalice",
      "Laertes will duel Hamlet with a poisoned sword",
      "They will push Hamlet off of a cliff",
      "Claudius will disown him and send him to live in the Danish woods",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "Who does Hamlet meet on his way to England?",
    answer: "Fortinbras",
    choices: ["Ophelia", "Gertrude", "Fortinbras", "The Ghost"],
  },
  {
    cat: "Hamlet Act IV",
    question: "How does the king respond to Laertes's question at the beginning of scene 7?",
    answer: "He couldn't act against Hamlet because the kingdom loves him and Gertrude would be devastated",
    choices: [
      "He couldn't act against Hamlet because the kingdom loves him and Gertrude would be devastated",
      "He says that Hamlet will not make Ophelia happy",
      "He tells him Polonius was a stellar man who certainly made it to Heaven",
      "He explains that he and Gertrude had a long-standing affair",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "What does Claudius ask Rosencrantz and Guildenstern to do at the beginning of Act IV?",
    answer: "To speak nicely to Hamlet and bring Polonius's body to the chapel",
    choices: [
      "To speak nicely to Hamlet and bring Polonius's body to the chapel",
      "To bury Polonius and explain to Hamlet what to expect",
      "To take Hamlet away and console Gertrude",
      "To murder Ophelia in hopes of breaking her spell on Hamlet",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "Why is Laertes happy about Hamlet's return to Denmark?",
    answer: "Because he plans to kill him",
    choices: [
      "Because he plans to kill him",
      "Because he hopes Hamlet will help with his revenge plans",
      "Because he wants Hamlet to take care of Ophelia",
      "Because he hopes Hamlet will help him become king",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "Which character is established as a foil character to Hamlet?",
    answer: "Laertes",
    choices: ["Laertes", "Claudius", "Ophelia", "Gertrude"],
  },
  {
    cat: "Hamlet Act IV",
    question: "Why is Laertes considered a foil to Hamlet?",
    answer: "Both seek to avenge their father's death, but Laertes acts decisively while Hamlet hesitates",
    choices: [
      "Both seek to avenge their father's death, but Laertes acts decisively while Hamlet hesitates",
      "They are both kings competing for the throne",
      "They are both in love with Ophelia",
      "They have identical personalities and make the same choices",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: 'What does Hamlet mean when he calls Rosencrantz a "sponge"?',
    answer: "It means he soaks up the king's words like a sponge",
    choices: [
      "It means he soaks up the king's words like a sponge",
      'It means Rosencrantz is "too soft" for his line of work',
      "It means he is full of holes, since he is only human",
      "It means nothing; Hamlet is officially crazy at this point",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "What happens to Hamlet during his passage to England?",
    answer: "He is taken prisoner after having to fight a band of pirates",
    choices: [
      "His carriage flips over, killing Rosencrantz in the process",
      "Guards harass him for money, knowing he is the prince",
      "He is taken prisoner after having to fight a band of pirates",
      "He proclaims his love for Ophelia to a dead fish on an unnamed beach",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "What has happened to Ophelia during Act IV?",
    answer: "She has gone crazy",
    choices: [
      "She has gone crazy",
      "She was kidnapped while picking flowers outside the castle",
      "She was injured trying to buy a remedy for Hamlet's madness",
      "She was married off to the Prince of England",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "What does Laertes ask Claudius at the beginning of scene 7?",
    answer: "He wants to know why Claudius did not immediately take action against Hamlet",
    choices: [
      "He wants to know why Claudius did not immediately take action against Hamlet",
      "He wants to know what Claudius thinks of Hamlet and Ophelia's relationship",
      "He asks why his father had to die and if Claudius thinks he made it to Heaven",
      "He asks why Claudius wanted to marry his brother's wife",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "Why does Laertes break into Claudius's chamber?",
    answer: "He thinks Claudius has killed his father and wants revenge",
    choices: [
      "He wants to kill Claudius so he can become king",
      "He thinks Claudius has killed his father and wants revenge",
      "He heard Claudius may know something about his father's murder",
      "He thinks Claudius is having an affair with Ophelia",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "Of the following, which is NOT a place Hamlet says Polonius can be found?",
    answer: "Hanging out with friends",
    choices: ["Supper in the dirt", "In the main hall", "In Heaven", "Hanging out with friends"],
  },
  {
    cat: "Hamlet Act IV",
    question: "How does Ophelia die?",
    answer: "She tried to climb a tree, but fell into the brook below and drowned",
    choices: [
      "She tried to climb a tree, but fell into the brook below and drowned",
      "She was stabbed by a poisoned sword",
      "She accidentally ate one of her poisonous flowers",
      "She strangled herself with vines from a nearby tree",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "What is Fortinbras's army doing in Act IV?",
    answer: "They are traveling through Denmark to attack Poland",
    choices: [
      "They are attacking Denmark",
      "They are fighting with the Danish army",
      "They are traveling through Denmark to attack Poland",
      "They are sipping some strawberry wine",
    ],
  },
  {
    cat: "Hamlet Act IV",
    question: "What does Claudius tell Laertes in response to Laertes breaking into his chambers?",
    answer: "To choose his wisest friends and let them judge — Claudius will give up his crown if guilty and help Laertes seek revenge if innocent",
    choices: [
      "To choose his wisest friends and let them judge — Claudius will give up his crown if guilty and help Laertes seek revenge if innocent",
      "That Hamlet alone is responsible and Claudius had nothing to do with it",
      "That Laertes should flee Denmark before Hamlet kills him too",
      "That Polonius deserved what happened to him for spying",
    ],
  },

  // ── Hamlet — Act V ─────────────────────────────────────────────

  {
    cat: "Hamlet Act V",
    question: "How did Laertes die?",
    answer: "Hamlet stabbed him with a poisoned sword",
    choices: [
      "He drank poison",
      "Hamlet stabbed him with a poisoned sword",
      "He sacrificed himself for Ophelia",
      "Claudius ordered his execution by hanging",
    ],
  },
  {
    cat: "Hamlet Act V",
    question: "How did Claudius die?",
    answer: "Hamlet stabbed him with a poisoned sword, then forced him to drink poison",
    choices: [
      "Hamlet stabbed him with a poisoned sword, then forced him to drink poison",
      "Hamlet cut off his head",
      "Laertes killed him by forcing him to drink poison",
      "A bear came out of nowhere and mauled him to death",
    ],
  },
  {
    cat: "Hamlet Act V",
    question: "How did Hamlet die?",
    answer: "Laertes stabbed him with a poisoned sword",
    choices: [
      "Claudius stabbed him with a poisoned sword",
      "Laertes stabbed him with a poisoned sword",
      "He drank poisoned wine",
      "The King of England assassinated him",
    ],
  },
  {
    cat: "Hamlet Act V",
    question: "How does Gertrude die?",
    answer: "She drank poisoned wine",
    choices: [
      "She drank poisoned wine",
      "She is stabbed with a poisoned sword",
      "She drowns in a brook after climbing a tree",
      "Hamlet strangles her",
    ],
  },
  {
    cat: "Hamlet Act V",
    question: "Why are Hamlet and Laertes fighting at the end of Act V, scene 1?",
    answer: "They are competing over who is the most sad about Ophelia dying",
    choices: [
      "Laertes is mad at Hamlet for killing his father",
      "Hamlet is mad at Laertes for killing his father",
      "They are competing over who is the most sad about Ophelia dying",
      "They are fighting over who should be the king",
    ],
  },
  {
    cat: "Hamlet Act V",
    question: "Who arrives at Elsinore castle and is presumed to take over leadership after the death of the royals?",
    answer: "Fortinbras",
    choices: ["Fortinbras", "Hamlet", "Ophelia", "Horatio"],
  },
  {
    cat: "Hamlet Act V",
    question: "What does Laertes do when he sees Ophelia in her casket?",
    answer: "He jumps into the casket to hold her",
    choices: [
      "He cries out in prayer before dropping to his knees in sorrow",
      "He attacks Hamlet, knowing he had something to do with her death",
      "He jumps into the casket to hold her",
      "He is very silent, deep within his own thoughts",
    ],
  },
  {
    cat: "Hamlet Act V",
    question: "What happened to Rosencrantz and Guildenstern?",
    answer: "They are presumed to be assassinated in England after Hamlet rewrote the letter they carried",
    choices: [
      "They are presumed to be assassinated in England after Hamlet rewrote the letter they carried",
      "They are killed by the pirates that had kidnapped them and Hamlet",
      "They sailed to England and started a new life in France with Hamlet's money",
      "Guildenstern killed Hamlet Sr., and Rosencrantz killed him before poisoning himself",
    ],
  },
  {
    cat: "Hamlet Act V",
    question: "How is Horatio killed?",
    answer: "Trick question — he is alive at the end of the play",
    choices: [
      "He drinks poisoned wine",
      "He is stabbed with a poisoned sword",
      "He drowns in the nearby brook",
      "Trick question — he is alive at the end of the play",
    ],
  },
  {
    cat: "Hamlet Act V",
    question: "What do the gravediggers say about Ophelia's death?",
    answer: "They say she committed suicide",
    choices: [
      "They claim she was pushed into the brook",
      "They claim the flower she ate looked similar to a non-poisonous one",
      "They say Hamlet poisoned her wine",
      "They say she committed suicide",
    ],
  },
];
