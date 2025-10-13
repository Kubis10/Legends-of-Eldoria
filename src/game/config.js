// Główna konfiguracja gry
export const GAME_CONFIG = {
    width: 1280,
    height: 720,

    // Rasy postaci
    RACES: {
        HUMAN: { name: 'Człowiek', healthBonus: 10, manaBonus: 5, strengthBonus: 2 },
        ELF: { name: 'Elf', healthBonus: 5, manaBonus: 15, dexterityBonus: 3 },
        DWARF: { name: 'Krasnolud', healthBonus: 15, manaBonus: 0, strengthBonus: 4 },
        ORC: { name: 'Ork', healthBonus: 20, manaBonus: 0, strengthBonus: 5 }
    },

    // Klasy postaci
    CLASSES: {
        WARRIOR: {
            name: 'Wojownik',
            health: 120,
            mana: 30,
            strength: 8,
            dexterity: 4,
            intelligence: 2,
            weapon: 'sword'
        },
        MAGE: {
            name: 'Mag',
            health: 70,
            mana: 150,
            strength: 2,
            dexterity: 3,
            intelligence: 10,
            weapon: 'staff'
        },
        ROGUE: {
            name: 'Łotrzyk',
            health: 90,
            mana: 60,
            strength: 5,
            dexterity: 9,
            intelligence: 4,
            weapon: 'dagger'
        },
        RANGER: {
            name: 'Strażnik',
            health: 100,
            mana: 80,
            strength: 6,
            dexterity: 7,
            intelligence: 5,
            weapon: 'bow'
        }
    },

    // Poziomy doświadczenia
    EXPERIENCE_LEVELS: [
        0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
        4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000
    ],

    // Typy przedmiotów
    ITEM_TYPES: {
        WEAPON: 'weapon',
        ARMOR: 'armor',
        POTION: 'potion',
        QUEST: 'quest',
        TREASURE: 'treasure'
    }
};

export default GAME_CONFIG;
