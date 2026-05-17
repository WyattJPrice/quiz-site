import type { Question } from './types';

export const finalReviewQuestions: Question[] = [
  // Ch 18: Taxonomy (#1)
  {
    cat: "Taxonomy",
    question: "What is taxonomy?",
    answer: "The science of describing, identifying, naming, and classifying organisms",
    choices: [
      "The science of describing, identifying, naming, and classifying organisms",
      "The study of how organisms interact with their environment",
      "The science of cell division and genetic inheritance",
      "The study of fossils and ancient life forms"
    ]
  },
  {
    cat: "Taxonomy",
    question: "What language is used for scientific names?",
    answer: "Latin",
    choices: ["Latin", "Greek", "English", "German"]
  },
  {
    cat: "Taxonomy",
    question: "What is the correct order of classification from largest to smallest?",
    answer: "Kingdom, Phylum, Class, Order, Family, Genus, Species",
    choices: [
      "Kingdom, Phylum, Class, Order, Family, Genus, Species",
      "Kingdom, Class, Phylum, Order, Family, Genus, Species",
      "Kingdom, Phylum, Order, Class, Family, Genus, Species",
      "Kingdom, Phylum, Class, Family, Order, Genus, Species"
    ]
  },
  {
    cat: "Taxonomy",
    question: "Which kingdom is composed of prokaryotic cells only?",
    answer: "Kingdom Monera",
    choices: ["Kingdom Monera", "Kingdom Protista", "Kingdom Fungi", "Kingdom Plantae"]
  },

  // Ch 20: Viruses & Bacteria (#2, #3)
  {
    cat: "Viruses & Bacteria",
    question: "Why are viruses considered not alive?",
    answer: "They do not metabolize",
    choices: [
      "They do not metabolize",
      "They do not contain nucleic acids",
      "They cannot infect host cells",
      "They do not have any proteins"
    ]
  },
  {
    cat: "Viruses & Bacteria",
    question: "What are the two structural components of a virus?",
    answer: "Nucleic acid and a capsid (protein coat)",
    choices: [
      "Nucleic acid and a capsid (protein coat)",
      "Cell membrane and cytoplasm",
      "Nucleus and ribosomes",
      "Cell wall and flagella"
    ]
  },
  {
    cat: "Viruses & Bacteria",
    question: "What do bacteria form in harsh environments?",
    answer: "Endospores",
    choices: ["Endospores", "Flagella", "Capsids", "Pseudopodia"]
  },

  // Ch 21: Protista (#4–#11)
  {
    cat: "Protista",
    question: "Protista organisms are mainly what type of cell?",
    answer: "Eukaryotic",
    choices: ["Eukaryotic", "Prokaryotic", "Acellular", "Colonial"]
  },
  {
    cat: "Protista",
    question: "How are protists divided?",
    answer: "Plant-like, animal-like, and fungi-like",
    choices: [
      "Plant-like, animal-like, and fungi-like",
      "Aquatic, terrestrial, and aerial",
      "Unicellular, multicellular, and colonial",
      "Autotrophic, chemotrophic, and parasitic"
    ]
  },
  {
    cat: "Protista",
    question: "Are all protists unicellular?",
    answer: "No — they are perhaps a mix of unicellular and multicellular",
    choices: [
      "No — they are perhaps a mix of unicellular and multicellular",
      "Yes — all protists are single-celled organisms",
      "No — all protists are multicellular",
      "Yes — but only when in colonies"
    ]
  },
  {
    cat: "Protista",
    question: "What are diatoms' shells made of?",
    answer: "Calcium carbonate and silica",
    choices: [
      "Calcium carbonate and silica",
      "Chitin and cellulose",
      "Keratin and calcium phosphate",
      "Peptidoglycan and lipids"
    ]
  },
  {
    cat: "Protista",
    question: "Diatoms are described as having what shape due to their double shells?",
    answer: "Boxlike",
    choices: ["Boxlike", "Spherical", "Spiral", "Flat and disc-shaped"]
  },
  {
    cat: "Protista",
    question: "Which protozoan phylum moves by pseudopodia (false feet)?",
    answer: "Sarcodina (example: Amoeba)",
    choices: [
      "Sarcodina (example: Amoeba)",
      "Ciliaphora (example: Paramecium)",
      "Euglenoid (example: Euglena)",
      "Sporozoans (example: Plasmodium)"
    ]
  },
  {
    cat: "Protista",
    question: "Which protozoan phylum moves by flagella?",
    answer: "Euglenoid (example: Euglena)",
    choices: [
      "Euglenoid (example: Euglena)",
      "Sarcodina (example: Amoeba)",
      "Ciliaphora (example: Paramecium)",
      "Sporozoans (example: Plasmodium)"
    ]
  },
  {
    cat: "Protista",
    question: "Which protozoan phylum moves by cilia?",
    answer: "Ciliaphora (example: Paramecium)",
    choices: [
      "Ciliaphora (example: Paramecium)",
      "Sarcodina (example: Amoeba)",
      "Euglenoid (example: Euglena)",
      "Sporozoans (example: Plasmodium)"
    ]
  },
  {
    cat: "Protista",
    question: "Which protozoan phylum does not move and consists entirely of parasites?",
    answer: "Sporozoans (example: Plasmodium)",
    choices: [
      "Sporozoans (example: Plasmodium)",
      "Sarcodina (example: Amoeba)",
      "Ciliaphora (example: Paramecium)",
      "Euglenoid (example: Euglena)"
    ]
  },
  {
    cat: "Protista",
    question: "Eubacteria and Archaebacteria differ from other kingdoms because they lack what structure?",
    answer: "A nucleus",
    choices: ["A nucleus", "DNA", "A cell membrane", "The ability to reproduce"]
  },
  {
    cat: "Protista",
    question: "What do ALL kingdoms have in common?",
    answer: "They all have DNA, a cell membrane, and they all reproduce",
    choices: [
      "They all have DNA, a cell membrane, and they all reproduce",
      "They all have a nucleus, DNA, and cell walls",
      "They all are multicellular and have organelles",
      "They all metabolize, photosynthesize, and reproduce"
    ]
  },
  {
    cat: "Protista",
    question: "Alginic acid is produced by which type of algae?",
    answer: "Brown algae",
    choices: ["Brown algae", "Red algae", "Green algae", "Golden algae"]
  },
  {
    cat: "Protista",
    question: "Which of the following is a product made with alginic acid?",
    answer: "Ice cream, pudding, and toothpaste",
    choices: [
      "Ice cream, pudding, and toothpaste",
      "Antibiotics and vaccines",
      "Fertilizers and pesticides",
      "Gasoline and plastics"
    ]
  },
  {
    cat: "Protista",
    question: "Which group of protists is animal-like?",
    answer: "Protozoans",
    choices: ["Protozoans", "Algae", "Slime molds", "Diatoms"]
  },
  {
    cat: "Protista",
    question: "Which group of protists is plant-like?",
    answer: "Algae",
    choices: ["Algae", "Protozoans", "Slime molds", "Sporozoans"]
  },
  {
    cat: "Protista",
    question: "Which group of protists is fungal-like?",
    answer: "Slime molds and water molds",
    choices: ["Slime molds and water molds", "Protozoans", "Algae", "Diatoms"]
  },
  {
    cat: "Protista",
    question: "What disease does Plasmodium cause?",
    answer: "Malaria",
    choices: ["Malaria", "Toxoplasmosis", "Tuberculosis", "Cholera"]
  },
  {
    cat: "Protista",
    question: "What disease does Toxoplasma gondii cause?",
    answer: "Toxoplasmosis",
    choices: ["Toxoplasmosis", "Malaria", "Pneumonia", "Meningitis"]
  },
  {
    cat: "Protista",
    question: "How is toxoplasmosis spread?",
    answer: "By cats and eating undercooked meat containing cysts",
    choices: [
      "By cats and eating undercooked meat containing cysts",
      "By mosquito bites",
      "Through contaminated drinking water",
      "Through airborne respiratory droplets"
    ]
  },
  {
    cat: "Protista",
    question: "What is the function of a contractile vacuole?",
    answer: "Pumps excess water out of protozoans",
    choices: [
      "Pumps excess water out of protozoans",
      "Stores food for later digestion",
      "Produces energy through photosynthesis",
      "Provides structural support to the cell"
    ]
  },

  // Ch 29: Arthropods (#12–#16)
  {
    cat: "Arthropods",
    question: "What is the main feature of Phylum Arthropoda?",
    answer: "Exoskeleton",
    choices: ["Exoskeleton", "Endoskeleton", "Notochord", "Hydrostatic skeleton"]
  },
  {
    cat: "Arthropods",
    question: "What is molting?",
    answer: "The shedding of an exoskeleton",
    choices: [
      "The shedding of an exoskeleton",
      "The growth of new appendages",
      "The process of forming a cocoon",
      "The division of body segments"
    ]
  },
  {
    cat: "Arthropods",
    question: "Why do arthropods molt?",
    answer: "The exoskeleton cannot grow larger",
    choices: [
      "The exoskeleton cannot grow larger",
      "The exoskeleton becomes too heavy",
      "The exoskeleton loses its color",
      "The exoskeleton absorbs too much water"
    ]
  },
  {
    cat: "Arthropods",
    question: "Crawfish are examples of which phylum?",
    answer: "Crustacea",
    choices: ["Crustacea", "Insecta", "Arachnida", "Mollusca"]
  },
  {
    cat: "Arthropods",
    question: "Which of the following are also crustaceans?",
    answer: "Lobsters, copepods, and water fleas",
    choices: [
      "Lobsters, copepods, and water fleas",
      "Spiders, scorpions, and ticks",
      "Grasshoppers, beetles, and ants",
      "Earthworms, leeches, and slugs"
    ]
  },
  {
    cat: "Arthropods",
    question: "What are the longer antennae of crustaceans responsible for?",
    answer: "Tactile sensations (touch and vibrations)",
    choices: [
      "Tactile sensations (touch and vibrations)",
      "Chemical sensing (smell and taste)",
      "Detecting light and color",
      "Regulating body temperature"
    ]
  },
  {
    cat: "Arthropods",
    question: "What are the shorter antennules of crustaceans responsible for?",
    answer: "Chemical sensing (smell and taste)",
    choices: [
      "Chemical sensing (smell and taste)",
      "Tactile sensations (touch and vibrations)",
      "Balance and orientation",
      "Sound detection"
    ]
  },
  {
    cat: "Arthropods",
    question: "Insect antennae (like the grasshopper) are sense organs for what?",
    answer: "Touch and smelling",
    choices: [
      "Touch and smelling",
      "Hearing and balance",
      "Sight and temperature",
      "Taste and pain"
    ]
  },
  {
    cat: "Arthropods",
    question: "What structure have aquatic crustaceans adapted for life in water?",
    answer: "Gills",
    choices: ["Gills", "Lungs", "Spiracles", "Book lungs"]
  },

  // Bullet: phylum names and examples of invertebrates
  {
    cat: "Arthropods",
    question: "Which of the following is NOT a phylum of invertebrates mentioned in the review?",
    answer: "Chordata",
    choices: ["Chordata", "Porifera", "Cnidaria", "Platyhelminthes"]
  },

  // Ch 30: Fish (#17–#19)
  {
    cat: "Fish",
    question: "What are the 3 major groups of fish?",
    answer: "Jawless, cartilaginous, and bony",
    choices: [
      "Jawless, cartilaginous, and bony",
      "Freshwater, saltwater, and brackish",
      "Herbivorous, carnivorous, and omnivorous",
      "Ray-finned, lobe-finned, and lungfish"
    ]
  },
  {
    cat: "Fish",
    question: "In bony fishes, what reproductive structure do females have?",
    answer: "An ovary",
    choices: ["An ovary", "A uterus", "A cloaca only", "A swim bladder"]
  },
  {
    cat: "Fish",
    question: "What is the process called when male and female bony fish release eggs and sperm externally?",
    answer: "Spawning",
    choices: ["Spawning", "Budding", "Molting", "Metamorphosis"]
  },
  {
    cat: "Fish",
    question: "What does the lateral line of a fish detect?",
    answer: "Pressure changes, movement, and vibrations",
    choices: [
      "Pressure changes, movement, and vibrations",
      "Chemical scents in the water",
      "Light intensity and color",
      "Water temperature changes"
    ]
  },
  {
    cat: "Fish",
    question: "What is the operculum?",
    answer: "A bony flap that protects gills and pumps water across them",
    choices: [
      "A bony flap that protects gills and pumps water across them",
      "A sensory organ that detects vibrations in water",
      "A fin used for forward movement",
      "An air-filled sac that controls buoyancy"
    ]
  },
  {
    cat: "Fish",
    question: "What does the swim bladder do?",
    answer: "Changes the fish's density by adjusting air in the sac",
    choices: [
      "Changes the fish's density by adjusting air in the sac",
      "Filters toxins from the fish's blood",
      "Stores food for later digestion",
      "Produces hormones for reproduction"
    ]
  },
  {
    cat: "Fish",
    question: "What is the function of gills in a fish?",
    answer: "Remove oxygen from water for respiration",
    choices: [
      "Remove oxygen from water for respiration",
      "Filter food particles from the water",
      "Regulate the fish's body temperature",
      "Pump blood throughout the body"
    ]
  },
  {
    cat: "Fish",
    question: "What is the cloaca in a fish?",
    answer: "A common opening for both urogenital and digestive systems",
    choices: [
      "A common opening for both urogenital and digestive systems",
      "A structure that filters oxygen from water",
      "A protective covering over the scales",
      "An air-filled sac for buoyancy"
    ]
  },

  // Ch 34: Tissues, Skeletal, Skin (#20–#31)
  {
    cat: "Body Systems",
    question: "What is connective tissue?",
    answer: "A tissue that supports, connects, protects, and insulates the body",
    choices: [
      "A tissue that supports, connects, protects, and insulates the body",
      "A tissue that transmits electrical impulses throughout the body",
      "A tissue that contracts to produce movement",
      "A tissue that lines the surfaces and cavities of the body"
    ]
  },
  {
    cat: "Body Systems",
    question: "Which of the following are examples of connective tissue?",
    answer: "Fat, cartilage, bone, tendons, and blood",
    choices: [
      "Fat, cartilage, bone, tendons, and blood",
      "Skin, hair, nails, and glands",
      "Brain, spinal cord, and nerves",
      "Biceps, triceps, and cardiac muscle"
    ]
  },
  {
    cat: "Body Systems",
    question: "What are the 4 major types of tissue in the human body?",
    answer: "Epithelial, nervous, connective, and muscle",
    choices: [
      "Epithelial, nervous, connective, and muscle",
      "Skeletal, smooth, cardiac, and nervous",
      "Blood, bone, cartilage, and fat",
      "Dermal, vascular, epidermal, and ground"
    ]
  },
  {
    cat: "Body Systems",
    question: "Epithelial tissue is mainly found where?",
    answer: "The skin",
    choices: ["The skin", "The nerves", "The muscles", "The bones"]
  },
  {
    cat: "Body Systems",
    question: "What is the correct order of body organization from largest to smallest?",
    answer: "System, organ, tissue, cells",
    choices: [
      "System, organ, tissue, cells",
      "Organ, system, tissue, cells",
      "System, tissue, organ, cells",
      "Cells, tissue, organ, system"
    ]
  },
  {
    cat: "Body Systems",
    question: "What is the function of the skeletal system?",
    answer: "Give support, provide protection, store minerals",
    choices: [
      "Give support, provide protection, store minerals",
      "Transport oxygen, remove waste, regulate temperature",
      "Produce hormones, regulate metabolism, control growth",
      "Digest food, absorb nutrients, eliminate waste"
    ]
  },
  {
    cat: "Body Systems",
    question: "What does spongy bone house?",
    answer: "Bone marrow",
    choices: ["Bone marrow", "Haversian canals", "Osteocytes", "Cartilage"]
  },
  {
    cat: "Body Systems",
    question: "What does bone marrow produce?",
    answer: "Blood cells",
    choices: ["Blood cells", "Calcium deposits", "Keratin fibers", "Collagen proteins"]
  },
  {
    cat: "Body Systems",
    question: "What does the Haversian canal provide to the osteocyte?",
    answer: "Nutrients",
    choices: ["Nutrients", "Calcium", "Oxygen only", "Electrical signals"]
  },
  {
    cat: "Body Systems",
    question: "What does the osteocyte regulate?",
    answer: "Bone remodeling",
    choices: ["Bone remodeling", "Blood cell production", "Calcium absorption in the gut", "Muscle contraction"]
  },
  {
    cat: "Body Systems",
    question: "A pivot joint is found in which region of the body?",
    answer: "The head",
    choices: ["The head", "The elbow", "The hip", "The knee"]
  },
  {
    cat: "Body Systems",
    question: "A hinge joint is found in which region of the body?",
    answer: "The elbow",
    choices: ["The elbow", "The head", "The hip", "The shoulder"]
  },
  {
    cat: "Body Systems",
    question: "A ball-and-socket joint is found in which region of the body?",
    answer: "The hip",
    choices: ["The hip", "The elbow", "The head", "The knee"]
  },
  {
    cat: "Body Systems",
    question: "What does the dermis of the skin contain?",
    answer: "Nerves, hair follicles, and sebaceous glands",
    choices: [
      "Nerves, hair follicles, and sebaceous glands",
      "Melanocytes, keratin, and dead skin cells",
      "Blood vessels, bone cells, and cartilage",
      "Sweat pores, fat tissue, and muscle fibers"
    ]
  },
  {
    cat: "Body Systems",
    question: "What is the major function of sweat glands?",
    answer: "Regulate body temperature",
    choices: [
      "Regulate body temperature",
      "Produce oil to moisturize the skin",
      "Filter toxins from the blood",
      "Protect against UV radiation"
    ]
  },
  {
    cat: "Body Systems",
    question: "What are fingernails and toenails made of?",
    answer: "Keratin",
    choices: ["Keratin", "Collagen", "Calcium", "Chitin"]
  },
  {
    cat: "Body Systems",
    question: "What are muscle cells called?",
    answer: "Muscle fibers",
    choices: ["Muscle fibers", "Osteocytes", "Neurons", "Epithelial cells"]
  },
  {
    cat: "Body Systems",
    question: "What is a melanoma?",
    answer: "A tumor that forms in pigment-producing skin cells",
    choices: [
      "A tumor that forms in pigment-producing skin cells",
      "A benign growth in connective tissue",
      "An infection of the sweat glands",
      "A thickening of the epidermis from UV exposure"
    ]
  },

  // Ch 35: Circulatory (#32–#35)
  {
    cat: "Circulatory",
    question: "What are the smallest blood vessels in the body?",
    answer: "Capillaries",
    choices: ["Capillaries", "Arterioles", "Venules", "Veins"]
  },
  {
    cat: "Circulatory",
    question: "What is the largest blood vessel in the body?",
    answer: "The aorta",
    choices: ["The aorta", "The vena cava", "The pulmonary artery", "The carotid artery"]
  },
  {
    cat: "Circulatory",
    question: "Arteries carry blood in which direction?",
    answer: "Away from the heart",
    choices: ["Away from the heart", "Toward the heart", "Only to the lungs", "Only to the brain"]
  },
  {
    cat: "Circulatory",
    question: "Veins carry blood in which direction?",
    answer: "Toward the heart",
    choices: ["Toward the heart", "Away from the heart", "Only from the lungs", "Only to the kidneys"]
  },
  {
    cat: "Circulatory",
    question: "What is the major function of the circulatory system?",
    answer: "Transport oxygen to all the organs in the body",
    choices: [
      "Transport oxygen to all the organs in the body",
      "Break down food into usable nutrients",
      "Filter waste products from the blood",
      "Transmit electrical impulses to muscles"
    ]
  },
  {
    cat: "Circulatory",
    question: "O positive blood has which antigens?",
    answer: "Neither A nor B antigens",
    choices: [
      "Neither A nor B antigens",
      "Only A antigens",
      "Only B antigens",
      "Both A and B antigens"
    ]
  },

  // Ch 36: Digestive & Excretory (#36–#41)
  {
    cat: "Digestive & Excretory",
    question: "Do vitamins provide energy?",
    answer: "No — they help activate enzymes",
    choices: [
      "No — they help activate enzymes",
      "Yes — they are the body's main energy source",
      "Yes — they provide more energy than carbohydrates",
      "No — they build muscle tissue directly"
    ]
  },
  {
    cat: "Digestive & Excretory",
    question: "What do the kidneys regulate during filtration of blood?",
    answer: "Salt",
    choices: ["Salt", "Glucose", "Oxygen", "Cholesterol"]
  },
  {
    cat: "Digestive & Excretory",
    question: "What should urine NOT normally contain?",
    answer: "Protein",
    choices: ["Protein", "Water", "Urea", "Salt"]
  },
  {
    cat: "Digestive & Excretory",
    question: "What structure is responsible for urine leaving the body?",
    answer: "The urethra",
    choices: ["The urethra", "The ureter", "The bladder", "The kidney"]
  },
  {
    cat: "Digestive & Excretory",
    question: "How many amino acids make up proteins?",
    answer: "20",
    choices: ["20", "12", "26", "46"]
  },
  {
    cat: "Digestive & Excretory",
    question: "Where must essential amino acids come from?",
    answer: "Proteins in food",
    choices: [
      "Proteins in food",
      "The liver produces them all",
      "Vitamins and minerals",
      "Water and sunlight"
    ]
  },
  {
    cat: "Digestive & Excretory",
    question: "Which organs are responsible for chemical digestion?",
    answer: "The stomach and small intestine",
    choices: [
      "The stomach and small intestine",
      "The mouth and esophagus",
      "The large intestine and rectum",
      "The liver and gallbladder"
    ]
  },
  {
    cat: "Digestive & Excretory",
    question: "What does amylase do and where is it found?",
    answer: "Found in the mouth; changes complex carbohydrates into simple sugars",
    choices: [
      "Found in the mouth; changes complex carbohydrates into simple sugars",
      "Found in the stomach; breaks down proteins into amino acids",
      "Found in the small intestine; breaks down fats into fatty acids",
      "Found in the liver; converts glucose into glycogen"
    ]
  },
  {
    cat: "Digestive & Excretory",
    question: "What does pepsin do and where is it found?",
    answer: "Found in the stomach; breaks down proteins",
    choices: [
      "Found in the stomach; breaks down proteins",
      "Found in the mouth; breaks down starches",
      "Found in the small intestine; breaks down fats",
      "Found in the pancreas; breaks down nucleic acids"
    ]
  },
  {
    cat: "Digestive & Excretory",
    question: "What does bile do and where is it found?",
    answer: "Found in the small intestine; breaks down fats",
    choices: [
      "Found in the small intestine; breaks down fats",
      "Found in the stomach; breaks down proteins",
      "Found in the mouth; breaks down carbohydrates",
      "Found in the large intestine; absorbs water"
    ]
  },

  // Ch 38: Nervous System (#42–#44)
  {
    cat: "Nervous System",
    question: "Where do reasoning and memory occur?",
    answer: "The cerebrum",
    choices: ["The cerebrum", "The cerebellum", "The medulla oblongata", "The spinal cord"]
  },
  {
    cat: "Nervous System",
    question: "Light enters the eye through which structure first?",
    answer: "The pupil",
    choices: ["The pupil", "The lens", "The retina", "The optic nerve"]
  },
  {
    cat: "Nervous System",
    question: "After passing through the lens, where does light land in the eye?",
    answer: "The retina",
    choices: ["The retina", "The optic nerve", "The iris", "The pupil"]
  },
  {
    cat: "Nervous System",
    question: "What converts light to electrical signals in the eye?",
    answer: "Photoreceptors in the retina",
    choices: [
      "Photoreceptors in the retina",
      "The lens",
      "The optic nerve",
      "The pupil"
    ]
  },
  {
    cat: "Nervous System",
    question: "What does the CNS include?",
    answer: "The brain and spinal cord",
    choices: [
      "The brain and spinal cord",
      "The cranial and spinal nerves",
      "The sympathetic and parasympathetic systems",
      "The sensory and motor neurons"
    ]
  },
  {
    cat: "Nervous System",
    question: "What does the peripheral nervous system include?",
    answer: "The cranial and spinal nerves",
    choices: [
      "The cranial and spinal nerves",
      "The brain and spinal cord",
      "The cerebrum and cerebellum",
      "The medulla and pons"
    ]
  },
  {
    cat: "Nervous System",
    question: "A neuron has what main parts?",
    answer: "A cell body and a nucleus",
    choices: [
      "A cell body and a nucleus",
      "An axon and a synapse only",
      "A dendrite and a capsid",
      "A membrane and a vacuole"
    ]
  },

  // Word Bank terms (#1–#7 from word bank) — fill in the blank
  {
    cat: "Word Bank",
    question: "__________ : an organism that feeds on dead matter.",
    answer: "saprophyte"
  },
  {
    cat: "Word Bank",
    question: "__________ : the science dealing with the description, identification, naming, and classifying organisms.",
    answer: "taxonomy"
  },
  {
    cat: "Word Bank",
    question: "__________ : a thick internal wall, made of several hard layers, produced by the bacterium, that encloses its DNA and other essential parts.",
    answer: "endospore"
  },
  {
    cat: "Word Bank",
    question: "__________ : mostly microscopic photosynthetic organisms that drift or swim near the surface of ponds, lakes, and oceans.",
    answer: "phytoplankton"
  },
  {
    cat: "Word Bank",
    question: "__________ : animal-like protists.",
    answer: "protozoans"
  },
  {
    cat: "Word Bank",
    question: "__________ : plant-like protists.",
    answer: "algae"
  },
  {
    cat: "Word Bank",
    question: "__________ : large, multicellular marine algae.",
    answer: "seaweeds"
  },
];
