import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Ładowanie ekranu ładowania
        this.load.on('progress', (value) => {
            console.log('Loading:', value);
        });

        this.load.on('complete', () => {
            console.log('Loading complete');
        });

        // Tutaj załaduj podstawowe assety
        this.createPlaceholderAssets();
    }

    create() {
        this.scene.start('MainMenuScene');
    }

    createPlaceholderAssets() {
        // Tworzenie prostych grafik jako placeholdery

        // Gracze - różne kolory dla różnych klas
        this.createRectTexture('player_warrior', 32, 32, 0x4a90e2);
        this.createRectTexture('player_mage', 32, 32, 0x9b59b6);
        this.createRectTexture('player_rogue', 32, 32, 0x2ecc71);
        this.createRectTexture('player_ranger', 32, 32, 0xe67e22);

        // Wrogowie
        this.createRectTexture('enemy_goblin', 32, 32, 0x27ae60);
        this.createRectTexture('enemy_skeleton', 32, 32, 0xbdc3c7);
        this.createRectTexture('enemy_orc', 32, 32, 0x16a085);
        this.createRectTexture('enemy_dragon', 48, 48, 0xc0392b);
        this.createRectTexture('enemy_troll', 40, 40, 0x8e44ad);

        // Tereny
        this.createRectTexture('tile_grass', 32, 32, 0x2ecc71);
        this.createRectTexture('tile_stone', 32, 32, 0x7f8c8d);
        this.createRectTexture('tile_water', 32, 32, 0x3498db);
        this.createRectTexture('tile_wall', 32, 32, 0x34495e);
        this.createRectTexture('tile_door', 32, 32, 0x95a5a6);

        // Przedmioty
        this.createRectTexture('item_sword', 24, 24, 0xe74c3c);
        this.createRectTexture('item_shield', 24, 24, 0x3498db);
        this.createRectTexture('item_potion', 16, 24, 0xe74c3c);
        this.createRectTexture('item_gold', 16, 16, 0xf1c40f);
        this.createRectTexture('item_chest', 32, 24, 0x8b4513);

        // UI
        this.createRectTexture('ui_panel', 200, 150, 0x2c3e50, 0.9);
        this.createRectTexture('ui_button', 150, 40, 0x3498db);
        this.createRectTexture('ui_healthbar', 100, 10, 0xe74c3c);
        this.createRectTexture('ui_manabar', 100, 10, 0x3498db);
    }

    createRectTexture(key, width, height, color, alpha = 1) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillRect(0, 0, width, height);
        graphics.lineStyle(2, 0x000000, 1);
        graphics.strokeRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }
}
