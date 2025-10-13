import Phaser from 'phaser';
import GameState from '../GameState';

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventoryScene' });
        this.selectedItem = null;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Półprzezroczyste tło
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
            .setOrigin(0)
            .setScrollFactor(0);

        // Panel ekwipunku
        const panelWidth = 900;
        const panelHeight = 600;
        this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x2c3e50)
            .setStrokeStyle(4, 0xf39c12);

        // Tytuł
        this.add.text(width / 2, height / 2 - 280, '⚔️ EKWIPUNEK ⚔️', {
            fontFamily: 'Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Sekcja statystyk gracza (lewa strona)
        this.createPlayerStats(width / 2 - 350, height / 2 - 200);

        // Sekcja założonego ekwipunku (środek)
        this.createEquippedItems(width / 2 - 100, height / 2 - 200);

        // Sekcja inwentarza (prawa strona)
        this.createInventoryGrid(width / 2 + 100, height / 2 - 200);

        // Informacje o zaznaczonym przedmiocie (dół)
        this.itemInfoText = this.add.text(width / 2, height / 2 + 220, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Złoto
        this.add.text(width / 2 - 400, height / 2 + 260, `💰 Złoto: ${GameState.currency}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#f1c40f'
        }).setOrigin(0, 0.5);

        // Przycisk zamknięcia
        this.createButton(width / 2 + 300, height / 2 + 260, 'Zamknij (I)', () => {
            this.close();
        }, 0xe74c3c);

        // Klawisz I do zamknięcia
        this.input.keyboard.once('keydown-I', () => {
            this.close();
        });
    }

    createPlayerStats(x, y) {
        const player = GameState.player;

        this.add.text(x, y, 'STATYSTYKI', {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#3498db'
        });

        const stats = [
            `${player.name}`,
            `Poziom: ${player.level}`,
            ``,
            `❤️ Zdrowie: ${player.attributes.maxHealth}`,
            `💙 Mana: ${player.attributes.maxMana}`,
            `💪 Siła: ${player.attributes.strength}`,
            `🎯 Zręczność: ${player.attributes.dexterity}`,
            `🧠 Inteligencja: ${player.attributes.intelligence}`,
            ``,
            `⚔️ Obrażenia: ${this.calculateDamage()}`,
            `🛡️ Obrona: ${this.calculateDefense()}`
        ];

        stats.forEach((stat, index) => {
            this.add.text(x, y + 40 + index * 25, stat, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff'
            });
        });
    }

    createEquippedItems(x, y) {
        this.add.text(x + 80, y, 'ZAŁOŻONE', {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#3498db'
        }).setOrigin(0.5, 0);

        const equipment = GameState.player.equipment;
        const slots = [
            { type: 'weapon', label: '⚔️ Broń', y: 50 },
            { type: 'armor', label: '🛡️ Zbroja', y: 130 },
            { type: 'accessory', label: '💍 Akcesoria', y: 210 }
        ];

        slots.forEach(slot => {
            const slotBg = this.add.rectangle(x + 80, y + slot.y, 140, 60, 0x34495e)
                .setStrokeStyle(2, 0x7f8c8d);

            this.add.text(x + 80, y + slot.y - 40, slot.label, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ecf0f1'
            }).setOrigin(0.5);

            const item = equipment[slot.type];
            if (item) {
                const itemText = this.add.text(x + 80, y + slot.y, item.name, {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#2ecc71',
                    align: 'center',
                    wordWrap: { width: 130 }
                }).setOrigin(0.5);

                slotBg.setInteractive({ useHandCursor: true });
                slotBg.on('pointerdown', () => {
                    this.unequipItem(slot.type);
                });

                slotBg.on('pointerover', () => {
                    this.showItemInfo(item);
                    slotBg.setStrokeStyle(2, 0xf39c12);
                });

                slotBg.on('pointerout', () => {
                    this.itemInfoText.setText('');
                    slotBg.setStrokeStyle(2, 0x7f8c8d);
                });
            } else {
                this.add.text(x + 80, y + slot.y, 'Pusty', {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#7f8c8d'
                }).setOrigin(0.5);
            }
        });
    }

    createInventoryGrid(x, y) {
        this.add.text(x + 180, y, 'PLECAK', {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#3498db'
        }).setOrigin(0.5, 0);

        const inventory = GameState.inventory;
        const cols = 4;
        const rows = 6;
        const cellSize = 80;
        const padding = 10;

        this.inventorySlots = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                const cellX = x + col * (cellSize + padding);
                const cellY = y + 50 + row * (cellSize + padding);

                const cell = this.add.rectangle(cellX, cellY, cellSize, cellSize, 0x34495e)
                    .setStrokeStyle(2, 0x7f8c8d)
                    .setInteractive({ useHandCursor: true });

                if (index < inventory.length) {
                    const item = inventory[index];

                    // Ikona przedmiotu (kolorowy kwadrat)
                    const iconColor = this.getItemColor(item.type);
                    this.add.rectangle(cellX, cellY - 10, 40, 40, iconColor);

                    // Nazwa przedmiotu
                    const nameText = this.add.text(cellX, cellY + 25, item.name, {
                        fontFamily: 'Arial',
                        fontSize: '11px',
                        color: '#ffffff',
                        align: 'center',
                        wordWrap: { width: 70 }
                    }).setOrigin(0.5);

                    cell.on('pointerover', () => {
                        this.showItemInfo(item);
                        cell.setStrokeStyle(2, 0xf39c12);
                    });

                    cell.on('pointerout', () => {
                        this.itemInfoText.setText('');
                        cell.setStrokeStyle(2, 0x7f8c8d);
                    });

                    cell.on('pointerdown', () => {
                        this.useOrEquipItem(item, index);
                    });
                }

                this.inventorySlots.push(cell);
            }
        }

        // Informacja o kontrolach
        this.add.text(x + 180, y + 430, 'Kliknij aby użyć/założyć', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#95a5a6',
            align: 'center'
        }).setOrigin(0.5);
    }

    getItemColor(type) {
        const colors = {
            weapon: 0xe74c3c,
            armor: 0x3498db,
            potion: 0x2ecc71,
            accessory: 0x9b59b6,
            quest: 0xf39c12
        };
        return colors[type] || 0x95a5a6;
    }

    showItemInfo(item) {
        let info = `${item.name}\n`;

        if (item.description) {
            info += `${item.description}\n`;
        }

        if (item.damage) {
            info += `⚔️ Obrażenia: +${item.damage}\n`;
        }

        if (item.defense) {
            info += `🛡️ Obrona: +${item.defense}\n`;
        }

        if (item.strengthBonus) {
            info += `💪 Siła: +${item.strengthBonus}\n`;
        }

        if (item.dexterityBonus) {
            info += `🎯 Zręczność: +${item.dexterityBonus}\n`;
        }

        if (item.intelligenceBonus) {
            info += `🧠 Inteligencja: +${item.intelligenceBonus}\n`;
        }

        if (item.value && item.effect === 'heal') {
            info += `❤️ Leczy: ${item.value} HP\n`;
        }

        if (item.value && item.effect === 'restore_mana') {
            info += `💙 Przywraca: ${item.value} MP\n`;
        }

        if (item.price) {
            info += `💰 Wartość: ${item.price} złota`;
        }

        this.itemInfoText.setText(info);
    }

    useOrEquipItem(item, index) {
        if (item.type === 'potion') {
            this.usePotion(item, index);
        } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
            this.equipItem(item, index);
        }
    }

    usePotion(item, index) {
        const player = GameState.player;

        if (item.effect === 'heal') {
            if (player.attributes.health >= player.attributes.maxHealth) {
                this.showMessage('Zdrowie jest pełne!', 0xe74c3c);
                return;
            }
            player.attributes.health = Math.min(
                player.attributes.health + item.value,
                player.attributes.maxHealth
            );
            this.showMessage(`+${item.value} HP`, 0x2ecc71);
        } else if (item.effect === 'restore_mana') {
            if (player.attributes.mana >= player.attributes.maxMana) {
                this.showMessage('Mana jest pełna!', 0xe74c3c);
                return;
            }
            player.attributes.mana = Math.min(
                player.attributes.mana + item.value,
                player.attributes.maxMana
            );
            this.showMessage(`+${item.value} MP`, 0x3498db);
        }

        // Usuń przedmiot z ekwipunku
        GameState.removeItem(item.id);
        GameState.saveGame();

        // Odśwież scenę
        this.scene.restart();
    }

    equipItem(item, index) {
        const player = GameState.player;
        const oldItem = player.equipment[item.type];

        // Jeśli jest już założony przedmiot tego typu, zdejmij go
        if (oldItem) {
            GameState.addItem(oldItem);
        }

        // Załóż nowy przedmiot
        GameState.equipItem(item);
        GameState.removeItem(item.id);
        GameState.saveGame();

        this.showMessage(`Założono: ${item.name}`, 0x2ecc71);

        // Odśwież scenę
        this.scene.restart();
    }

    unequipItem(type) {
        const item = GameState.player.equipment[type];
        if (!item) return;

        // Dodaj do ekwipunku
        GameState.addItem(item);
        GameState.player.equipment[type] = null;
        GameState.saveGame();

        this.showMessage(`Zdjęto: ${item.name}`, 0x95a5a6);

        // Odśwież scenę
        this.scene.restart();
    }

    calculateDamage() {
        const player = GameState.player;
        let damage = 20 + player.attributes.strength * 2;

        if (player.equipment.weapon) {
            damage += player.equipment.weapon.damage || 0;
        }

        return damage;
    }

    calculateDefense() {
        const player = GameState.player;
        let defense = player.attributes.dexterity;

        if (player.equipment.armor) {
            defense += player.equipment.armor.defense || 0;
        }

        return defense;
    }

    showMessage(text, color) {
        const { width } = this.cameras.main;
        const message = this.add.text(width / 2, 100, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontStyle: 'bold',
            color: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 50,
            duration: 2000,
            onComplete: () => message.destroy()
        });
    }

    createButton(x, y, text, onClick, color = 0x3498db) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 180, 45, color)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(color + 0x222222);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(color);
        });

        bg.on('pointerdown', onClick);

        return button;
    }

    close() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
