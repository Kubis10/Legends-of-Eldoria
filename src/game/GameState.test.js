import gameState from './GameState';

describe('GameState', () => {
    beforeEach(() => {
        localStorage.clear();

        gameState.player = null;
        gameState.inventory = [];
        gameState.quests = [];
        gameState.completedQuests = [];
        gameState.discoveredLocations = ['STARTING_VILLAGE'];
        gameState.defeatedEnemies = [];
        gameState.gameTime = 0;
        gameState.currency = 100;
        gameState.currentLocation = 'STARTING_VILLAGE';
        gameState.debugMode = false;
        gameState.justLeveledUp = false;
    });

    test('levels up multiple times when receiving a large amount of experience', () => {
        gameState.createPlayer('Tester', 'Człowiek', 'WARRIOR', {
            health: 120,
            mana: 30,
            strength: 8,
            dexterity: 4,
            intelligence: 2
        });

        gameState.addExperience(500);

        expect(gameState.player.level).toBe(4);
        expect(gameState.justLeveledUp).toBe(true);
    });

    test('loadGame returns false and removes save when JSON is corrupted', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        localStorage.setItem('legends_of_eldoria_save', '{broken-json');

        const loaded = gameState.loadGame();

        expect(loaded).toBe(false);
        expect(localStorage.getItem('legends_of_eldoria_save')).toBeNull();
        consoleErrorSpy.mockRestore();
    });

    test('hasSave returns false for invalid save structure', () => {
        localStorage.setItem('legends_of_eldoria_save', JSON.stringify({ foo: 'bar' }));

        expect(gameState.hasSave()).toBe(false);
    });
});
