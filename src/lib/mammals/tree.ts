// A curated, time-calibrated slice of the mammal family tree.
//
// `mya` on a clade is the approximate age (millions of years ago) of its crown
// divergence — the point where its living members last shared an ancestor.
// Values are rounded molecular-clock medians (TimeTree 5 and recent
// phylogenomic studies); treat them as "about", not exact.

export type Status = 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX' | 'DD' | 'DOM'

export interface MammalNode {
  id: string
  name: string
  latin: string
  /** Wikipedia article title used for photos and summaries (defaults to name) */
  wiki?: string
  emoji?: string
  /** Crown age in millions of years (clades only) */
  mya?: number
  /** Approximate number of living species in the clade */
  species?: number
  blurb: string
  status?: Status
  /** Base hue for this branch; descendants inherit it */
  hue?: number
  children?: MammalNode[]
}

const leaf = (
  id: string,
  name: string,
  latin: string,
  blurb: string,
  extra: Partial<MammalNode> = {},
): MammalNode => ({ id, name, latin, blurb, ...extra })

export const MAMMAL_TREE: MammalNode = {
  id: 'mammalia',
  name: 'Mammals',
  latin: 'Mammalia',
  wiki: 'Mammal',
  mya: 180,
  species: 6700,
  hue: 196,
  blurb:
    'Warm-blooded vertebrates that nurse their young with milk, grow hair, and hear through three tiny middle-ear bones.',
  children: [
    {
      id: 'monotremata',
      name: 'Monotremes',
      latin: 'Monotremata',
      wiki: 'Monotreme',
      mya: 55,
      species: 5,
      hue: 38,
      blurb:
        'The egg-laying mammals. Their lineage split from all other mammals in the Jurassic, so they are the most distant cousins on the tree.',
      children: [
        leaf('platypus', 'Platypus', 'Ornithorhynchus anatinus', 'Hunts with its eyes shut, sensing the electric fields of prey through its bill. Males carry venomous ankle spurs.', { status: 'NT' }),
        {
          id: 'echidnas',
          name: 'Echidnas',
          latin: 'Tachyglossidae',
          wiki: 'Echidna',
          mya: 10,
          species: 4,
          blurb: 'Spiny ant-eaters whose females lay a single egg into a temporary pouch.',
          children: [
            leaf('short-echidna', 'Short-beaked echidna', 'Tachyglossus aculeatus', 'The most widespread native mammal in Australia, found from snowfields to deserts.', { status: 'LC' }),
            leaf('long-echidna', 'Western long-beaked echidna', 'Zaglossus bruijni', 'A rarely seen giant of the New Guinea highlands, hooking worms with a spiny tongue.', { status: 'CR' }),
          ],
        },
      ],
    },
    {
      id: 'theria',
      name: 'Live-bearers',
      latin: 'Theria',
      wiki: 'Theria',
      mya: 160,
      species: 6700,
      hue: 200,
      blurb: 'Marsupials and placentals — every mammal that gives birth to live young rather than laying eggs.',
      children: [
        {
          id: 'marsupialia',
          name: 'Marsupials',
          latin: 'Marsupialia',
          wiki: 'Marsupial',
          mya: 80,
          species: 380,
          hue: 12,
          blurb: 'Young are born tiny and finish developing outside the womb, usually in a pouch.',
          children: [
            leaf('opossum', 'Virginia opossum', 'Didelphis virginiana', 'The only marsupial north of Mexico. Standing in for the ~125 American opossums.', { status: 'LC' }),
            {
              id: 'australidelphia',
              name: 'Australian marsupials',
              latin: 'Australidelphia',
              wiki: 'Australidelphia',
              mya: 65,
              species: 250,
              blurb: 'The great Australian radiation — plus one surprising South American relative.',
              children: [
                leaf('monito', 'Monito del monte', 'Dromiciops gliroides', 'A tiny Chilean marsupial that is closer to kangaroos than to the opossums living on its own continent.', { status: 'NT' }),
                {
                  id: 'diprotodontia',
                  name: 'Kangaroos & kin',
                  latin: 'Diprotodontia',
                  wiki: 'Diprotodontia',
                  mya: 55,
                  species: 155,
                  emoji: '🦘',
                  blurb: 'Plant-eating marsupials with two forward-jutting lower incisors.',
                  children: [
                    leaf('red-kangaroo', 'Red kangaroo', 'Osphranter rufus', 'The largest living marsupial; it can clear 8 m in a single bound.', { emoji: '🦘', status: 'LC' }),
                    leaf('koala', 'Koala', 'Phascolarctos cinereus', 'Survives on toxic eucalyptus leaves and sleeps up to 20 hours a day.', { emoji: '🐨', status: 'EN' }),
                    leaf('wombat', 'Common wombat', 'Vombatus ursinus', 'Famous for cube-shaped droppings; its backwards pouch keeps soil out while digging.', { status: 'LC' }),
                    leaf('sugar-glider', 'Sugar glider', 'Petaurus breviceps', 'Glides up to 50 m between trees on a furry membrane.', { status: 'LC' }),
                  ],
                },
                {
                  id: 'dasyuromorphia',
                  name: 'Marsupial carnivores',
                  latin: 'Dasyuromorphia',
                  wiki: 'Dasyuromorphia',
                  mya: 35,
                  species: 75,
                  blurb: 'Australia’s meat- and insect-eating marsupials.',
                  children: [
                    leaf('tasmanian-devil', 'Tasmanian devil', 'Sarcophilus harrisii', 'Has one of the strongest bites for its size of any mammal.', { status: 'EN' }),
                    leaf('numbat', 'Numbat', 'Myrmecobius fasciatus', 'Eats up to 20,000 termites a day with a 10 cm tongue.', { status: 'EN' }),
                    leaf('thylacine', 'Thylacine', 'Thylacinus cynocephalus', 'The “Tasmanian tiger”. The last known individual died in 1936.', { status: 'EX' }),
                  ],
                },
                leaf('bilby', 'Greater bilby', 'Macrotis lagotis', 'A long-eared desert burrower representing the bandicoots (Peramelemorphia).', { status: 'VU' }),
              ],
            },
          ],
        },
        {
          id: 'placentalia',
          name: 'Placentals',
          latin: 'Placentalia',
          wiki: 'Placentalia',
          mya: 100,
          species: 6300,
          hue: 210,
          blurb: 'Young develop inside the mother, fed through a placenta. 94% of living mammal species.',
          children: [
            {
              id: 'atlantogenata',
              name: 'Southern placentals',
              latin: 'Atlantogenata',
              wiki: 'Atlantogenata',
              mya: 97,
              species: 120,
              hue: 110,
              blurb: 'Lineages that evolved in isolation on the southern continents of Africa and South America.',
              children: [
                {
                  id: 'afrotheria',
                  name: 'African placentals',
                  latin: 'Afrotheria',
                  wiki: 'Afrotheria',
                  mya: 80,
                  species: 90,
                  hue: 78,
                  blurb: 'A group recognised only from DNA: elephants turned out to be cousins of tiny tenrecs and golden moles.',
                  children: [
                    {
                      id: 'paenungulata',
                      name: 'Elephants, sea cows & hyraxes',
                      latin: 'Paenungulata',
                      wiki: 'Paenungulata',
                      mya: 67,
                      species: 12,
                      emoji: '🐘',
                      blurb: 'An unlikely trio of relatives descended from early African hoofed plant-eaters.',
                      children: [
                        leaf('hyrax', 'Rock hyrax', 'Procavia capensis', 'A rabbit-sized relative of elephants that sings complex songs.', { status: 'LC' }),
                        {
                          id: 'tethytheria',
                          name: 'Elephants & sea cows',
                          latin: 'Tethytheria',
                          wiki: 'Tethytheria',
                          mya: 64,
                          species: 7,
                          blurb: 'Named after the ancient Tethys Sea, where their shared ancestors lived.',
                          children: [
                            leaf('african-elephant', 'African bush elephant', 'Loxodonta africana', 'The largest land animal alive, weighing up to 6 tonnes.', { emoji: '🐘', status: 'EN' }),
                            leaf('asian-elephant', 'Asian elephant', 'Elephas maximus', 'Split from African elephants about 7 million years ago; closer kin to the extinct woolly mammoth.', { emoji: '🐘', status: 'EN' }),
                            leaf('manatee', 'West Indian manatee', 'Trichechus manatus', 'Its flippers still carry fingernails, a reminder of its land-dwelling ancestors.', { status: 'VU' }),
                            leaf('dugong', 'Dugong', 'Dugong dugon', 'The only strictly marine herbivorous mammal, grazing on seagrass meadows.', { status: 'VU' }),
                          ],
                        },
                      ],
                    },
                    {
                      id: 'afroinsectiphilia',
                      name: 'African insect-eaters',
                      latin: 'Afroinsectiphilia',
                      wiki: 'Afroinsectiphilia',
                      mya: 75,
                      species: 78,
                      blurb: 'Once lumped with shrews and anteaters, now known to be an ancient African branch.',
                      children: [
                        leaf('aardvark', 'Aardvark', 'Orycteropus afer', 'The last surviving member of its entire order, Tubulidentata.', { status: 'LC' }),
                        leaf('sengi', 'Rufous sengi', 'Elephantulus rufescens', 'An “elephant shrew” that is neither elephant nor shrew.', { status: 'LC' }),
                        leaf('tenrec', 'Lowland streaked tenrec', 'Hemicentetes semispinosus', 'Rubs its quills together to communicate — the only mammal known to stridulate.', { status: 'LC' }),
                        leaf('golden-mole', 'Cape golden mole', 'Chrysochloris asiatica', 'Blind and iridescent, it “swims” through sand.', { status: 'LC' }),
                      ],
                    },
                  ],
                },
                {
                  id: 'xenarthra',
                  name: 'Armadillos, sloths & anteaters',
                  latin: 'Xenarthra',
                  wiki: 'Xenarthra',
                  mya: 65,
                  species: 31,
                  hue: 132,
                  emoji: '🦥',
                  blurb: 'South American originals with extra joints in their backbones.',
                  children: [
                    {
                      id: 'cingulata',
                      name: 'Armadillos',
                      latin: 'Cingulata',
                      wiki: 'Armadillo',
                      mya: 40,
                      species: 21,
                      blurb: 'The only living mammals with a bony shell.',
                      children: [
                        leaf('nine-banded', 'Nine-banded armadillo', 'Dasypus novemcinctus', 'Almost always gives birth to identical quadruplets.', { status: 'LC' }),
                        leaf('giant-armadillo', 'Giant armadillo', 'Priodontes maximus', 'Its middle claw can reach 20 cm, the largest of any living mammal.', { status: 'VU' }),
                        leaf('pink-fairy', 'Pink fairy armadillo', 'Chlamyphorus truncatus', 'A 10 cm burrower with a rosy shell and a flat rear plate.', { status: 'LC' }),
                      ],
                    },
                    {
                      id: 'pilosa',
                      name: 'Sloths & anteaters',
                      latin: 'Pilosa',
                      wiki: 'Pilosa',
                      mya: 58,
                      species: 10,
                      blurb: 'Hairy xenarthrans without armour.',
                      children: [
                        leaf('giant-anteater', 'Giant anteater', 'Myrmecophaga tridactyla', 'Flicks its 60 cm tongue up to 150 times a minute.', { status: 'VU' }),
                        leaf('three-toed-sloth', 'Brown-throated sloth', 'Bradypus variegatus', 'So slow that algae grows in its fur, camouflaging it green.', { emoji: '🦥', status: 'LC' }),
                        leaf('two-toed-sloth', 'Linnaeus’s two-toed sloth', 'Choloepus didactylus', 'Its lineage split from three-toed sloths ~30 million years ago; tree life evolved twice.', { wiki: "Linnaeus's two-toed sloth", emoji: '🦥', status: 'LC' }),
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'boreoeutheria',
              name: 'Northern placentals',
              latin: 'Boreoeutheria',
              wiki: 'Boreoeutheria',
              mya: 94,
              species: 6180,
              hue: 230,
              blurb: 'Placentals that diversified on the northern supercontinent Laurasia — from mice to whales.',
              children: [
                {
                  id: 'euarchontoglires',
                  name: 'Primates, rodents & kin',
                  latin: 'Euarchontoglires',
                  wiki: 'Euarchontoglires',
                  mya: 90,
                  species: 3350,
                  hue: 285,
                  blurb: 'Humans share this branch with mice and rabbits — which is why mice are useful for medical research.',
                  children: [
                    {
                      id: 'glires',
                      name: 'Rodents & rabbits',
                      latin: 'Glires',
                      wiki: 'Glires',
                      mya: 85,
                      species: 2760,
                      hue: 262,
                      blurb: 'Gnawers with ever-growing front teeth.',
                      children: [
                        {
                          id: 'rodentia',
                          name: 'Rodents',
                          latin: 'Rodentia',
                          wiki: 'Rodent',
                          mya: 70,
                          species: 2650,
                          emoji: '🐭',
                          blurb: 'Four in ten mammal species are rodents.',
                          children: [
                            {
                              id: 'sciuromorpha',
                              name: 'Squirrel-like',
                              latin: 'Sciuromorpha',
                              wiki: 'Sciuromorpha',
                              mya: 55,
                              species: 330,
                              emoji: '🐿️',
                              blurb: 'Squirrels, dormice and the mountain beaver.',
                              children: [
                                leaf('red-squirrel', 'Red squirrel', 'Sciurus vulgaris', 'Buries thousands of seeds each autumn and forgets many — planting forests.', { emoji: '🐿️', status: 'LC' }),
                                leaf('prairie-dog', 'Black-tailed prairie dog', 'Cynomys ludovicianus', 'Alarm calls encode the size, shape and colour of predators.', { status: 'LC' }),
                                leaf('dormouse', 'Hazel dormouse', 'Muscardinus avellanarius', 'Hibernates for up to seven months a year.', { status: 'LC' }),
                              ],
                            },
                            {
                              id: 'mouse-related',
                              name: 'Mouse-like',
                              latin: 'Myodonta & Castorimorpha',
                              wiki: 'Myomorpha',
                              mya: 65,
                              species: 1870,
                              emoji: '🐁',
                              blurb: 'Mice, rats, hamsters and beavers.',
                              children: [
                                leaf('house-mouse', 'House mouse', 'Mus musculus', 'Split from rats ~12 million years ago; shares ~85% of protein-coding genes with us.', { emoji: '🐁', status: 'LC' }),
                                leaf('brown-rat', 'Brown rat', 'Rattus norvegicus', 'Can tread water for three days and squeeze through a 2 cm gap.', { emoji: '🐀', status: 'LC' }),
                                leaf('hamster', 'Golden hamster', 'Mesocricetus auratus', 'Nearly all pet hamsters descend from one litter caught in Syria in 1930.', { emoji: '🐹', status: 'VU' }),
                                leaf('beaver', 'North American beaver', 'Castor canadensis', 'Its iron-rich orange teeth never stop growing.', { emoji: '🦫', status: 'LC' }),
                              ],
                            },
                            {
                              id: 'hystricomorpha',
                              name: 'Porcupine-like',
                              latin: 'Hystricomorpha',
                              wiki: 'Hystricomorpha',
                              mya: 45,
                              species: 300,
                              blurb: 'Includes the cavies that rafted from Africa to South America.',
                              children: [
                                leaf('capybara', 'Capybara', 'Hydrochoerus hydrochaeris', 'The world’s largest rodent, up to 65 kg.', { status: 'LC' }),
                                leaf('guinea-pig', 'Guinea pig', 'Cavia porcellus', 'Domesticated in the Andes around 5000 BC.', { status: 'DOM' }),
                                leaf('naked-mole-rat', 'Naked mole-rat', 'Heterocephalus glaber', 'Lives over 30 years and barely ages; colonies have a single breeding queen.', { status: 'LC' }),
                                leaf('porcupine', 'Crested porcupine', 'Hystrix cristata', 'Its hollow quills rattle as a warning before it charges backwards.', { status: 'LC' }),
                              ],
                            },
                          ],
                        },
                        {
                          id: 'lagomorpha',
                          name: 'Rabbits, hares & pikas',
                          latin: 'Lagomorpha',
                          wiki: 'Lagomorpha',
                          mya: 50,
                          species: 110,
                          emoji: '🐇',
                          blurb: 'Not rodents — they have a second pair of peg-like upper incisors.',
                          children: [
                            leaf('rabbit', 'European rabbit', 'Oryctolagus cuniculus', 'Ancestor of all domestic rabbits; endangered in its native Iberia.', { emoji: '🐇', status: 'EN' }),
                            leaf('snowshoe-hare', 'Snowshoe hare', 'Lepus americanus', 'Turns white in winter; its populations cycle with lynx every ~10 years.', { status: 'LC' }),
                            leaf('pika', 'American pika', 'Ochotona princeps', 'Makes “haystacks” of dried flowers to survive alpine winters.', { status: 'LC' }),
                          ],
                        },
                      ],
                    },
                    {
                      id: 'euarchonta',
                      name: 'Primates & tree shrews',
                      latin: 'Euarchonta',
                      wiki: 'Euarchonta',
                      mya: 85,
                      species: 545,
                      hue: 318,
                      blurb: 'Tree-dwellers with grasping hands and forward-facing senses.',
                      children: [
                        leaf('treeshrew', 'Northern treeshrew', 'Tupaia belangeri', 'Its brain-to-body ratio is higher than a human’s.', { status: 'LC' }),
                        {
                          id: 'primatomorpha',
                          name: 'Primates & colugos',
                          latin: 'Primatomorpha',
                          wiki: 'Primatomorpha',
                          mya: 79,
                          species: 522,
                          blurb: 'Colugos — gliding “flying lemurs” — are our closest non-primate relatives.',
                          children: [
                            leaf('colugo', 'Sunda colugo', 'Galeopterus variegatus', 'Glides up to 100 m on a kite-like skin membrane.', { status: 'LC' }),
                            {
                              id: 'primates',
                              name: 'Primates',
                              latin: 'Primates',
                              wiki: 'Primate',
                              mya: 74,
                              species: 520,
                              emoji: '🐒',
                              blurb: 'Big brains, forward-facing eyes and nails instead of claws.',
                              children: [
                                {
                                  id: 'strepsirrhini',
                                  name: 'Lemurs & lorises',
                                  latin: 'Strepsirrhini',
                                  wiki: 'Strepsirrhini',
                                  mya: 63,
                                  species: 140,
                                  blurb: '“Wet-nosed” primates. Lemurs live only on Madagascar.',
                                  children: [
                                    leaf('ring-tailed-lemur', 'Ring-tailed lemur', 'Lemur catta', 'Males hold “stink fights”, wafting scent from their tails at rivals.', { status: 'EN' }),
                                    leaf('aye-aye', 'Aye-aye', 'Daubentonia madagascariensis', 'Taps on wood and listens for grubs, then hooks them out with a skeletal middle finger.', { status: 'EN' }),
                                    leaf('slow-loris', 'Bengal slow loris', 'Nycticebus bengalensis', 'One of the only venomous primates.', { status: 'EN' }),
                                  ],
                                },
                                {
                                  id: 'haplorhini',
                                  name: 'Tarsiers, monkeys & apes',
                                  latin: 'Haplorhini',
                                  wiki: 'Haplorhini',
                                  mya: 70,
                                  species: 380,
                                  blurb: '“Dry-nosed” primates that, like us, cannot make their own vitamin C.',
                                  children: [
                                    leaf('tarsier', 'Philippine tarsier', 'Carlito syrichta', 'Each eye is as large as its brain.', { status: 'NT' }),
                                    {
                                      id: 'simiiformes',
                                      name: 'Monkeys & apes',
                                      latin: 'Simiiformes',
                                      wiki: 'Simian',
                                      mya: 43,
                                      species: 370,
                                      emoji: '🐒',
                                      blurb: 'The anthropoids: large-brained, mostly daytime primates.',
                                      children: [
                                        {
                                          id: 'platyrrhini',
                                          name: 'New World monkeys',
                                          latin: 'Platyrrhini',
                                          wiki: 'New World monkey',
                                          mya: 20,
                                          species: 170,
                                          blurb: 'Their ancestors rafted from Africa to South America ~35 million years ago.',
                                          children: [
                                            leaf('marmoset', 'Common marmoset', 'Callithrix jacchus', 'Usually gives birth to twins that are genetic chimeras of each other.', { status: 'LC' }),
                                            leaf('capuchin', 'Tufted capuchin', 'Sapajus apella', 'Uses stone hammers and anvils to crack nuts.', { status: 'LC' }),
                                            leaf('howler', 'Mantled howler', 'Alouatta palliata', 'Its calls carry up to 5 km through the rainforest.', { status: 'VU' }),
                                          ],
                                        },
                                        {
                                          id: 'catarrhini',
                                          name: 'Old World monkeys & apes',
                                          latin: 'Catarrhini',
                                          wiki: 'Catarrhini',
                                          mya: 29,
                                          species: 200,
                                          blurb: 'Narrow, downward-pointing nostrils and full three-colour vision.',
                                          children: [
                                            {
                                              id: 'cercopithecidae',
                                              name: 'Old World monkeys',
                                              latin: 'Cercopithecidae',
                                              wiki: 'Old World monkey',
                                              mya: 18,
                                              species: 160,
                                              emoji: '🐒',
                                              blurb: 'Baboons, macaques, colobus and langurs across Africa and Asia.',
                                              children: [
                                                leaf('macaque', 'Japanese macaque', 'Macaca fuscata', 'The “snow monkey” that bathes in hot springs.', { emoji: '🐒', status: 'LC' }),
                                                leaf('mandrill', 'Mandrill', 'Mandrillus sphinx', 'The largest monkey; its colours brighten with social rank.', { status: 'VU' }),
                                                leaf('proboscis', 'Proboscis monkey', 'Nasalis larvatus', 'A strong swimmer with partly webbed feet.', { status: 'EN' }),
                                              ],
                                            },
                                            {
                                              id: 'hominoidea',
                                              name: 'Apes',
                                              latin: 'Hominoidea',
                                              wiki: 'Ape',
                                              mya: 20,
                                              species: 28,
                                              emoji: '🦍',
                                              blurb: 'Tailless primates with flexible shoulders.',
                                              children: [
                                                leaf('gibbon', 'Lar gibbon', 'Hylobates lar', 'Swings through the canopy at up to 55 km/h; mated pairs sing duets.', { status: 'EN' }),
                                                {
                                                  id: 'hominidae',
                                                  name: 'Great apes',
                                                  latin: 'Hominidae',
                                                  wiki: 'Hominidae',
                                                  mya: 16,
                                                  species: 8,
                                                  emoji: '🦧',
                                                  blurb: 'Orangutans, gorillas, chimpanzees, bonobos — and us.',
                                                  children: [
                                                    leaf('orangutan', 'Bornean orangutan', 'Pongo pygmaeus', 'Builds a fresh sleeping nest in the trees every night.', { emoji: '🦧', status: 'CR' }),
                                                    {
                                                      id: 'homininae',
                                                      name: 'African apes',
                                                      latin: 'Homininae',
                                                      wiki: 'Homininae',
                                                      mya: 9,
                                                      species: 5,
                                                      blurb: 'Gorillas, chimpanzees, bonobos and humans.',
                                                      children: [
                                                        leaf('gorilla', 'Western gorilla', 'Gorilla gorilla', 'The largest living primate; shares ~98% of its DNA with us.', { emoji: '🦍', status: 'CR' }),
                                                        {
                                                          id: 'hominini',
                                                          name: 'Humans & chimps',
                                                          latin: 'Hominini',
                                                          wiki: 'Hominini',
                                                          mya: 6.5,
                                                          species: 3,
                                                          blurb: 'Our lineage parted from the chimpanzee line roughly 6–7 million years ago.',
                                                          children: [
                                                            leaf('human', 'Human', 'Homo sapiens', 'The only surviving member of a once-bushy branch of upright apes.', { emoji: '🧍', status: 'LC' }),
                                                            {
                                                              id: 'pan',
                                                              name: 'Chimpanzees',
                                                              latin: 'Pan',
                                                              wiki: 'Pan (genus)',
                                                              mya: 2,
                                                              species: 2,
                                                              blurb: 'Split into two species when the Congo River formed a barrier.',
                                                              children: [
                                                                leaf('chimpanzee', 'Chimpanzee', 'Pan troglodytes', 'Makes and uses tools, and passes customs between generations.', { emoji: '🐵', status: 'EN' }),
                                                                leaf('bonobo', 'Bonobo', 'Pan paniscus', 'Female-led societies that resolve tension with social bonding rather than fights.', { emoji: '🐵', status: 'EN' }),
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'laurasiatheria',
                  name: 'Hoofed, clawed & winged',
                  latin: 'Laurasiatheria',
                  wiki: 'Laurasiatheria',
                  mya: 85,
                  species: 2830,
                  hue: 176,
                  blurb: 'An astonishing branch: bats, whales, cats, horses and hedgehogs all belong here.',
                  children: [
                    {
                      id: 'eulipotyphla',
                      name: 'Hedgehogs, shrews & moles',
                      latin: 'Eulipotyphla',
                      wiki: 'Eulipotyphla',
                      mya: 70,
                      species: 530,
                      hue: 150,
                      emoji: '🦔',
                      blurb: 'The true insectivores, with high metabolisms and sharp teeth.',
                      children: [
                        leaf('hedgehog', 'European hedgehog', 'Erinaceus europaeus', 'Resistant to snake venom; rolls into a ball of ~6,000 spines.', { emoji: '🦔', status: 'NT' }),
                        leaf('shrew', 'Common shrew', 'Sorex araneus', 'Shrinks its own skull and brain in winter to save energy.', { status: 'LC' }),
                        leaf('mole', 'European mole', 'Talpa europaea', 'Stores live, paralysed worms in underground larders.', { status: 'LC' }),
                      ],
                    },
                    {
                      id: 'chiroptera',
                      name: 'Bats',
                      latin: 'Chiroptera',
                      wiki: 'Bat',
                      mya: 62,
                      species: 1480,
                      hue: 250,
                      emoji: '🦇',
                      blurb: 'The only mammals capable of true flight — one in five mammal species.',
                      children: [
                        leaf('flying-fox', 'Indian flying fox', 'Pteropus medius', 'A fruit bat with a 1.5 m wingspan that navigates by sight and smell.', { emoji: '🦇', status: 'LC' }),
                        leaf('horseshoe-bat', 'Greater horseshoe bat', 'Rhinolophus ferrumequinum', 'Emits echolocation calls through its elaborate nose-leaf.', { emoji: '🦇', status: 'LC' }),
                        leaf('vampire-bat', 'Common vampire bat', 'Desmodus rotundus', 'Shares blood meals with hungry roost-mates that it knows.', { emoji: '🦇', status: 'LC' }),
                        leaf('little-brown-bat', 'Little brown bat', 'Myotis lucifugus', 'Can live over 30 years — extraordinary for an 8 g animal.', { emoji: '🦇', status: 'EN' }),
                      ],
                    },
                    {
                      id: 'ferae',
                      name: 'Carnivorans & pangolins',
                      latin: 'Ferae',
                      wiki: 'Ferae',
                      mya: 78,
                      species: 310,
                      hue: 350,
                      blurb: 'Scaly pangolins turn out to be the closest living relatives of cats and dogs.',
                      children: [
                        {
                          id: 'pholidota',
                          name: 'Pangolins',
                          latin: 'Pholidota',
                          wiki: 'Pangolin',
                          mya: 37,
                          species: 8,
                          hue: 28,
                          blurb: 'Covered in keratin scales; the most trafficked mammals on Earth.',
                          children: [
                            leaf('chinese-pangolin', 'Chinese pangolin', 'Manis pentadactyla', 'Can eat 70 million insects a year.', { status: 'CR' }),
                            leaf('ground-pangolin', 'Ground pangolin', 'Smutsia temminckii', 'Walks upright on its hind legs, balancing with its tail.', { status: 'VU' }),
                          ],
                        },
                        {
                          id: 'carnivora',
                          name: 'Carnivorans',
                          latin: 'Carnivora',
                          wiki: 'Carnivora',
                          mya: 55,
                          species: 300,
                          emoji: '🦁',
                          blurb: 'Bladelike carnassial teeth for slicing meat — though pandas went vegetarian.',
                          children: [
                            {
                              id: 'feliformia',
                              name: 'Cat-like',
                              latin: 'Feliformia',
                              wiki: 'Feliformia',
                              mya: 45,
                              species: 125,
                              emoji: '🐈',
                              blurb: 'Cats, hyenas, mongooses and civets.',
                              children: [
                                {
                                  id: 'felidae',
                                  name: 'Cats',
                                  latin: 'Felidae',
                                  wiki: 'Felidae',
                                  mya: 11,
                                  species: 41,
                                  emoji: '🐈',
                                  blurb: 'Hypercarnivores with retractable claws — from house cats to tigers in just 11 million years.',
                                  children: [
                                    leaf('lion', 'Lion', 'Panthera leo', 'The only truly social cat, living in prides.', { emoji: '🦁', status: 'VU' }),
                                    leaf('tiger', 'Tiger', 'Panthera tigris', 'The largest cat; each has a unique stripe pattern, even on its skin.', { emoji: '🐅', status: 'EN' }),
                                    leaf('snow-leopard', 'Snow leopard', 'Panthera uncia', 'Wraps its thick tail around its face like a scarf.', { status: 'VU' }),
                                    leaf('cheetah', 'Cheetah', 'Acinonyx jubatus', 'Hits 100 km/h in about three seconds.', { emoji: '🐆', status: 'VU' }),
                                    leaf('cat', 'Domestic cat', 'Felis catus', 'Descended from the African wildcat around 10,000 years ago.', { emoji: '🐈', status: 'DOM' }),
                                  ],
                                },
                                leaf('hyena', 'Spotted hyena', 'Crocuta crocuta', 'Looks dog-like but is on the cat side of the tree. Clans are led by females.', { status: 'LC' }),
                                leaf('meerkat', 'Meerkat', 'Suricata suricatta', 'A mongoose that takes turns standing sentry for its group.', { status: 'LC' }),
                              ],
                            },
                            {
                              id: 'caniformia',
                              name: 'Dog-like',
                              latin: 'Caniformia',
                              wiki: 'Caniformia',
                              mya: 48,
                              species: 175,
                              emoji: '🐕',
                              blurb: 'Dogs, bears, seals, weasels and raccoons.',
                              children: [
                                {
                                  id: 'canidae',
                                  name: 'Dogs',
                                  latin: 'Canidae',
                                  wiki: 'Canidae',
                                  mya: 12,
                                  species: 37,
                                  emoji: '🐺',
                                  blurb: 'Endurance hunters with non-retractable claws.',
                                  children: [
                                    leaf('wolf', 'Gray wolf', 'Canis lupus', 'Every domestic dog is descended from an ancient wolf population.', { emoji: '🐺', status: 'LC' }),
                                    leaf('red-fox', 'Red fox', 'Vulpes vulpes', 'Uses Earth’s magnetic field to aim its pounces.', { emoji: '🦊', status: 'LC' }),
                                    leaf('fennec', 'Fennec fox', 'Vulpes zerda', 'Its oversized ears radiate heat in the Sahara.', { emoji: '🦊', status: 'LC' }),
                                    leaf('wild-dog', 'African wild dog', 'Lycaon pictus', 'Packs “vote” on when to hunt by sneezing.', { status: 'EN' }),
                                  ],
                                },
                                {
                                  id: 'ursidae',
                                  name: 'Bears',
                                  latin: 'Ursidae',
                                  wiki: 'Bear',
                                  mya: 19,
                                  species: 8,
                                  emoji: '🐻',
                                  blurb: 'Big-bodied omnivores; the giant panda is the earliest-branching living bear.',
                                  children: [
                                    leaf('giant-panda', 'Giant panda', 'Ailuropoda melanoleuca', 'A true bear that eats bamboo up to 14 hours a day.', { emoji: '🐼', status: 'VU' }),
                                    leaf('polar-bear', 'Polar bear', 'Ursus maritimus', 'Evolved from brown bears within the last half-million years.', { emoji: '🐻‍❄️', status: 'VU' }),
                                    leaf('brown-bear', 'Brown bear', 'Ursus arctos', 'Can smell food from kilometres away.', { emoji: '🐻', status: 'LC' }),
                                  ],
                                },
                                {
                                  id: 'pinnipedia',
                                  name: 'Seals & walruses',
                                  latin: 'Pinnipedia',
                                  wiki: 'Pinniped',
                                  mya: 25,
                                  species: 34,
                                  emoji: '🦭',
                                  blurb: 'Carnivorans that returned to the sea — close cousins of bears and weasels.',
                                  children: [
                                    leaf('harbor-seal', 'Harbor seal', 'Phoca vitulina', 'Reads water currents with its whiskers to track fish in the dark.', { emoji: '🦭', status: 'LC' }),
                                    leaf('walrus', 'Walrus', 'Odobenus rosmarus', 'Uses its tusks as ice picks to haul out of the water.', { status: 'VU' }),
                                    leaf('sea-lion', 'California sea lion', 'Zalophus californianus', 'Can keep a musical beat — once thought unique to humans and parrots.', { status: 'LC' }),
                                  ],
                                },
                                {
                                  id: 'musteloidea',
                                  name: 'Weasels, raccoons & kin',
                                  latin: 'Musteloidea',
                                  wiki: 'Musteloidea',
                                  mya: 32,
                                  species: 95,
                                  emoji: '🦦',
                                  blurb: 'The most species-rich carnivoran branch.',
                                  children: [
                                    leaf('sea-otter', 'Sea otter', 'Enhydra lutris', 'Has the densest fur of any animal: ~150,000 hairs per cm².', { emoji: '🦦', status: 'EN' }),
                                    leaf('badger', 'European badger', 'Meles meles', 'Its setts can be centuries old, used by many generations.', { emoji: '🦡', status: 'LC' }),
                                    leaf('raccoon', 'Raccoon', 'Procyon lotor', 'Sensitive forepaws let it “see” with its hands.', { emoji: '🦝', status: 'LC' }),
                                    leaf('skunk', 'Striped skunk', 'Mephitis mephitis', 'Can spray accurately up to 3 m.', { emoji: '🦨', status: 'LC' }),
                                    leaf('red-panda', 'Red panda', 'Ailurus fulgens', 'Not a bear — the last survivor of its own family.', { status: 'EN' }),
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: 'euungulata',
                      name: 'Hoofed mammals',
                      latin: 'Euungulata',
                      wiki: 'Euungulata',
                      mya: 78,
                      species: 360,
                      hue: 160,
                      emoji: '🦌',
                      blurb: 'The ungulates, including whales, which evolved from hoofed ancestors.',
                      children: [
                        {
                          id: 'perissodactyla',
                          name: 'Horses, rhinos & tapirs',
                          latin: 'Perissodactyla',
                          wiki: 'Odd-toed ungulate',
                          mya: 56,
                          species: 17,
                          hue: 52,
                          emoji: '🐎',
                          blurb: 'Odd-toed ungulates, bearing weight on the middle toe.',
                          children: [
                            leaf('horse', 'Przewalski’s horse', 'Equus ferus przewalskii', 'Once extinct in the wild, reintroduced to Mongolia from zoo herds.', { wiki: "Przewalski's horse", emoji: '🐎', status: 'EN' }),
                            leaf('zebra', 'Plains zebra', 'Equus quagga', 'Stripes may deter biting flies.', { emoji: '🦓', status: 'NT' }),
                            leaf('rhino', 'White rhinoceros', 'Ceratotherium simum', 'Its horn is made of compacted keratin, like fingernails.', { emoji: '🦏', status: 'NT' }),
                            leaf('tapir', 'Malayan tapir', 'Tapirus indicus', 'Its black-and-white coat breaks up its outline at night.', { status: 'EN' }),
                          ],
                        },
                        {
                          id: 'artiodactyla',
                          name: 'Even-toed & whales',
                          latin: 'Artiodactyla',
                          wiki: 'Even-toed ungulate',
                          mya: 62,
                          species: 350,
                          hue: 172,
                          emoji: '🐄',
                          blurb: 'Pigs, camels, cattle, deer — and, surprisingly, whales and dolphins.',
                          children: [
                            {
                              id: 'tylopoda',
                              name: 'Camels & llamas',
                              latin: 'Camelidae',
                              wiki: 'Camelid',
                              mya: 16,
                              species: 7,
                              emoji: '🐪',
                              blurb: 'Camels originated in North America and walked to Asia and South America.',
                              children: [
                                leaf('dromedary', 'Dromedary', 'Camelus dromedarius', 'Can drink 100 litres of water in ten minutes.', { emoji: '🐪', status: 'DOM' }),
                                leaf('llama', 'Llama', 'Lama glama', 'Domesticated in the Andes ~4,500 years ago.', { emoji: '🦙', status: 'DOM' }),
                              ],
                            },
                            leaf('wild-boar', 'Wild boar', 'Sus scrofa', 'Ancestor of the domestic pig; representing the pig family, Suina.', { emoji: '🐗', status: 'LC' }),
                            {
                              id: 'ruminantia',
                              name: 'Ruminants',
                              latin: 'Ruminantia',
                              wiki: 'Ruminant',
                              mya: 40,
                              species: 200,
                              emoji: '🦌',
                              blurb: 'Chew the cud with multi-chambered stomachs.',
                              children: [
                                leaf('giraffe', 'Giraffe', 'Giraffa camelopardalis', 'The tallest animal, with the same seven neck vertebrae as us.', { emoji: '🦒', status: 'VU' }),
                                leaf('red-deer', 'Red deer', 'Cervus elaphus', 'Stags regrow antlers every year, up to 2.5 cm a day.', { emoji: '🦌', status: 'LC' }),
                                leaf('bison', 'American bison', 'Bison bison', 'Recovered from fewer than 1,000 animals in 1889.', { emoji: '🦬', status: 'NT' }),
                                leaf('goat', 'Goat', 'Capra hircus', 'Among the first domesticated animals, ~10,000 years ago.', { emoji: '🐐', status: 'DOM' }),
                                leaf('mouse-deer', 'Lesser mouse-deer', 'Tragulus kanchil', 'The smallest hoofed mammal, about the size of a rabbit.', { status: 'LC' }),
                              ],
                            },
                            {
                              id: 'whippomorpha',
                              name: 'Hippos & whales',
                              latin: 'Whippomorpha',
                              wiki: 'Whippomorpha',
                              mya: 55,
                              species: 95,
                              hue: 198,
                              blurb: 'DNA revealed that the closest living relatives of whales are hippos.',
                              children: [
                                leaf('hippo', 'Hippopotamus', 'Hippopotamus amphibius', 'Secretes a red “sunscreen” and can’t actually swim — it bounces along riverbeds.', { emoji: '🦛', status: 'VU' }),
                                {
                                  id: 'cetacea',
                                  name: 'Whales & dolphins',
                                  latin: 'Cetacea',
                                  wiki: 'Cetacea',
                                  mya: 35,
                                  species: 94,
                                  emoji: '🐋',
                                  blurb: 'Returned to the sea ~50 million years ago; hind legs survive as tiny internal bones.',
                                  children: [
                                    {
                                      id: 'mysticeti',
                                      name: 'Baleen whales',
                                      latin: 'Mysticeti',
                                      wiki: 'Baleen whale',
                                      mya: 25,
                                      species: 16,
                                      emoji: '🐋',
                                      blurb: 'Toothless filter-feeders — including the largest animals ever.',
                                      children: [
                                        leaf('blue-whale', 'Blue whale', 'Balaenoptera musculus', 'Up to 30 m and 190 tonnes; its heart is the size of a small car.', { emoji: '🐋', status: 'EN' }),
                                        leaf('humpback', 'Humpback whale', 'Megaptera novaeangliae', 'Males sing songs that spread across whole ocean basins.', { emoji: '🐳', status: 'LC' }),
                                        leaf('bowhead', 'Bowhead whale', 'Balaena mysticetus', 'May live over 200 years — the longest-lived mammal.', { emoji: '🐋', status: 'LC' }),
                                      ],
                                    },
                                    {
                                      id: 'odontoceti',
                                      name: 'Toothed whales',
                                      latin: 'Odontoceti',
                                      wiki: 'Toothed whale',
                                      mya: 33,
                                      species: 78,
                                      emoji: '🐬',
                                      blurb: 'Echolocating hunters, from porpoises to sperm whales.',
                                      children: [
                                        leaf('sperm-whale', 'Sperm whale', 'Physeter macrocephalus', 'Has the largest brain of any animal and dives past 2,000 m.', { emoji: '🐋', status: 'VU' }),
                                        leaf('orca', 'Orca', 'Orcinus orca', 'The largest dolphin; pods have their own dialects and hunting cultures.', { emoji: '🐬', status: 'DD' }),
                                        leaf('dolphin', 'Common bottlenose dolphin', 'Tursiops truncatus', 'Each dolphin has a signature whistle that works like a name.', { emoji: '🐬', status: 'LC' }),
                                        leaf('narwhal', 'Narwhal', 'Monodon monoceros', 'Its “horn” is a spiralled tooth packed with millions of nerve endings.', { status: 'LC' }),
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const STATUS_LABEL: Record<Status, string> = {
  LC: 'Least concern',
  NT: 'Near threatened',
  VU: 'Vulnerable',
  EN: 'Endangered',
  CR: 'Critically endangered',
  EW: 'Extinct in the wild',
  EX: 'Extinct',
  DD: 'Data deficient',
  DOM: 'Domesticated',
}

// ---------------------------------------------------------------------------
// Indexed view of the tree
// ---------------------------------------------------------------------------

export interface IndexedNode extends MammalNode {
  parentId: string | null
  depth: number
  /** Effective hue (inherited, with a small per-sibling shift) */
  h: number
  /** Node height in the time tree: crown age for clades, 0 for species */
  height: number
  /** Number of living species represented (leaves count as one) */
  count: number
}

export interface TreeIndex {
  nodes: Map<string, IndexedNode>
  root: IndexedNode
}

export function indexTree(root: MammalNode): TreeIndex {
  const nodes = new Map<string, IndexedNode>()
  const walk = (n: MammalNode, parent: IndexedNode | null, h: number) => {
    const node: IndexedNode = {
      ...n,
      parentId: parent?.id ?? null,
      depth: parent ? parent.depth + 1 : 0,
      h: n.hue ?? h,
      height: n.mya ?? 0,
      count: n.species ?? 1,
    }
    nodes.set(n.id, node)
    const kids = n.children ?? []
    kids.forEach((c, i) => walk(c, node, node.h + (i - (kids.length - 1) / 2) * 7))
  }
  walk(root, null, root.hue ?? 200)
  return { nodes, root: nodes.get(root.id)! }
}

export function pathTo(index: TreeIndex, id: string): IndexedNode[] {
  const out: IndexedNode[] = []
  let cur = index.nodes.get(id)
  while (cur) {
    out.unshift(cur)
    cur = cur.parentId ? index.nodes.get(cur.parentId) : undefined
  }
  return out
}

/** Most recent common ancestor of two nodes */
export function mrca(index: TreeIndex, a: string, b: string): IndexedNode {
  const pa = pathTo(index, a)
  const pb = pathTo(index, b)
  let i = 0
  while (i < pa.length && i < pb.length && pa[i].id === pb[i].id) i++
  return pa[i - 1]
}

/**
 * Evolutionary distance in millions of years: time from each node back to
 * their most recent common ancestor, summed.
 */
export function evoDistance(index: TreeIndex, a: string, b: string): number {
  const anc = mrca(index, a, b)
  const na = index.nodes.get(a)!
  const nb = index.nodes.get(b)!
  return anc.height - na.height + (anc.height - nb.height)
}
