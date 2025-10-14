import Phaser from 'phaser';
import GameState from '../GameState';
import { GAME_CONFIG } from '../config';

export default class CharacterCreationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterCreationScene' });
        this.selectedRace = 'HUMAN';
        this.selectedClass = 'WARRIOR';
        this.characterName = '';
        this.characterSprite = null;
        this.characterHead = null;
        this.raceButtons = {};
        this.classButtons = {};
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

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

        // Podgląd wyglądu postaci na środku ekranu
        this.renderCharacterSprite();

        // Podświetl domyślnie wybrane przyciski
        Object.keys(this.raceButtons).forEach(r => {
            this.raceButtons[r].setSelected(r === this.selectedRace);
        });
        Object.keys(this.classButtons).forEach(c => {
            this.classButtons[c].setSelected(c === this.selectedClass);
        });
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
        this.raceButtons = {};

        races.forEach((race, index) => {
            const raceData = GAME_CONFIG.RACES[race];
            const button = this.createSelectionButton(
                x,
                y + 30 + index * 70,
                raceData.name,
                race === this.selectedRace,
                () => {
                    this.selectedRace = race;
                    Object.keys(this.raceButtons).forEach(r => {
                        this.raceButtons[r].setSelected(r === race);
                    });
                    this.updateStatsDisplay();
                    this.renderCharacterSprite();
                }
            );
            this.raceButtons[race] = button;
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
        this.classButtons = {};

        classes.forEach((charClass, index) => {
            const classData = GAME_CONFIG.CLASSES[charClass];
            const button = this.createSelectionButton(
                x,
                y + 30 + index * 70,
                classData.name,
                charClass === this.selectedClass,
                () => {
                    this.selectedClass = charClass;
                    Object.keys(this.classButtons).forEach(c => {
                        this.classButtons[c].setSelected(c === charClass);
                    });
                    this.updateStatsDisplay();
                    this.renderCharacterSprite();
                }
            );
            this.classButtons[charClass] = button;
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
            if (isSelected) bg.setTint(0xf39c12); else bg.clearTint();
        };

        return container;
    }

    renderCharacterSprite() {
        const { width } = this.cameras.main;
        // Usuń poprzedni sprite jeśli istnieje
        if (this.characterSprite) {
            this.characterSprite.destroy();
        }
        // Dobierz sprite na podstawie klasy
        const classKey = this.selectedClass.toLowerCase();
        const spriteKey = `player_${classKey}`;

        // Kolor skóry dla wybranej rasy
        const skinColors = {
            HUMAN: 0xfbe7b2,
            ELF: 0xb2fbb2,
            DWARF: 0xd1a06a,
            ORC: 0x6ad16a
        };
        const headColor = skinColors[this.selectedRace] || 0xfbe7b2;
        const recoloredKey = `${spriteKey}_head_${headColor.toString(16)}`;
        // Automatycznie wykryj bazowy kolor głowy i przefarbuj tylko region głowy
        this.ensureRecoloredTexture(spriteKey, recoloredKey, 'autoHead', headColor, 40);
        const finalKey = this.textures.exists(recoloredKey) ? recoloredKey : spriteKey;
        // Wyświetl sprite postaci na środku ekranu
        this.characterSprite = this.add.sprite(width / 2, 340, finalKey).setScale(2).setOrigin(0.5);

        // Podgląd opiera się wyłącznie na sprite – bez dodatkowej nakładki głowy
    }

    ensureRecoloredTexture(sourceKey, newKey, fromColor, toColor, tolerance = 16) {
        if (this.textures.exists(newKey)) return;
        const srcTex = this.textures.get(sourceKey);
        if (!srcTex || !srcTex.getSourceImage) return;
        const sourceImage = srcTex.getSourceImage();
        if (!sourceImage || !sourceImage.width || !sourceImage.height) return;

        const width = sourceImage.width;
        const height = sourceImage.height;

        const canvasTexture = this.textures.createCanvas(newKey, width, height);
        const ctx = canvasTexture.getContext();
        ctx.drawImage(sourceImage, 0, 0);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Region głowy (środek górnej części obrazka, koło)
        const headCenterX = Math.floor(width / 2);
        const headCenterY = Math.floor(height * 0.22);
        const headRadius = Math.floor(Math.min(width, height) * 0.22);

        let fr, fg, fb;
        if (typeof fromColor === 'string' && fromColor.toLowerCase().includes('auto')) {
            // Auto-detect base color in circular head region
            const bins = new Map();
            for (let y = headCenterY - headRadius; y <= headCenterY + headRadius; y++) {
                for (let x = headCenterX - headRadius; x <= headCenterX + headRadius; x++) {
                    if (x < 0 || x >= width || y < 0 || y >= height) continue;
                    const dx = x - headCenterX;
                    const dy = y - headCenterY;
                    if (dx * dx + dy * dy > headRadius * headRadius) continue;
                    const idx = (y * width + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    const a = data[idx + 3];
                    if (a === 0) continue;
                    const brightness = (r + g + b) / 3;
                    if (brightness < 80) continue;
                    const rq = r >> 3, gq = g >> 3, bq = b >> 3;
                    const key = (rq << 10) | (gq << 5) | bq;
                    const entry = bins.get(key) || { count: 0, rSum: 0, gSum: 0, bSum: 0 };
                    entry.count++;
                    entry.rSum += r;
                    entry.gSum += g;
                    entry.bSum += b;
                    bins.set(key, entry);
                }
            }
            let best = null;
            for (const [, v] of bins.entries()) {
                if (!best || v.count > best.count) best = v;
            }
            if (best && best.count > 0) {
                fr = Math.round(best.rSum / best.count);
                fg = Math.round(best.gSum / best.count);
                fb = Math.round(best.bSum / best.count);
            } else {
                // Domyślny bazowy kolor głowy: biel
                fr = 0xff; fg = 0xff; fb = 0xff;
            }
        } else {
            fr = (fromColor >> 16) & 0xff;
            fg = (fromColor >> 8) & 0xff;
            fb = fromColor & 0xff;
        }
        const tr = (toColor >> 16) & 0xff;
        const tg = (toColor >> 8) & 0xff;
        const tb = toColor & 0xff;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - headCenterX;
                const dy = y - headCenterY;
                if (dx * dx + dy * dy > headRadius * headRadius) continue;
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                if (a === 0) continue;
                if (Math.abs(r - fr) <= tolerance && Math.abs(g - fg) <= tolerance && Math.abs(b - fb) <= tolerance) {
                    data[i] = tr;
                    data[i + 1] = tg;
                    data[i + 2] = tb;
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
        canvasTexture.refresh();
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
