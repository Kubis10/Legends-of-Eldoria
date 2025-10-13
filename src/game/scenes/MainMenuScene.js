import Phaser from 'phaser';
import GameState from '../GameState';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Tło
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // Tytuł gry
        const title = this.add.text(width / 2, height / 4, 'LEGENDS OF ELDORIA', {
            fontFamily: 'Arial',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#f39c12',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Animacja tytułu
        this.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.05 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        // Przyciski menu
        const buttonY = height / 2;
        const buttonSpacing = 70;

        const hasSave = GameState.hasSave();

        if (hasSave) {
            this.createButton(width / 2, buttonY, 'Kontynuuj grę', () => {
                GameState.loadGame();
                this.scene.start('GameScene');
            });
        }

        this.createButton(width / 2, buttonY + buttonSpacing * (hasSave ? 1 : 0), 'Nowa gra', () => {
            this.scene.start('CharacterCreationScene');
        });

        this.createButton(width / 2, buttonY + buttonSpacing * (hasSave ? 2 : 1), 'Instrukcje', () => {
            this.showInstructions();
        });

        if (hasSave) {
            this.createButton(width / 2, buttonY + buttonSpacing * 3, 'Usuń zapis', () => {
                GameState.deleteSave();
                this.scene.restart();
            }, 0xe74c3c);
        }

        // Stopka
        this.add.text(width / 2, height - 30, 'Stworzone z użyciem Phaser 3 i React', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#7f8c8d'
        }).setOrigin(0.5);
    }

    createButton(x, y, text, onClick, color = 0x3498db) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 300, 50, color)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(color + 0x111111);
            this.tweens.add({
                targets: button,
                scale: 1.1,
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

    showInstructions() {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
            .setOrigin(0)
            .setInteractive();

        const panel = this.add.rectangle(width / 2, height / 2, 700, 500, 0x2c3e50)
            .setStrokeStyle(3, 0xffffff);

        const instructions = `INSTRUKCJE GRY

PORUSZANIE:
Użyj klawiszy WASD lub strzałek do poruszania się

WALKA:
Spacja - Atak podstawowy
1-4 - Użycie umiejętności
E - Interakcja z przedmiotami i NPC

UI:
I - Ekwipunek
Q - Lista questów
M - Mapa
ESC - Menu pauzy

CEL GRY:
Odkryj tajemnice Eldorii, pokonaj bossów
i ukończ główną fabułę oraz zadania poboczne!`;

        const text = this.add.text(width / 2, height / 2 - 20, instructions, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        const closeButton = this.add.text(width / 2, height / 2 + 200, 'Zamknij', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#3498db',
            fontStyle: 'bold'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        closeButton.on('pointerover', () => {
            closeButton.setColor('#5dade2');
        });

        closeButton.on('pointerout', () => {
            closeButton.setColor('#3498db');
        });

        closeButton.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            text.destroy();
            closeButton.destroy();
        });
    }
}
