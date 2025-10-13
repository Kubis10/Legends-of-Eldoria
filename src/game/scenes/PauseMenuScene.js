import Phaser from 'phaser';
import GameState from '../GameState';

export default class PauseMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Półprzezroczyste tło
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setScrollFactor(0);

        // Panel menu
        this.add.rectangle(width / 2, height / 2, 500, 600, 0x2c3e50)
            .setStrokeStyle(4, 0xffffff);        // Tytuł
        this.add.text(width / 2, height / 2 - 250, 'PAUZA', {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Informacje o graczu
        const player = GameState.player;
        const infoText = `${player.name} - ${player.class}
Poziom: ${player.level}
Doświadczenie: ${player.experience}
Złoto: ${GameState.currency}

Statystyki:
HP: ${Math.floor(player.attributes.health)}/${player.attributes.maxHealth}
MP: ${Math.floor(player.attributes.mana)}/${player.attributes.maxMana}
Siła: ${player.attributes.strength}
Zręczność: ${player.attributes.dexterity}
Inteligencja: ${player.attributes.intelligence}`;

        this.add.text(width / 2, height / 2 - 100, infoText, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);

        // Przyciski
        this.createButton(width / 2, height / 2 + 130, 'Wznów grę', () => {
            this.resumeGame();
        }, 0x27ae60);

        this.createButton(width / 2, height / 2 + 200, 'Zapisz grę', () => {
            GameState.saveGame();
            this.showSaveMessage();
        }, 0x3498db);

        this.createButton(width / 2, height / 2 + 270, 'Wyjdź do menu', () => {
            this.exitToMenu();
        }, 0xe74c3c);
    }

    createButton(x, y, text, onClick, color = 0x3498db) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 300, 50, color)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(color + 0x111111);
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(color);
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: button,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: onClick
            });
        });

        return button;
    }

    resumeGame() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    showSaveMessage() {
        const { width, height } = this.cameras.main;

        const message = this.add.text(width / 2, height - 100, 'Gra zapisana!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#2ecc71',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            message.destroy();
        });
    }

    exitToMenu() {
        GameState.saveGame();
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('MainMenuScene');
    }
}
