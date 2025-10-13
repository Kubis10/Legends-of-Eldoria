// System questów
export const QUESTS = {
    MAIN_QUEST_1: {
        id: 'main_1',
        title: 'Początek przygody',
        description: 'Pokonaj 5 goblinów, aby udowodnić swoją wartość.',
        type: 'main',
        objectives: [
            { type: 'kill', target: 'Goblin', count: 5, current: 0 }
        ],
        experienceReward: 150,
        goldReward: 100,
        itemReward: null
    },

    MAIN_QUEST_2: {
        id: 'main_2',
        title: 'Zagrożenie szkieletów',
        description: 'Pokonaj 3 szkielety terroryzujące okolicę.',
        type: 'main',
        objectives: [
            { type: 'kill', target: 'Szkielet', count: 3, current: 0 }
        ],
        experienceReward: 250,
        goldReward: 200,
        itemReward: null
    },

    MAIN_QUEST_3: {
        id: 'main_3',
        title: 'Pożeracz złota',
        description: 'Zbierz 500 sztuk złota na wyprawę.',
        type: 'main',
        objectives: [
            { type: 'collect_gold', count: 500, current: 0 }
        ],
        experienceReward: 200,
        goldReward: 0,
        itemReward: null
    },

    SIDE_QUEST_1: {
        id: 'side_1',
        title: 'Zbieracz skarbów',
        description: 'Otwórz 5 skrzyń ze skarbami.',
        type: 'side',
        objectives: [
            { type: 'open_chest', count: 5, current: 0 }
        ],
        experienceReward: 100,
        goldReward: 150,
        itemReward: null
    },

    SIDE_QUEST_2: {
        id: 'side_2',
        title: 'Polowanie na orków',
        description: 'Pokonaj 5 orków.',
        type: 'side',
        objectives: [
            { type: 'kill', target: 'Ork', count: 5, current: 0 }
        ],
        experienceReward: 300,
        goldReward: 250,
        itemReward: null
    },

    SIDE_QUEST_3: {
        id: 'side_3',
        title: 'Uzdrowiciel',
        description: 'Użyj 10 mikstur zdrowia.',
        type: 'side',
        objectives: [
            { type: 'use_potion', count: 10, current: 0 }
        ],
        experienceReward: 150,
        goldReward: 100,
        itemReward: null
    },

    BOSS_QUEST_1: {
        id: 'boss_1',
        title: 'Władca trolli',
        description: 'Pokonaj potężnego króla trolli.',
        type: 'boss',
        objectives: [
            { type: 'kill', target: 'Król Trolli', count: 1, current: 0 }
        ],
        experienceReward: 1000,
        goldReward: 500,
        itemReward: { name: 'Miecz Króla', type: 'weapon', damage: 50 }
    },

    BOSS_QUEST_2: {
        id: 'boss_2',
        title: 'Smocze wyzwanie',
        description: 'Pokonaj starożytnego smoka strzegącego ruin.',
        type: 'boss',
        objectives: [
            { type: 'kill', target: 'Starożytny Smok', count: 1, current: 0 }
        ],
        experienceReward: 2000,
        goldReward: 1000,
        itemReward: { name: 'Pancerz Smoka', type: 'armor', defense: 100 }
    }
};

// Dialogi z NPC
export const NPC_DIALOGUES = {
    VILLAGE_ELDER: {
        name: 'Starszy Wioski',
        greetings: [
            'Witaj, wędrowcze! Słyszałem o twoich czynach.',
            'Ah, to ty! Mam dla ciebie ważne zadanie.',
            'Dobrze cię widzieć. Potrzebuję twojej pomocy.'
        ],
        quests: ['main_1', 'main_2'],
        shop: false
    },

    MERCHANT: {
        name: 'Kupiec',
        greetings: [
            'Witaj! Mam najlepsze towary w całej Eldorii!',
            'Chcesz kupić czy sprzedać?',
            'Mam coś specjalnego dla ciebie dzisiaj.'
        ],
        quests: [],
        shop: true
    },

    BLACKSMITH: {
        name: 'Kowal',
        greetings: [
            'Potrzebujesz nowej broni?',
            'Mogę ulepszyć twój ekwipunek.',
            'Witaj w kuźni! Czym mogę służyć?'
        ],
        quests: ['side_2'],
        shop: true
    },

    MYSTERIOUS_STRANGER: {
        name: 'Tajemniczy Wędrowiec',
        greetings: [
            'Czy jesteś gotowy na prawdziwe wyzwanie?',
            'Nie każdy ma odwagę, aby zmierzyć się z tym, co cię czeka.',
            'Poznałem wielu wojowników... Czy ty jesteś inny?'
        ],
        quests: ['boss_1', 'boss_2'],
        shop: false
    }
};

// Przedmioty do kupienia
export const SHOP_ITEMS = {
    HEALTH_POTION: {
        id: 'health_potion',
        name: 'Mikstura zdrowia',
        type: 'potion',
        effect: 'heal',
        value: 50,
        price: 25,
        description: 'Przywraca 50 punktów zdrowia'
    },

    MANA_POTION: {
        id: 'mana_potion',
        name: 'Mikstura many',
        type: 'potion',
        effect: 'restore_mana',
        value: 50,
        price: 30,
        description: 'Przywraca 50 punktów many'
    },

    IRON_SWORD: {
        id: 'iron_sword',
        name: 'Żelazny miecz',
        type: 'weapon',
        damage: 25,
        price: 150,
        description: 'Solidny miecz z żelaza'
    },

    STEEL_ARMOR: {
        id: 'steel_armor',
        name: 'Stalowa zbroja',
        type: 'armor',
        defense: 30,
        price: 200,
        description: 'Wytrzymała zbroja ze stali'
    },

    ELVEN_BOW: {
        id: 'elven_bow',
        name: 'Elfi łuk',
        type: 'weapon',
        damage: 30,
        dexterityBonus: 5,
        price: 250,
        description: 'Lekki i precyzyjny łuk elfów'
    },

    MAGIC_STAFF: {
        id: 'magic_staff',
        name: 'Magiczna różdżka',
        type: 'weapon',
        damage: 35,
        intelligenceBonus: 5,
        price: 300,
        description: 'Różdżka wzmacniająca moc magii'
    },

    LEATHER_ARMOR: {
        id: 'leather_armor',
        name: 'Skórzana zbroja',
        type: 'armor',
        defense: 15,
        dexterityBonus: 3,
        price: 100,
        description: 'Lekka zbroja dla zwinnych wojowników'
    }
};

const gameContent = { QUESTS, NPC_DIALOGUES, SHOP_ITEMS };
export default gameContent;
