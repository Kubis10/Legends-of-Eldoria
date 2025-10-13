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
        this.add.text(width / 2, 50, 'STWÓRZ SWOJĄ POSTAĆ', {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Sekcja imienia
        this.createNameSection(width / 2, 150);

        // Sekcja rasy
        this.createRaceSection(width / 4, 300);

        // Sekcja klasy
        this.createClassSection(width * 3 / 4, 300);

        // Podgląd statystyk
        this.statsDisplay = this.add.text(width / 2, 550, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.updateStatsDisplay();

        // Przycisk rozpoczęcia gry
        this.createButton(width / 2, height - 100, 'ROZPOCZNIJ PRZYGODĘ', () => {
            this.startGame();
        });
    }

    createNameSection(x, y) {
        this.add.text(x, y, 'Imię postaci:', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const inputBg = this.add.rectangle(x, y + 50, 400, 50, 0x2c3e50)
            .setStrokeStyle(2, 0xffffff);

        const nameText = this.add.text(x, y + 50, 'Kliknij aby wpisać...', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#7f8c8d'
        }).setOrigin(0.5);

        inputBg.setInteractive({ useHandCursor: true });
        inputBg.on('pointerdown', () => {
            const name = prompt('Wpisz imię swojej postaci:', this.characterName || '');
            if (name && name.trim().length > 0) {
                this.characterName = name.trim();
                nameText.setText(this.characterName);
                nameText.setColor('#ffffff');
            }
        });
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

        const bg = this.add.rectangle(0, 0, 250, 50, selected ? 0x27ae60 : 0x34495e)
            .setStrokeStyle(2, selected ? 0x2ecc71 : 0x7f8c8d)
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
            bg.setFillStyle(isSelected ? 0x27ae60 : 0x34495e);
            bg.setStrokeStyle(2, isSelected ? 0x2ecc71 : 0x7f8c8d);
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

        const bg = this.add.rectangle(0, 0, 400, 60, 0x27ae60)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x2ecc71);
            this.tweens.add({
                targets: button,
                scale: 1.1,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x27ae60);
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
            alert('Proszę wprowadzić imię postaci!');
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
}
