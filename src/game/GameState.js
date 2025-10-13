// Klasa zarządzająca stanem gry
class GameState {
    constructor() {
        this.player = null;
        this.inventory = [];
        this.quests = [];
        this.completedQuests = [];
        this.discoveredLocations = [];
        this.defeatedEnemies = [];
        this.gameTime = 0;
        this.currency = 100;
    }

    // Tworzenie postaci gracza
    createPlayer(name, race, characterClass, attributes) {
        this.player = {
            name,
            race,
            class: characterClass,
            level: 1,
            experience: 0,
            attributes: {
                health: attributes.health,
                maxHealth: attributes.health,
                mana: attributes.mana,
                maxMana: attributes.mana,
                strength: attributes.strength,
                dexterity: attributes.dexterity,
                intelligence: attributes.intelligence
            },
            skills: this.getInitialSkills(characterClass),
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            position: { x: 0, y: 0 }
        };
    }

    getInitialSkills(characterClass) {
        const skills = {
            WARRIOR: [
                { name: 'Mocne uderzenie', damage: 20, manaCost: 10, cooldown: 0 },
                { name: 'Tarcza obronna', defense: 15, manaCost: 15, cooldown: 0 }
            ],
            MAGE: [
                { name: 'Kula ognia', damage: 35, manaCost: 20, cooldown: 0 },
                { name: 'Lodowy pocisk', damage: 25, manaCost: 15, cooldown: 0 }
            ],
            ROGUE: [
                { name: 'Szybki atak', damage: 15, manaCost: 8, cooldown: 0 },
                { name: 'Trucizna', damage: 10, duration: 3, manaCost: 12, cooldown: 0 }
            ],
            RANGER: [
                { name: 'Strzał przeszywający', damage: 30, manaCost: 12, cooldown: 0 },
                { name: 'Deszcz strzał', damage: 20, targets: 3, manaCost: 25, cooldown: 0 }
            ]
        };
        return skills[characterClass] || [];
    }

    // Dodawanie doświadczenia
    addExperience(amount) {
        this.player.experience += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const expNeeded = this.getExperienceForLevel(this.player.level);
        if (this.player.experience >= expNeeded) {
            this.levelUp();
        }
    }

    getExperienceForLevel(level) {
        const levels = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
        return levels[level] || levels[levels.length - 1] + (level - levels.length + 1) * 1000;
    }

    levelUp() {
        this.player.level++;

        // Zwiększenie atrybutów
        this.player.attributes.maxHealth += 10 + this.player.attributes.strength;
        this.player.attributes.maxMana += 5 + this.player.attributes.intelligence;
        this.player.attributes.strength += 1;
        this.player.attributes.dexterity += 1;
        this.player.attributes.intelligence += 1;

        // Pełne odnowienie zdrowia i many
        this.player.attributes.health = this.player.attributes.maxHealth;
        this.player.attributes.mana = this.player.attributes.maxMana;
    }

    // Zarządzanie ekwipunkiem
    addItem(item) {
        this.inventory.push(item);
    }

    removeItem(itemId) {
        this.inventory = this.inventory.filter(item => item.id !== itemId);
    }

    equipItem(item) {
        if (item.type === 'weapon') {
            this.player.equipment.weapon = item;
        } else if (item.type === 'armor') {
            this.player.equipment.armor = item;
        } else if (item.type === 'accessory') {
            this.player.equipment.accessory = item;
        }
    }

    // Zarządzanie questami
    addQuest(quest) {
        this.quests.push(quest);
    }

    completeQuest(questId) {
        const questIndex = this.quests.findIndex(q => q.id === questId);
        if (questIndex !== -1) {
            const quest = this.quests[questIndex];
            this.completedQuests.push(quest);
            this.quests.splice(questIndex, 1);

            // Nagroda za quest
            this.addExperience(quest.experienceReward);
            this.currency += quest.goldReward;
        }
    }

    // Zapisywanie i wczytywanie gry
    saveGame() {
        const saveData = {
            player: this.player,
            inventory: this.inventory,
            quests: this.quests,
            completedQuests: this.completedQuests,
            discoveredLocations: this.discoveredLocations,
            defeatedEnemies: this.defeatedEnemies,
            gameTime: this.gameTime,
            currency: this.currency,
            timestamp: Date.now()
        };
        localStorage.setItem('legends_of_eldoria_save', JSON.stringify(saveData));
        return true;
    }

    loadGame() {
        const savedData = localStorage.getItem('legends_of_eldoria_save');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.assign(this, data);
            return true;
        }
        return false;
    }

    deleteSave() {
        localStorage.removeItem('legends_of_eldoria_save');
    }

    hasSave() {
        return localStorage.getItem('legends_of_eldoria_save') !== null;
    }
}

// Singleton
const gameState = new GameState();
export default gameState;
