import { CategoryCard, DeckName, MetaCategoryPreset } from '../types/game';

export const DECK_CATEGORIES: readonly DeckName[] = [
  'Everyday',
  'Food & Drink',
  'Classic',
  'Pop Culture',
  'Geography & Nature',
  'Kids Mode',
  'Boomers (50s-70s)',
  'Gen X (80s-90s)',
  'Millennials (90s-00s)',
  'Gen Z & Alpha',
  'Sports & Games',
  'Music & Hits',
  'Custom'
] as const;

export const META_CATEGORY_PRESETS: MetaCategoryPreset[] = [
  {
    id: 'all-party',
    name: 'All-Ages Party Mix',
    tagline: 'Every deck enabled for a chaotic, multi-generational showdown',
    badgeColor: '#F43F5E',
    decks: [...DECK_CATEGORIES]
  },
  {
    id: 'kids-junior',
    name: 'Kids & Junior Mode',
    tagline: 'Kid-friendly topics, school, animals, treats & cartoons',
    badgeColor: '#10B981',
    decks: ['Kids Mode', 'Food & Drink']
  },
  {
    id: 'generations-clash',
    name: 'Generations Clash',
    tagline: 'Boomers vs. Gen X vs. Millennials vs. Gen Z cultural eras',
    badgeColor: '#F59E0B',
    decks: [
      'Boomers (50s-70s)',
      'Gen X (80s-90s)',
      'Millennials (90s-00s)',
      'Gen Z & Alpha'
    ]
  },
  {
    id: 'retro-throwback',
    name: 'Retro Throwback (50s–90s)',
    tagline: 'Boomers & Gen X classics, vinyl, arcades & golden-age TV',
    badgeColor: '#8B5CF6',
    decks: ['Boomers (50s-70s)', 'Gen X (80s-90s)', 'Classic']
  },
  {
    id: 'modern-pop',
    name: '2000s to Today',
    tagline: 'Millennial nostalgia, Gen Z viral hits & modern pop culture',
    badgeColor: '#06B6D4',
    decks: ['Millennials (90s-00s)', 'Gen Z & Alpha', 'Pop Culture']
  },
  {
    id: 'classic-board',
    name: 'Classic Outburst',
    tagline: 'Everyday life, food, geography & timeless board game topics',
    badgeColor: '#EC4899',
    decks: ['Everyday', 'Food & Drink', 'Classic', 'Geography & Nature']
  }
];

export const STARTER_CARDS: CategoryCard[] = [
  // ============================================================================
  // EVERYDAY
  // ============================================================================
  {
    id: 'everyday-01',
    title: 'Things Found in a Glove Compartment',
    deck: 'Everyday',
    difficulty: 'Easy',
    items: [
      "Owner's Manual",
      'Vehicle Registration',
      'Insurance Card',
      'Napkins / Tissues',
      'Flashlight',
      'Sunglasses',
      'Tire Pressure Gauge',
      'Pen',
      'Maps',
      'Ice Scraper'
    ]
  },
  {
    id: 'everyday-02',
    title: 'Excuses for Being Late to Work',
    deck: 'Everyday',
    difficulty: 'Easy',
    items: [
      'Traffic Jam',
      "Alarm Didn't Go Off",
      'Car Trouble / Flat Tire',
      'Overslept',
      'Bad Weather',
      'Train / Bus Delayed',
      'Sick Kid / Pet',
      "Doctor's Appointment",
      'Lost Keys',
      'Spilled Coffee on Shirt'
    ]
  },
  {
    id: 'everyday-03',
    title: 'Items in a Junk Drawer',
    deck: 'Everyday',
    difficulty: 'Easy',
    items: [
      'Batteries',
      'Rubber Bands',
      'Paper Clips',
      'Scotch Tape',
      'Scissors',
      'Takeout Menus',
      'Mystery Keys',
      'Super Glue',
      'Thumbtacks',
      'Measuring Tape'
    ]
  },
  {
    id: 'everyday-04',
    title: 'Things You Bring to the Beach',
    deck: 'Everyday',
    difficulty: 'Easy',
    items: [
      'Sunscreen',
      'Beach Towel',
      'Sunglasses',
      'Umbrella',
      'Cooler',
      'Flip-Flops / Sandals',
      'Swimsuit',
      'Beach Chair',
      'Boogie Board / Surfboard',
      'Book / Magazine'
    ]
  },
  {
    id: 'everyday-05',
    title: 'Things That Have Buttons',
    deck: 'Everyday',
    difficulty: 'Easy',
    items: [
      'TV Remote',
      'Dress Shirt',
      'Elevator',
      'Game Controller',
      'Calculator',
      'Microwave',
      'Jeans / Pants',
      'Vending Machine',
      'Computer Mouse',
      'Car Dashboard'
    ]
  },
  {
    id: 'everyday-06',
    title: 'Things You Do Before Going to Bed',
    deck: 'Everyday',
    difficulty: 'Easy',
    items: [
      'Brush Teeth',
      'Set an Alarm',
      'Lock the Doors',
      'Turn Off Lights',
      'Plug In Phone',
      'Put on Pajamas',
      'Wash Face',
      'Read a Book',
      'Watch TV / Scroll Phone',
      'Use the Bathroom'
    ]
  },
  {
    id: 'everyday-07',
    title: 'Things Found at a Bowling Alley',
    deck: 'Everyday',
    difficulty: 'Easy',
    items: [
      'Bowling Balls',
      'Bowling Pins',
      'Rental Shoes',
      'Gutter',
      'Scoreboard / Monitor',
      'Ball Return Machine',
      'Arcade Games',
      'Nachos / Snack Bar',
      'Pitcher of Beer',
      'Lane Oil / Wax'
    ]
  },

  // ============================================================================
  // FOOD & DRINK
  // ============================================================================
  {
    id: 'food-01',
    title: 'Standard Pizza Toppings',
    deck: 'Food & Drink',
    difficulty: 'Easy',
    items: [
      'Pepperoni',
      'Mushrooms',
      'Sausage',
      'Onions',
      'Black Olives',
      'Green Peppers',
      'Extra Cheese',
      'Bacon',
      'Pineapple',
      'Jalapeños'
    ]
  },
  {
    id: 'food-02',
    title: 'Things Found at a Salad Bar',
    deck: 'Food & Drink',
    difficulty: 'Easy',
    items: [
      'Croutons',
      'Ranch Dressing',
      'Cherry Tomatoes',
      'Cucumber Slices',
      'Shredded Carrots',
      'Bacon Bits',
      'Hard-Boiled Eggs',
      'Shredded Cheese',
      'Romaine / Iceberg Lettuce',
      'Chickpeas / Garbanzo Beans'
    ]
  },
  {
    id: 'food-03',
    title: 'Breakfast Foods',
    deck: 'Food & Drink',
    difficulty: 'Easy',
    items: [
      'Scrambled Eggs',
      'Bacon',
      'Pancakes',
      'Waffles',
      'French Toast',
      'Oatmeal',
      'Cereal',
      'Bagel with Cream Cheese',
      'Hash Browns',
      'Sausage Links'
    ]
  },
  {
    id: 'food-04',
    title: 'Popular Ice Cream Flavors',
    deck: 'Food & Drink',
    difficulty: 'Easy',
    items: [
      'Vanilla',
      'Chocolate',
      'Strawberry',
      'Mint Chocolate Chip',
      'Cookies and Cream',
      'Cookie Dough',
      'Rocky Road',
      'Butter Pecan',
      'Pistachio',
      'Coffee'
    ]
  },
  {
    id: 'food-05',
    title: 'Condiments & Sauces',
    deck: 'Food & Drink',
    difficulty: 'Easy',
    items: [
      'Ketchup',
      'Mustard',
      'Mayonnaise',
      'Relish',
      'Hot Sauce / Sriracha',
      'BBQ Sauce',
      'Soy Sauce',
      'Ranch',
      'Honey Mustard',
      'Tartar Sauce'
    ]
  },
  {
    id: 'food-06',
    title: 'Types of Pasta',
    deck: 'Food & Drink',
    difficulty: 'Medium',
    items: [
      'Spaghetti',
      'Penne',
      'Fettuccine',
      'Macaroni / Elbow',
      'Rigatoni',
      'Lasagna',
      'Ravioli',
      'Linguine',
      'Bowtie / Farfalle',
      'Tortellini'
    ]
  },

  // ============================================================================
  // CLASSIC
  // ============================================================================
  {
    id: 'classic-01',
    title: 'Things Associated with Vampires',
    deck: 'Classic',
    difficulty: 'Easy',
    items: [
      'Dracula',
      'Fangs',
      'Garlic',
      'Wooden Stake',
      'Bats',
      'Coffin',
      'Transylvania',
      'Blood',
      'No Reflection in Mirror',
      'Sunlight / Burns in Sun'
    ]
  },
  {
    id: 'classic-02',
    title: 'Events in Track and Field',
    deck: 'Classic',
    difficulty: 'Medium',
    items: [
      '100-Meter Dash',
      'Marathon',
      'Long Jump',
      'High Jump',
      'Pole Vault',
      'Shot Put',
      'Discus Throw',
      'Javelin',
      'Hurdles',
      '4x100 Relay'
    ]
  },
  {
    id: 'classic-03',
    title: 'Monopoly Board Spaces',
    deck: 'Classic',
    difficulty: 'Medium',
    items: [
      'Boardwalk',
      'Park Place',
      'Go',
      'Jail / Just Visiting',
      'Free Parking',
      'Reading Railroad',
      'B&O Railroad',
      'Chance',
      'Community Chest',
      'Luxury Tax / Income Tax'
    ]
  },
  {
    id: 'classic-04',
    title: 'Instruments in a Symphony Orchestra',
    deck: 'Classic',
    difficulty: 'Medium',
    items: [
      'Violin',
      'Cello',
      'Flute',
      'Clarinet',
      'Oboe',
      'Trumpet',
      'French Horn',
      'Trombone',
      'Timpani / Kettle Drums',
      'Harp'
    ]
  },
  {
    id: 'classic-05',
    title: 'Classic Fairy Tales',
    deck: 'Classic',
    difficulty: 'Easy',
    items: [
      'Cinderella',
      'Snow White',
      'Sleeping Beauty',
      'Little Red Riding Hood',
      'Jack and the Beanstalk',
      'Hansel and Gretel',
      'Goldilocks and the Three Bears',
      'The Three Little Pigs',
      'Rapunzel',
      'Rumpelstiltskin'
    ]
  },
  {
    id: 'classic-06',
    title: 'Poker Hands',
    deck: 'Classic',
    difficulty: 'Medium',
    items: [
      'Royal Flush',
      'Straight Flush',
      'Four of a Kind',
      'Full House',
      'Flush',
      'Straight',
      'Three of a Kind',
      'Two Pair',
      'One Pair',
      'High Card'
    ]
  },

  // ============================================================================
  // POP CULTURE
  // ============================================================================
  {
    id: 'pop-01',
    title: 'Marvel Avengers Superheroes',
    deck: 'Pop Culture',
    difficulty: 'Easy',
    items: [
      'Iron Man',
      'Captain America',
      'Thor',
      'Hulk',
      'Black Widow',
      'Hawkeye',
      'Spider-Man',
      'Doctor Strange',
      'Black Panther',
      'Scarlet Witch'
    ]
  },
  {
    id: 'pop-02',
    title: 'Classic Pixar Movies',
    deck: 'Pop Culture',
    difficulty: 'Easy',
    items: [
      'Toy Story',
      'Finding Nemo',
      'The Incredibles',
      'Monsters, Inc.',
      'Up',
      'Cars',
      'Ratatouille',
      'WALL-E',
      'Inside Out',
      'Coco'
    ]
  },
  {
    id: 'pop-03',
    title: 'Video Game Franchises',
    deck: 'Pop Culture',
    difficulty: 'Easy',
    items: [
      'Super Mario',
      'The Legend of Zelda',
      'Pokémon',
      'Call of Duty',
      'Grand Theft Auto',
      'Minecraft',
      'Halo',
      'Final Fantasy',
      'Sonic the Hedgehog',
      'Tetris'
    ]
  },
  {
    id: 'pop-04',
    title: 'Things in the Star Wars Universe',
    deck: 'Pop Culture',
    difficulty: 'Easy',
    items: [
      'Lightsaber',
      'Darth Vader',
      'Millennium Falcon',
      'Death Star',
      'The Force',
      'Yoda',
      'Stormtroopers',
      'R2-D2 / C-3PO',
      'Chewbacca',
      'Luke Skywalker'
    ]
  },
  {
    id: 'pop-05',
    title: 'Famous Sitcoms',
    deck: 'Pop Culture',
    difficulty: 'Easy',
    items: [
      'Friends',
      'Seinfeld',
      'The Office',
      'Parks and Recreation',
      'Cheers',
      'The Big Bang Theory',
      'Modern Family',
      'How I Met Your Mother',
      'Brooklyn Nine-Nine',
      'Arrested Development'
    ]
  },

  // ============================================================================
  // GEOGRAPHY & NATURE
  // ============================================================================
  {
    id: 'geo-01',
    title: 'Animals That Hibernate or Den for Winter',
    deck: 'Geography & Nature',
    difficulty: 'Medium',
    items: [
      'Bears',
      'Groundhogs / Woodchucks',
      'Bats',
      'Hedgehogs',
      'Chipmunks',
      'Frogs / Toads',
      'Snakes',
      'Turtles',
      'Skunks',
      'Bumblebees'
    ]
  },
  {
    id: 'geo-02',
    title: 'US States Bordering the Atlantic Ocean',
    deck: 'Geography & Nature',
    difficulty: 'Medium',
    items: [
      'Florida',
      'Georgia',
      'South Carolina',
      'North Carolina',
      'Virginia',
      'Maryland',
      'New Jersey',
      'New York',
      'Massachusetts',
      'Maine'
    ]
  },
  {
    id: 'geo-03',
    title: 'World Landmarks',
    deck: 'Geography & Nature',
    difficulty: 'Easy',
    items: [
      'Eiffel Tower',
      'Statue of Liberty',
      'Great Wall of China',
      'Pyramids of Giza',
      'Taj Mahal',
      'Colosseum',
      'Big Ben',
      'Machu Picchu',
      'Sydney Opera House',
      'Golden Gate Bridge'
    ]
  },
  {
    id: 'geo-04',
    title: 'Things in Our Solar System',
    deck: 'Geography & Nature',
    difficulty: 'Easy',
    items: [
      'The Sun',
      'Earth',
      'Mars',
      'Jupiter',
      'Saturn',
      'Venus',
      'Mercury',
      'Neptune',
      'Uranus',
      'Asteroid Belt / Pluto'
    ]
  },

  // ============================================================================
  // KIDS MODE (Junior / Family Friendly)
  // ============================================================================
  {
    id: 'kids-01',
    title: 'Animals on Old MacDonald\'s Farm',
    deck: 'Kids Mode',
    difficulty: 'Easy',
    items: [
      'Cow (Moo)',
      'Pig (Oink)',
      'Duck (Quack)',
      'Horse (Neigh)',
      'Sheep (Baa)',
      'Chicken / Hen (Cluck)',
      'Rooster (Cock-a-doodle-doo)',
      'Dog (Woof)',
      'Cat (Meow)',
      'Goat / Turkey'
    ]
  },
  {
    id: 'kids-02',
    title: 'Things in a Kid\'s School Backpack',
    deck: 'Kids Mode',
    difficulty: 'Easy',
    items: [
      'Pencils',
      'Crayons / Markers',
      'Lunchbox',
      'Water Bottle',
      'Notebooks / Folders',
      'Glue Stick',
      'Eraser',
      'Scissors',
      'Ruler',
      'Homework / Permission Slip'
    ]
  },
  {
    id: 'kids-03',
    title: 'Playground Equipment at Recess',
    deck: 'Kids Mode',
    difficulty: 'Easy',
    items: [
      'Swings',
      'Slide',
      'Monkey Bars',
      'Seesaw / Teeter-Totter',
      'Merry-Go-Round',
      'Sandbox',
      'Tetherball',
      'Jungle Gym / Climbing Wall',
      'Hopscotch',
      'Four Square Court'
    ]
  },
  {
    id: 'kids-04',
    title: 'Things That Can Fly',
    deck: 'Kids Mode',
    difficulty: 'Easy',
    items: [
      'Birds',
      'Airplane',
      'Helicopter',
      'Butterfly',
      'Bumblebee',
      'Bat',
      'Dragonfly',
      'Hot Air Balloon',
      'Kite',
      'Rocket Ship / Drone'
    ]
  },

  // ============================================================================
  // BOOMERS (50s-70s Nostalgia, Sports, Music & History)
  // ============================================================================
  {
    id: 'boomer-01',
    title: 'Classic 1950s & 60s TV Shows',
    deck: 'Boomers (50s-70s)',
    difficulty: 'Easy',
    items: [
      'I Love Lucy',
      'The Andy Griffith Show',
      'Leave It to Beaver',
      'Bonanza',
      'Gunsmoke',
      'The Ed Sullivan Show',
      'The Twilight Zone',
      'Gilligan\'s Island',
      'Bewitched',
      'The Beverly Hillbillies'
    ]
  },
  {
    id: 'boomer-02',
    title: 'Things at a 1950s Drive-In or Soda Fountain',
    deck: 'Boomers (50s-70s)',
    difficulty: 'Easy',
    items: [
      'Root Beer Float',
      'Chocolate Malt / Milkshake',
      'Jukebox',
      'Carhop on Roller Skates',
      'Window Speaker Box',
      'Cheeseburger & Fries',
      'Cherry Coke',
      'Banana Split',
      'Neon Sign',
      'Convertible / Hot Rod'
    ]
  },
  {
    id: 'boomer-03',
    title: 'Iconic 1960s & 70s Rock Bands & Artists',
    deck: 'Boomers (50s-70s)',
    difficulty: 'Easy',
    items: [
      'The Beatles',
      'The Rolling Stones',
      'Elvis Presley',
      'Led Zeppelin',
      'The Beach Boys',
      'Pink Floyd',
      'Jimi Hendrix',
      'The Doors',
      'Bob Dylan',
      'Fleetwood Mac'
    ]
  },
  {
    id: 'boomer-04',
    title: 'Sports Legends of the 1960s & 70s',
    deck: 'Boomers (50s-70s)',
    difficulty: 'Medium',
    items: [
      'Muhammad Ali',
      'Mickey Mantle / Hank Aaron',
      'Johnny Unitas / Joe Namath',
      'Wilt Chamberlain / Bill Russell',
      'Kareem Abdul-Jabbar',
      'Jack Nicklaus / Arnold Palmer',
      'Billie Jean King',
      'Pelé',
      'Vince Lombardi',
      'Roberto Clemente'
    ]
  },

  // ============================================================================
  // GEN X (80s-90s Arcade, Mall Culture, MTV & Blockbuster)
  // ============================================================================
  {
    id: 'genx-01',
    title: '1980s Blockbuster Movies',
    deck: 'Gen X (80s-90s)',
    difficulty: 'Easy',
    items: [
      'Back to the Future',
      'E.T. the Extra-Terrestrial',
      'Ghostbusters',
      'The Breakfast Club',
      'Ferris Bueller\'s Day Off',
      'Top Gun',
      'Raiders of the Lost Ark',
      'The Goonies',
      'Die Hard',
      'The Karate Kid'
    ]
  },
  {
    id: 'genx-02',
    title: 'Classic 1980s Arcade Games',
    deck: 'Gen X (80s-90s)',
    difficulty: 'Easy',
    items: [
      'Pac-Man / Ms. Pac-Man',
      'Donkey Kong',
      'Space Invaders',
      'Galaga',
      'Frogger',
      'Centipede',
      'Asteroids',
      'Q*bert',
      'Dig Dug',
      'Defender / Street Fighter'
    ]
  },
  {
    id: 'genx-03',
    title: 'Things Associated with 1980s & 90s Mall Culture',
    deck: 'Gen X (80s-90s)',
    difficulty: 'Easy',
    items: [
      'Food Court (Orange Julius / Sbarro)',
      'Arcade',
      'Record Store (Sam Goody / Tower)',
      'Spencer\'s Gifts',
      'Claire\'s (Ear Piercing)',
      'Photo Booth / Glamour Shots',
      'Foot Locker',
      'Fountain with Pennies',
      'Escalators',
      'Payphones'
    ]
  },

  // ============================================================================
  // MILLENNIALS (Late 90s-2000s Y2K, Early Internet & After-School TV)
  // ============================================================================
  {
    id: 'millennial-01',
    title: '90s & 2000s Kid / Teen Obsessions',
    deck: 'Millennials (90s-00s)',
    difficulty: 'Easy',
    items: [
      'Tamagotchi / Giga Pets',
      'Beanie Babies',
      'Pokémon Cards',
      'Game Boy Color',
      'Pogs / Slammers',
      'Furby',
      'walkman / CD Binder',
      'Razor Scooter',
      'Bop It / Skip-It',
      'Gel Pens / Lisa Frank'
    ]
  },
  {
    id: 'millennial-02',
    title: 'Early 2000s Internet & Tech Nostalgia',
    deck: 'Millennials (90s-00s)',
    difficulty: 'Easy',
    items: [
      'AIM (AOL Instant Messenger)',
      'MySpace (Top 8)',
      'LimeWire / Napster',
      'Dial-Up Modem Sound',
      'Motorola Razr Flip Phone',
      'iPod Classic / Click Wheel',
      'Burned Mix CDs',
      'MapQuest Printed Directions',
      'Netflix Red DVD Envelopes',
      'Windows XP / Minesweeper'
    ]
  },
  {
    id: 'millennial-03',
    title: '90s & 2000s Nickelodeon & Disney Shows',
    deck: 'Millennials (90s-00s)',
    difficulty: 'Easy',
    items: [
      'SpongeBob SquarePants',
      'Rugrats',
      'Hey Arnold!',
      'That\'s So Raven',
      'Lizzie McGuire',
      'Hannah Montana',
      'Kim Possible',
      'Drake & Josh',
      'All That / Kenan & Kel',
      'Fairly OddParents'
    ]
  },

  // ============================================================================
  // GEN Z & ALPHA (Streaming, Viral Culture, Gaming & Modern Tech)
  // ============================================================================
  {
    id: 'genz-01',
    title: 'Gen Z & Alpha Slang Terms',
    deck: 'Gen Z & Alpha',
    difficulty: 'Easy',
    items: [
      'Rizz',
      'No Cap / Cap',
      'Bet',
      'Slay',
      'Sus',
      'Bussin\'',
      'GOAT',
      'Ghosted',
      'Mid',
      'Main Character Energy / Sigma'
    ]
  },
  {
    id: 'genz-02',
    title: 'Things in Minecraft or Fortnite',
    deck: 'Gen Z & Alpha',
    difficulty: 'Easy',
    items: [
      'Creeper',
      'Diamond Pickaxe',
      'Battle Bus',
      'Chug Jug / Shield Potion',
      'Ender Dragon',
      'Victory Royale',
      'Redstone',
      'Loot Llama',
      'Steve / Crafting Table',
      'Tilted Towers / Emotes'
    ]
  },
  {
    id: 'genz-03',
    title: 'Apps on a Gen Z Smartphone Home Screen',
    deck: 'Gen Z & Alpha',
    difficulty: 'Easy',
    items: [
      'TikTok',
      'Snapchat',
      'Instagram',
      'YouTube',
      'Spotify',
      'Discord',
      'FaceTime',
      'BeReal / Pinterest',
      'Roblox',
      'Uber Eats / DoorDash'
    ]
  },

  // ============================================================================
  // SPORTS & GAMES
  // ============================================================================
  {
    id: 'sports-01',
    title: 'Positions on a Baseball Field',
    deck: 'Sports & Games',
    difficulty: 'Easy',
    items: [
      'Pitcher',
      'Catcher',
      'First Base',
      'Second Base',
      'Third Base',
      'Shortstop',
      'Left Field',
      'Center Field',
      'Right Field',
      'Designated Hitter (DH)'
    ]
  },
  {
    id: 'sports-02',
    title: 'Classic Family Board Games',
    deck: 'Sports & Games',
    difficulty: 'Easy',
    items: [
      'Monopoly',
      'Scrabble',
      'Clue',
      'Risk',
      'The Game of Life',
      'Sorry!',
      'Candy Land',
      'Catan (Settlers of Catan)',
      'Trivial Pursuit',
      'Battleship / Connect Four'
    ]
  },

  // ============================================================================
  // MUSIC & HITS
  // ============================================================================
  {
    id: 'music-01',
    title: 'Instruments in a Rock or Pop Band',
    deck: 'Music & Hits',
    difficulty: 'Easy',
    items: [
      'Lead Guitar',
      'Bass Guitar',
      'Drum Kit',
      'Lead Vocals / Microphone',
      'Keyboard / Synthesizer',
      'Acoustic Guitar',
      'Tambourine',
      'Saxophone',
      'Cowbell',
      'Backing Vocals'
    ]
  },
  {
    id: 'music-02',
    title: 'Pop Divas & Superstars',
    deck: 'Music & Hits',
    difficulty: 'Easy',
    items: [
      'Taylor Swift',
      'Beyoncé',
      'Madonna',
      'Whitney Houston',
      'Lady Gaga',
      'Rihanna',
      'Mariah Carey',
      'Ariana Grande',
      'Britney Spears',
      'Adele'
    ]
  }
];
