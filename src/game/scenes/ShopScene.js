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
        const panelWidth = 800;
        const panelHeight = 600;
        const panelX = width / 2;
        const panelY = height / 2;
        this.panelWidth = panelWidth;
        this.panelHeight = panelHeight;
        this.panelX = panelX;
        this.panelY = panelY;

        // Półprzezroczyste tło
        this.add.rectangle(0, 0, width, height, 0x000000, 0.85)
            .setOrigin(0)
            .setScrollFactor(0);

        // Panel sklepu
        this.add.image(panelX, panelY, 'ui_panel_medium');

        // Tytuł
        const shopNames = {
            MERCHANT: '🛒 SKLEP KUPCA 🛒',
            BLACKSMITH: '⚒️ KUŹNIA ⚒️'
        };

        this.titleText = this.add.text(panelX, panelY - panelHeight / 2 + 36, shopNames[this.shopkeeper] || '🛒 SKLEP 🛒', {
            fontFamily: 'Arial',
            fontSize: '38px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5).setDepth(6);

        // Złoto gracza
        this.goldText = this.add.text(panelX - panelWidth / 2 + 50, panelY - panelHeight / 2 + 76, `💰 Twoje złoto: ${GameState.currency}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#f1c40f'
        }).setDepth(6);

        // Zakładki
        this.currentTab = 'buy';
        // Przesuń zakładki niżej, aby nie nakładały się na złoto
        this.createTabs(panelX, panelY - panelHeight / 2 + 152);

        // Obszar przewijanych przedmiotów (z maską)
        const maskX = panelX - panelWidth / 2 + 40;
        const maskY = panelY - panelHeight / 2 + 200; // poniżej zakładek i złota
        const maskWidth = panelWidth - 80;
        const maskHeight = panelHeight - 220; // większy dolny margines
        const maskG = this.make.graphics();
        maskG.fillStyle(0xffffff, 1);
        maskG.fillRect(maskX, maskY, maskWidth, maskHeight);
        this.itemsMask = maskG.createGeometryMask();

        this.itemsContainer = this.add.container(0, 0);
        this.itemsContainer.setMask(this.itemsMask);
        this.itemsContainer.setDepth(4);
        // Parametry scrolla
        this.scrollArea = { x: maskX, y: maskY, width: maskWidth, height: maskHeight };
        this.scrollY = 0;
        this.maxScroll = 0;
        this.displayItems();
        this.setupScrolling();

        // Informacje o zaznaczonym przedmiocie (dół)
        this.itemInfoText = this.add.text(width / 2, height - 60, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(15).setScrollFactor(0);

        // Przycisk zamknięcia (kwadratowy w prawym górnym rogu)
        this.createCloseButton(width / 2 + 370, height / 2 - 270);
    }

    createTabs(x, y) {
        const tabs = [
            { key: 'buy', label: 'Kupuj', color: 0x27ae60 },
            { key: 'sell', label: 'Sprzedawaj', color: 0xe67e22 }
        ];

        tabs.forEach((tab, index) => {
            const tabX = x - 120 + index * 240;

            const button = this.add.image(tabX, y, 'ui_button_small')
                .setInteractive({ useHandCursor: true })
                .setDepth(6);

            this.add.text(tabX, y, tab.label, {
                fontFamily: 'Arial',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(6);

            button.on('pointerdown', () => {
                this.currentTab = tab.key;
                this.displayItems();
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

        // Pierwszy wiersz 70px poniżej maski – estetyczny odstęp
        const startY = this.scrollArea.y + 70;
        // 2 kolumny wewnątrz panelu 800px
        const cols = 2;

        if (items.length === 0) {
            const emptyText = this.add.text(this.panelX, this.scrollArea.y + this.scrollArea.height / 2,
                this.currentTab === 'buy' ? 'Brak przedmiotów w sprzedaży' : 'Nie masz przedmiotów do sprzedania', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#d4af37',
                align: 'center'
            }).setOrigin(0.5);
            this.itemsContainer.add(emptyText);
            this.maxScroll = 0;
            return;
        }

        items.forEach((item, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            // Środki kolumn rozmieszczone równo wewnątrz panelu (800px)
            const colCenters = [this.panelX - 200, this.panelX + 200];
            const itemX = colCenters[col];
            const itemY = startY + row * 140;

            this.createItemCard(itemX, itemY, item);
        });

        // Oblicz maksymalny scroll
        const totalRows = Math.ceil(items.length / cols);
        const totalHeight = totalRows * 140;
        const visibleHeight = this.scrollArea.height;
        this.maxScroll = Math.max(0, totalHeight - visibleHeight);
        this.updateScroll();
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
        // Tło karty
        const cardBg = this.add.image(x, y, 'ui_card_item')
            .setInteractive({ useHandCursor: true });

        // Ikona przedmiotu
        const iconKey = this.getItemIconKey(item.type);
        const iconSprite = this.add.image(x - 100, y, iconKey).setDisplaySize(48, 48);

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
        const btnText = this.currentTab === 'buy' ? 'KUP' : 'SPRZEDAJ';

        const actionBtn = this.add.image(x + 30, y, 'ui_button_small')
            .setScale(0.8)
            .setInteractive({ useHandCursor: true });

        const btnLabel = this.add.text(x + 30, y, btnText, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        actionBtn.on('pointerover', () => {
            actionBtn.setTint(0xf7c66a);
            this.showItemDetails(item);
        });

        actionBtn.on('pointerout', () => {
            actionBtn.clearTint();
            this.itemInfoText.setText('');
            this.itemInfoText.setDepth(15); // Upewnij się, że depth jest zachowany
        });

        actionBtn.on('pointerdown', () => {
            if (this.currentTab === 'buy') {
                this.buyItem(item);
            } else {
                this.sellItem(item);
            }
        });

        cardBg.on('pointerover', () => {
            cardBg.setTint(0xf7c66a);
            this.showItemDetails(item);
        });

        cardBg.on('pointerout', () => {
            cardBg.clearTint();
            this.itemInfoText.setText('');
            this.itemInfoText.setDepth(15); // Upewnij się, że depth jest zachowany
        });

        this.itemsContainer.add([cardBg, iconSprite, name, price, actionBtn, btnLabel]);
    }

    getItemIconKey(type) {
        const icons = {
            weapon: 'icon_weapon',
            armor: 'icon_armor',
            potion: 'icon_potion_red',
            accessory: 'icon_accessory',
            gold: 'icon_gold',
            treasure: 'icon_chest'
        };
        return icons[type] || 'icon_chest';
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

        // Ustawienie tekstu z wyższym priorytetem wyświetlania
        this.itemInfoText.setText(info);
        this.itemInfoText.setDepth(15); // Wyższy depth niż wszystkie inne elementy
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

        const bg = this.add.image(0, 0, 'ui_button_small')
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '20px',
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

    setupScrolling() {
        // Scroll kółkiem
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.maxScroll > 0) {
                this.scrollY += deltaY * 0.3;
                this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);
                this.updateScroll();
            }
        });

        // Strzałki góra/dół
        const upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        const downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        upKey.on('down', () => {
            if (this.maxScroll > 0) {
                this.scrollY = Math.max(0, this.scrollY - 30);
                this.updateScroll();
            }
        });

        downKey.on('down', () => {
            if (this.maxScroll > 0) {
                this.scrollY = Math.min(this.maxScroll, this.scrollY + 30);
                this.updateScroll();
            }
        });
    }

    updateScroll() {
        this.itemsContainer.y = -this.scrollY;
    }

    close() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
