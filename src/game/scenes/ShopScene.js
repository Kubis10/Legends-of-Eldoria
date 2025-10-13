import Phaser from 'phaser';
import GameState from '../GameState';
import { SHOP_ITEMS } from '../data/content';

export default class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
        this.selectedItem = null;
    }

    init(data) {
        this.shopkeeper = data.shopkeeper || 'MERCHANT';
    }

    create() {
        const { width, height } = this.cameras.main;

        // Półprzezroczyste tło
        this.add.rectangle(0, 0, width, height, 0x000000, 0.85)
            .setOrigin(0)
            .setScrollFactor(0);

        // Panel sklepu
        const panelWidth = 1000;
        const panelHeight = 640;
        this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x2c3e50)
            .setStrokeStyle(4, 0xf39c12);

        // Tytuł
        const shopNames = {
            MERCHANT: '🛒 SKLEP KUPCA 🛒',
            BLACKSMITH: '⚒️ KUŹNIA ⚒️'
        };

        this.add.text(width / 2, height / 2 - 300, shopNames[this.shopkeeper] || '🛒 SKLEP 🛒', {
            fontFamily: 'Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Złoto gracza
        this.goldText = this.add.text(width / 2 - 450, height / 2 - 240, `💰 Twoje złoto: ${GameState.currency}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#f1c40f'
        });

        // Zakładki
        this.currentTab = 'buy';
        this.createTabs(width / 2, height / 2 - 200);

        // Obszar przedmiotów
        this.itemsContainer = this.add.container(0, 0);
        this.displayItems();

        // Informacje o zaznaczonym przedmiocie (dół)
        this.itemInfoText = this.add.text(width / 2, height / 2 + 250, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Przycisk zamknięcia
        this.createButton(width / 2 + 380, height / 2 - 300, 'X', () => {
            this.close();
        }, 0xe74c3c, 50, 50);
    }

    createTabs(x, y) {
        const tabs = [
            { key: 'buy', label: 'Kupuj', color: 0x27ae60 },
            { key: 'sell', label: 'Sprzedawaj', color: 0xe67e22 }
        ];

        tabs.forEach((tab, index) => {
            const tabX = x - 100 + index * 200;
            const isActive = this.currentTab === tab.key;

            const button = this.add.rectangle(tabX, y, 180, 50,
                isActive ? tab.color : 0x34495e)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, isActive ? 0xffffff : 0x7f8c8d);

            const label = this.add.text(tabX, y, tab.label, {
                fontFamily: 'Arial',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                this.currentTab = tab.key;
                this.displayItems();

                // Aktualizuj przyciski
                tabs.forEach((t, i) => {
                    const tx = x - 100 + i * 200;
                    const graphics = this.children.list.find(child =>
                        child.x === tx && child.y === y && child.type === 'Rectangle'
                    );
                    if (graphics) {
                        graphics.setFillStyle(t.key === this.currentTab ? t.color : 0x34495e);
                        graphics.setStrokeStyle(2, t.key === this.currentTab ? 0xffffff : 0x7f8c8d);
                    }
                });
            });
        });
    }

    displayItems() {
        this.itemsContainer.removeAll(true);

        let items = [];
        if (this.currentTab === 'buy') {
            items = this.getShopItems();
        } else {
            items = GameState.inventory.filter(item =>
                item.type !== 'quest' && item.price > 0
            );
        }

        const { width, height } = this.cameras.main;
        const startY = height / 2 - 130;
        const cols = 3;

        if (items.length === 0) {
            const emptyText = this.add.text(width / 2, height / 2,
                this.currentTab === 'buy' ? 'Brak przedmiotów w sprzedaży' : 'Nie masz przedmiotów do sprzedania', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#7f8c8d',
                align: 'center'
            }).setOrigin(0.5);
            this.itemsContainer.add(emptyText);
            return;
        }

        items.forEach((item, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const itemX = width / 2 - 300 + col * 300;
            const itemY = startY + row * 140;

            this.createItemCard(itemX, itemY, item);
        });
    }

    getShopItems() {
        const items = Object.values(SHOP_ITEMS);

        // Filtruj przedmioty w zależności od sprzedawcy
        if (this.shopkeeper === 'BLACKSMITH') {
            return items.filter(item =>
                item.type === 'weapon' || item.type === 'armor'
            );
        }

        return items;
    }

    createItemCard(x, y, item) {
        // Określ kolor na podstawie typu
        const typeColors = {
            weapon: 0xe74c3c,
            armor: 0x3498db,
            potion: 0x2ecc71,
            accessory: 0x9b59b6
        };
        const color = typeColors[item.type] || 0x95a5a6;

        // Tło karty
        const cardBg = this.add.rectangle(x, y, 280, 120, 0x34495e)
            .setStrokeStyle(3, color)
            .setInteractive({ useHandCursor: true });

        // Ikona przedmiotu
        const iconBg = this.add.rectangle(x - 100, y, 60, 60, color);

        // Nazwa przedmiotu
        const name = this.add.text(x - 60, y - 35, item.name, {
            fontFamily: 'Arial',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff',
            wordWrap: { width: 180 }
        }).setOrigin(0, 0.5);

        // Opis
        if (item.description) {
            const desc = this.add.text(x - 60, y - 10, item.description, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ecf0f1',
                wordWrap: { width: 180 }
            }).setOrigin(0, 0.5);
            this.itemsContainer.add(desc);
        }

        // Cena
        const priceColor = this.currentTab === 'buy' ? '#f1c40f' : '#2ecc71';
        const priceText = this.currentTab === 'buy'
            ? `Cena: ${item.price} 💰`
            : `Sprzedaj: ${Math.floor(item.price * 0.5)} 💰`;

        const price = this.add.text(x - 60, y + 35, priceText, {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: priceColor
        }).setOrigin(0, 0.5);

        // Przycisk akcji
        const btnColor = this.currentTab === 'buy' ? 0x27ae60 : 0xe67e22;
        const btnText = this.currentTab === 'buy' ? 'KUP' : 'SPRZEDAJ';

        const actionBtn = this.add.rectangle(x + 90, y, 70, 40, btnColor)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xffffff);

        const btnLabel = this.add.text(x + 90, y, btnText, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        actionBtn.on('pointerover', () => {
            actionBtn.setFillStyle(btnColor + 0x222222);
            this.showItemDetails(item);
        });

        actionBtn.on('pointerout', () => {
            actionBtn.setFillStyle(btnColor);
            this.itemInfoText.setText('');
        });

        actionBtn.on('pointerdown', () => {
            if (this.currentTab === 'buy') {
                this.buyItem(item);
            } else {
                this.sellItem(item);
            }
        });

        cardBg.on('pointerover', () => {
            cardBg.setStrokeStyle(3, 0xf39c12);
            this.showItemDetails(item);
        });

        cardBg.on('pointerout', () => {
            cardBg.setStrokeStyle(3, color);
            this.itemInfoText.setText('');
        });

        this.itemsContainer.add([cardBg, iconBg, name, price, actionBtn, btnLabel]);
    }

    showItemDetails(item) {
        let info = `${item.name}\n`;

        if (item.damage) info += `⚔️ Obrażenia: +${item.damage}  `;
        if (item.defense) info += `🛡️ Obrona: +${item.defense}  `;
        if (item.strengthBonus) info += `💪 Siła: +${item.strengthBonus}  `;
        if (item.dexterityBonus) info += `🎯 Zręczność: +${item.dexterityBonus}  `;
        if (item.intelligenceBonus) info += `🧠 Inteligencja: +${item.intelligenceBonus}  `;
        if (item.value && item.effect === 'heal') info += `❤️ Leczy: ${item.value} HP  `;
        if (item.value && item.effect === 'restore_mana') info += `💙 Przywraca: ${item.value} MP`;

        this.itemInfoText.setText(info);
    }

    buyItem(item) {
        if (GameState.currency < item.price) {
            this.showMessage('Nie masz wystarczająco złota!', 0xe74c3c);
            return;
        }

        GameState.currency -= item.price;
        GameState.addItem({ ...item, id: `item_${Date.now()}` });
        GameState.saveGame();

        this.goldText.setText(`💰 Twoje złoto: ${GameState.currency}`);
        this.showMessage(`Kupiono: ${item.name}`, 0x2ecc71);
    }

    sellItem(item) {
        const sellPrice = Math.floor(item.price * 0.5);

        GameState.currency += sellPrice;
        GameState.removeItem(item.id);
        GameState.saveGame();

        this.goldText.setText(`💰 Twoje złoto: ${GameState.currency}`);
        this.showMessage(`Sprzedano za ${sellPrice} złota`, 0x2ecc71);

        this.displayItems();
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

    createButton(x, y, text, onClick, color = 0x3498db, w = 150, h = 40) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, w, h, color)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '20px',
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
