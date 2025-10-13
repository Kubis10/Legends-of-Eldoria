import Phaser from 'phaser';
import GameState from '../GameState';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Tło
        this.add.rectangle(0, 0, width, height, 0x0f1722).setOrigin(0);
        // centralny panel ozdobny
        const panel = this.add.image(width / 2, height / 2, 'ui_panel_medium');
        panel.setAlpha(0.95);

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
        const buttonY = height / 2 - 40;
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
        this.add.text(width / 2, height - 30, 'Stworzone przez Jakub Przybysz', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#d4af37'
        }).setOrigin(0.5);
    }

    createButton(x, y, text, onClick, color = 0x3498db) {
        const button = this.add.container(x, y);

        const bg = this.add.image(0, 0, 'ui_button_large')
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setTint(0xf7c66a);
            this.tweens.add({
                targets: button,
                scale: 1.1,
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

    showInstructions() {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
            .setOrigin(0)
            .setInteractive();

        const panelHeight = 600;
        const panel = this.add.rectangle(width / 2, height / 2, 800, panelHeight, 0x4a2c2a)
            .setStrokeStyle(4, 0xd4af37);

        // Tytuł
        const title = this.add.text(width / 2, height / 2 - panelHeight / 2 + 50, 'INSTRUKCJE GRY', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        const instructions = `PORUSZANIE:
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

        const text = this.add.text(width / 2, height / 2 + 10, instructions, {
            fontFamily: 'Arial',
            fontSize: '17px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

        // Przycisk zamknij na dole panelu
        const closeButton = this.add.image(width / 2, height / 2 + panelHeight / 2 - 40, 'ui_button_small')
            .setInteractive({ useHandCursor: true });

        const closeText = this.add.text(width / 2, height / 2 + panelHeight / 2 - 40, 'Zamknij', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        closeButton.on('pointerover', () => {
            closeButton.setTint(0xf7c66a);
        });

        closeButton.on('pointerout', () => {
            closeButton.clearTint();
        });

        closeButton.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            text.destroy();
            closeButton.destroy();
            closeText.destroy();
        });
    }
}
