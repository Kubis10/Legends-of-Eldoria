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

        // Panel ekwipunku (mniejszy i niżej)
        const panelHeight = 560;
        const panelY = height / 2 + 20; // Przesunięty niżej
        this.add.image(width / 2, panelY, 'ui_panel_inventory');

        // Tytuł (wewnątrz panelu)
        this.add.text(width / 2, panelY - panelHeight / 2 + 35, '⚔️ EKWIPUNEK ⚔️', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Sekcja statystyk gracza (lewa strona)
        this.createPlayerStats(width / 2 - 380, panelY - panelHeight / 2 + 80);

        // Sekcja założonego ekwipunku (środek-lewo)
        this.createEquippedItems(width / 2 - 150, panelY - panelHeight / 2 + 80);

        // Sekcja inwentarza (prawa strona)
        this.createInventoryGrid(width / 2 + 80, panelY - panelHeight / 2 + 80);

        // Informacje o zaznaczonym przedmiocie (dół) + pomoc
        this.itemInfoText = this.add.text(width / 2 - 250, panelY + panelHeight / 2 - 70, 'Najedź na przedmiot aby zobaczyć szczegóły\nKliknij aby użyć/założyć/zdjąć', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#d4af37',
            align: 'left',
            lineSpacing: 3
        }).setOrigin(0, 0.5);

        // Złoto
        this.add.text(width / 2 - 400, panelY + panelHeight / 2 - 30, `💰 Złoto: ${GameState.currency}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#f1c40f'
        }).setOrigin(0, 0.5);

        // Przycisk zamknięcia (kwadratowy w prawym górnym rogu)
        this.createCloseButton(width / 2 + 420, panelY - panelHeight / 2 + 30);

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
        this.add.text(x + 70, y, 'ZAŁOŻONE', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#3498db'
        }).setOrigin(0.5, 0);

        const equipment = GameState.player.equipment;
        const slots = [
            { type: 'weapon', label: '⚔️ Broń', y: 60 },
            { type: 'armor', label: '🛡️ Zbroja', y: 160 },
            { type: 'accessory', label: '💍 Akcesoria', y: 260 }
        ];

        slots.forEach(slot => {
            // Label nad slotem
            this.add.text(x + 70, y + slot.y - 25, slot.label, {
                fontFamily: 'Arial',
                fontSize: '15px',
                color: '#ecf0f1'
            }).setOrigin(0.5);

            const slotBg = this.add.image(x + 70, y + slot.y + 20, 'ui_equipped');

            const item = equipment[slot.type];
            if (item) {
                this.add.text(x + 70, y + slot.y + 20, item.name, {
                    fontFamily: 'Arial',
                    fontSize: '13px',
                    color: '#2ecc71',
                    align: 'center',
                    wordWrap: { width: 120 }
                }).setOrigin(0.5);

                slotBg.setInteractive({ useHandCursor: true });
                slotBg.on('pointerdown', () => {
                    this.unequipItem(slot.type);
                });

                slotBg.on('pointerover', () => {
                    this.showItemInfo(item);
                    slotBg.setTint(0xf7c66a);
                });

                slotBg.on('pointerout', () => {
                    this.itemInfoText.setText('');
                    slotBg.clearTint();
                });
            } else {
                this.add.text(x + 70, y + slot.y + 20, 'Pusty', {
                    fontFamily: 'Arial',
                    fontSize: '13px',
                    color: '#d4af37'
                }).setOrigin(0.5);
            }
        });
    }

    createInventoryGrid(x, y) {
        this.add.text(x + 150, y, 'PLECAK', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#3498db'
        }).setOrigin(0.5, 0);

        const inventory = GameState.inventory;
        const cols = 4;
        const rows = 5; // Zmniejszono z 6 do 5 rzędów, aby się zmieściło
        const cellSize = 75;
        const padding = 8;

        this.inventorySlots = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                const cellX = x + col * (cellSize + padding);
                const cellY = y + 40 + row * (cellSize + padding);

                const cell = this.add.image(cellX, cellY, 'ui_slot')
                    .setInteractive({ useHandCursor: true });

                if (index < inventory.length) {
                    const item = inventory[index];

                    // Ikona przedmiotu
                    const iconKey = this.getItemIconKey(item.type);
                    this.add.image(cellX, cellY - 12, iconKey).setDisplaySize(38, 38);

                    // Nazwa przedmiotu
                    this.add.text(cellX, cellY + 23, item.name, {
                        fontFamily: 'Arial',
                        fontSize: '10px',
                        color: '#ffffff',
                        align: 'center',
                        wordWrap: { width: 68 }
                    }).setOrigin(0.5);

                    cell.on('pointerover', () => {
                        this.showItemInfo(item);
                        cell.setTint(0xf7c66a);
                    });

                    cell.on('pointerout', () => {
                        this.itemInfoText.setText('');
                        cell.clearTint();
                    });

                    cell.on('pointerdown', () => {
                        this.useOrEquipItem(item, index);
                    });
                }

                this.inventorySlots.push(cell);
            }
        }
    }

    getItemIconKey(type) {
        const icons = {
            weapon: 'icon_weapon',
            armor: 'icon_armor',
            potion: 'icon_potion_red',
            accessory: 'icon_accessory',
            quest: 'icon_chest',
            gold: 'icon_gold',
            treasure: 'icon_chest'
        };
        return icons[type] || 'icon_chest';
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

        this.showMessage(`Zdjęto: ${item.name}`, 0xd4af37);

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

        const bg = this.add.image(0, 0, 'ui_button_small')
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setTint(0xf7c66a);
        });

        bg.on('pointerout', () => {
            bg.clearTint();
        });

        bg.on('pointerdown', onClick);

        return button;
    }

    createCloseButton(x, y) {
        const button = this.add.container(x, y);

        const bg = this.add.image(0, 0, 'ui_button_close')
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, '×', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setTint(0xff6b6b);
        });

        bg.on('pointerout', () => {
            bg.clearTint();
        });

        bg.on('pointerdown', () => {
            this.close();
        });

        return button;
    }

    close() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
