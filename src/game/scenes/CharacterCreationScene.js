import Phaser from 'phaser';
import GameState from '../GameState';
import { GAME_CONFIG } from '../config';

export default class CharacterCreationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterCreationScene' });
        this.selectedRace = 'HUMAN';
        this.selectedClass = 'WARRIOR';
        this.characterName = '';
    }

    create() {
        const { width, height } = this.cameras.main;

        // Tło
        this.add.rectangle(0, 0, width, height, 0x16213e).setOrigin(0);

        // Tytuł
        this.add.text(width / 2, 40, 'STWÓRZ SWOJĄ POSTAĆ', {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Sekcja imienia
        this.createNameSection(width / 2, 120);

        // Sekcja rasy
        this.createRaceSection(width / 4, 250);

        // Sekcja klasy
        this.createClassSection(width * 3 / 4, 250);

        // Podgląd statystyk
        this.statsDisplay = this.add.text(width / 2, 480, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.updateStatsDisplay();

        // Przycisk rozpoczęcia gry (przesuń niżej)
        this.createButton(width / 2, 640, 'ROZPOCZNIJ PRZYGODĘ', () => {
            this.startGame();
        });
    }

    createNameSection(x, y) {
        this.add.text(x, y, 'Imię postaci:', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const inputBg = this.add.image(x, y + 50, 'ui_button_large').setScale(400 / 300, 50 / 50);

        this.nameText = this.add.text(x, y + 50, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Kursor migający
        this.cursor = this.add.text(x, y + 50, '|', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setVisible(false);

        // Placeholder
        this.placeholder = this.add.text(x, y + 50, 'Wpisz imię...', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#d4af37'
        }).setOrigin(0.5);

        this.inputActive = false;
        this.characterName = '';

        inputBg.setInteractive({ useHandCursor: true });
        inputBg.on('pointerdown', () => {
            this.activateInput();
        });

        // Obsługa klawiatury
        this.input.keyboard.on('keydown', (event) => {
            if (!this.inputActive) return;

            if (event.key === 'Backspace') {
                this.characterName = this.characterName.slice(0, -1);
            } else if (event.key === 'Enter') {
                this.deactivateInput();
            } else if (event.key.length === 1 && this.characterName.length < 20) {
                this.characterName += event.key;
            }

            this.updateNameDisplay();
        });

        // Animacja kursora
        this.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.cursor && this.inputActive) {
                    this.cursor.setVisible(!this.cursor.visible);
                }
            },
            loop: true
        });
    }

    activateInput() {
        this.inputActive = true;
        this.placeholder.setVisible(false);
        this.cursor.setVisible(true);
        this.updateNameDisplay();
    }

    deactivateInput() {
        this.inputActive = false;
        this.cursor.setVisible(false);
        if (this.characterName.length === 0) {
            this.placeholder.setVisible(true);
        }
    }

    updateNameDisplay() {
        this.nameText.setText(this.characterName);
        const textWidth = this.nameText.width;
        this.cursor.setPosition(this.nameText.x + textWidth / 2 + 2, this.nameText.y);

        if (this.characterName.length === 0) {
            this.placeholder.setVisible(!this.inputActive);
        } else {
            this.placeholder.setVisible(false);
        }
    }

    createRaceSection(x, y) {
        this.add.text(x, y - 30, 'WYBIERZ RASĘ', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        const races = Object.keys(GAME_CONFIG.RACES);
        const raceButtons = {};

        races.forEach((race, index) => {
            const raceData = GAME_CONFIG.RACES[race];
            const button = this.createSelectionButton(
                x,
                y + 30 + index * 70,
                raceData.name,
                race === this.selectedRace,
                () => {
                    this.selectedRace = race;
                    races.forEach(r => {
                        raceButtons[r].setSelected(r === race);
                    });
                    this.updateStatsDisplay();
                }
            );
            raceButtons[race] = button;
        });
    }

    createClassSection(x, y) {
        this.add.text(x, y - 30, 'WYBIERZ KLASĘ', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        const classes = Object.keys(GAME_CONFIG.CLASSES);
        const classButtons = {};

        classes.forEach((charClass, index) => {
            const classData = GAME_CONFIG.CLASSES[charClass];
            const button = this.createSelectionButton(
                x,
                y + 30 + index * 70,
                classData.name,
                charClass === this.selectedClass,
                () => {
                    this.selectedClass = charClass;
                    classes.forEach(c => {
                        classButtons[c].setSelected(c === charClass);
                    });
                    this.updateStatsDisplay();
                }
            );
            classButtons[charClass] = button;
        });
    }

    createSelectionButton(x, y, text, selected, onClick) {
        const container = this.add.container(x, y);

        const bg = this.add.image(0, 0, 'ui_button_small')
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, label]);

        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', onClick);

        container.setSelected = (isSelected) => {
            if (isSelected) bg.setTint(0x70e1a8); else bg.clearTint();
        };

        return container;
    }

    updateStatsDisplay() {
        const raceData = GAME_CONFIG.RACES[this.selectedRace];
        const classData = GAME_CONFIG.CLASSES[this.selectedClass];

        const totalHealth = classData.health + (raceData.healthBonus || 0);
        const totalMana = classData.mana + (raceData.manaBonus || 0);
        const totalStrength = classData.strength + (raceData.strengthBonus || 0);
        const totalDexterity = classData.dexterity + (raceData.dexterityBonus || 0);
        const totalIntelligence = classData.intelligence;

        const stats = `STATYSTYKI POCZĄTKOWE:

Zdrowie: ${totalHealth}
Mana: ${totalMana}
Siła: ${totalStrength}
Zręczność: ${totalDexterity}
Inteligencja: ${totalIntelligence}`;

        this.statsDisplay.setText(stats);
    }

    createButton(x, y, text, onClick) {
        const button = this.add.container(x, y);

        const bg = this.add.image(0, 0, 'ui_button_large')
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Dopasuj szerokość przycisku do długości tekstu (z zapasem)
        const baseWidth = 300;
        const padding = 60; // pikseli zapasu po bokach
        const desiredWidth = Math.max(baseWidth, Math.ceil(label.width + padding));
        const scaleX = desiredWidth / baseWidth;
        bg.setScale(scaleX, 1);

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

    startGame() {
        if (!this.characterName || this.characterName.length === 0) {
            this.showError('Proszę wprowadzić imię postaci!');
            return;
        }

        const raceData = GAME_CONFIG.RACES[this.selectedRace];
        const classData = GAME_CONFIG.CLASSES[this.selectedClass];

        const attributes = {
            health: classData.health + (raceData.healthBonus || 0),
            mana: classData.mana + (raceData.manaBonus || 0),
            strength: classData.strength + (raceData.strengthBonus || 0),
            dexterity: classData.dexterity + (raceData.dexterityBonus || 0),
            intelligence: classData.intelligence
        };

        GameState.createPlayer(
            this.characterName,
            raceData.name,
            this.selectedClass,
            attributes
        );

        GameState.saveGame();
        this.scene.start('GameScene');
    }

    showError(message) {
        const { width, height } = this.cameras.main;

        const errorBg = this.add.rectangle(width / 2, height / 2, 500, 150, 0x000000, 0.8);
        const errorText = this.add.text(width / 2, height / 2, message, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#e74c3c',
            align: 'center',
            wordWrap: { width: 450 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            errorBg.destroy();
            errorText.destroy();
        });

        this.tweens.add({
            targets: [errorBg, errorText],
            alpha: 0,
            duration: 500,
            delay: 1500
        });
    }
}
