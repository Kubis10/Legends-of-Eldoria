import Phaser from 'phaser';
import GameState from '../GameState';

export default class PauseMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseMenuScene' });
        this._escKey = null;
        this._onEscDown = null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Półprzezroczyste tło
        this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
            .setOrigin(0)
            .setScrollFactor(0);

        // Panel menu (dedykowany panel dla pauzy)
        this.add.image(width / 2, height / 2, 'ui_panel_pause');

        // Tytuł
        this.add.text(width / 2, height / 2 - 100, 'PAUZA', {
            fontFamily: 'Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Przyciski (dobrze rozłożone w większym panelu)
        this.createButton(width / 2, height / 2 - 30, 'Wznów grę', () => {
            this.resumeGame();
        }, 0x27ae60);

        this.createButton(width / 2, height / 2 + 40, 'Zapisz grę', () => {
            GameState.saveGame();
            this.showSaveMessage();
        }, 0x3498db);

        this.createButton(width / 2, height / 2 + 110, 'Wyjdź do menu', () => {
            this.exitToMenu();
        }, 0xe74c3c);

        // ESC should close the pause menu (toggle behavior)
        this._onEscDown = () => this.resumeGame();
        this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this._escKey.on('down', this._onEscDown, this);

        // Clean up listeners when the scene is shut down or destroyed
        this.events.once('shutdown', this._cleanupInput, this);
        this.events.once('destroy', this._cleanupInput, this);
    }

    createButton(x, y, text, onClick, color = 0x3498db) {
        const button = this.add.container(x, y);

        const bg = this.add.image(0, 0, 'ui_button_large')
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setTint(0xf7c66a);
            this.tweens.add({
                targets: button,
                scale: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.clearTint();
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

    _cleanupInput() {
        if (this._escKey) {
            this._escKey.off('down', this._onEscDown, this);
            this.input.keyboard.removeKey(this._escKey);
            this._escKey = null;
        }
        this._onEscDown = null;
    }
}
