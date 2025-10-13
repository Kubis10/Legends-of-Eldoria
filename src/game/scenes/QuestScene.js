import Phaser from 'phaser';
import GameState from '../GameState';
import { QUESTS } from '../data/content';

export default class QuestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuestScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Półprzezroczyste tło
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
            .setOrigin(0)
            .setScrollFactor(0);

        // Panel questów (niżej żeby tytuł się zmieścił)
        const panelWidth = 1000;
        const panelHeight = 600;
        const panelY = height / 2 + 10;
        const panelX = width / 2;
        this.add.image(panelX, panelY, 'ui_panel_large');

        // Tytuł (wewnątrz panelu)
        const titleTop = panelY - panelHeight / 2 + 35;
        this.add.text(panelX, titleTop, '📜 DZIENNIK QUESTÓW 📜', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Zakładki
        this.currentTab = 'active';
        this.createTabs(panelX, titleTop + 50);

        // Obszar questów z możliwością przewijania
        this.scrollY = 0;
        this.questsContainer = this.add.container(0, 0);

        // Maska dla obszaru questów (tylko to co jest w strefie jest widoczne)
        const maskX = panelX - 450;
        const maskY = panelY - panelHeight / 2 + 140;
        const maskWidth = 900;
        const maskHeight = 380; // Wysokość strefy przewijania

        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(maskX, maskY, maskWidth, maskHeight);
        this.questsMask = maskShape.createGeometryMask();
        this.questsContainer.setMask(this.questsMask);

        // Zapisz parametry dla przewijania
        this.scrollArea = { x: maskX, y: maskY, width: maskWidth, height: maskHeight };
        this.maxScroll = 0;

        this.displayQuests();

        // Obsługa scrolla
        this.setupScrolling();

        // Statystyki (dół)
        this.createStats(panelX, panelY + panelHeight / 2 - 30);

        // Przycisk zamknięcia (w prawym górnym rogu panelu, wewnątrz)
        this.createCloseButton(panelX + panelWidth / 2 - 30, panelY - panelHeight / 2 + 30);

        // Klawisz Q do zamknięcia
        this.input.keyboard.once('keydown-Q', () => {
            this.close();
        });
    }

    createTabs(x, y) {
        const tabs = [
            { key: 'active', label: 'Aktywne', color: 0x3498db },
            { key: 'completed', label: 'Ukończone', color: 0x27ae60 },
            { key: 'available', label: 'Dostępne', color: 0xf39c12 }
        ];

        this.tabButtons = [];
        this.tabLabels = [];

        tabs.forEach((tab, index) => {
            const tabX = x - 200 + index * 200;

            const button = this.add.image(tabX, y, 'ui_button_small')
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(tabX, y, tab.label, {
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                if (this.currentTab !== tab.key) {
                    this.currentTab = tab.key;
                    this.switchTab(tab.key);
                }
            });

            button.on('pointerover', () => {
                button.setTint(0xf7c66a);
            });

            button.on('pointerout', () => {
                button.clearTint();
            });

            this.tabButtons.push({ button, tab });
            this.tabLabels.push(label);
        });
    }

    switchTab(newTab) {
        // Aktualizuj wygląd przycisków (obrazy) i ewentualnie labeli
        this.tabButtons.forEach(({ button, tab }, idx) => {
            const isActive = tab.key === newTab;
            if (isActive) {
                button.setTint(0x70e1a8);
            } else {
                button.clearTint();
            }
        });

        // Odśwież listę questów
        this.displayQuests();
    }

    displayQuests() {
        this.questsContainer.removeAll(true);
        this.scrollY = 0; // Reset scroll przy zmianie zakładki

        let quests = [];
        if (this.currentTab === 'active') {
            quests = GameState.quests;
        } else if (this.currentTab === 'completed') {
            quests = GameState.completedQuests;
        } else if (this.currentTab === 'available') {
            quests = this.getAvailableQuests();
        }

        const { width, height } = this.cameras.main;
        // Pierwszy quest powinien mieć środek 60px poniżej górnej krawędzi maski
        const startY = (this.scrollArea?.y || 0) + 60;

        if (quests.length === 0) {
            const emptyText = this.add.text(width / 2, height / 2,
                this.currentTab === 'active' ? 'Brak aktywnych questów' :
                    this.currentTab === 'completed' ? 'Nie ukończono jeszcze żadnych questów' :
                        'Brak dostępnych questów', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#d4af37',
                align: 'center'
            }).setOrigin(0.5);
            this.questsContainer.add(emptyText);
            this.maxScroll = 0;
            return;
        }

        quests.forEach((quest, index) => {
            const questY = startY + index * 120;
            this.createQuestCard(width / 2, questY, quest, index);
        });

        // Oblicz maksymalny scroll
        const totalHeight = quests.length * 120;
        const visibleHeight = this.scrollArea.height;
        this.maxScroll = Math.max(0, totalHeight - visibleHeight);

        // Zaktualizuj pozycję kontenera
        this.updateScroll();
    }

    createQuestCard(x, y, quest, index) {
        // Tło karty
        const cardBg = this.add.image(x, y, 'ui_card_quest');

        // Ikonka typu
        const typeIcons = {
            main: '⭐',
            side: '📌',
            boss: '💀'
        };
        const icon = this.add.text(x - 420, y, typeIcons[quest.type] || '📜', {
            fontFamily: 'Arial',
            fontSize: '32px'
        }).setOrigin(0.5);

        // Tytuł questu
        const title = this.add.text(x - 370, y - 25, quest.title, {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Opis questu
        const description = this.add.text(x - 370, y + 5, quest.description, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ecf0f1',
            wordWrap: { width: 500 }
        }).setOrigin(0, 0.5);

        // Elementy do dodania do kontenera
        const cardElements = [cardBg, icon, title, description];

        // Postęp celów
        if (quest.objectives && this.currentTab !== 'completed') {
            const objective = quest.objectives[0]; // Pokazujemy pierwszy cel
            const progress = `${objective.current || 0}/${objective.count}`;
            // Sprawdź czy będzie przycisk po prawej (Przyjmij lub Odbierz)
            const hasButton = this.currentTab === 'available' || (this.currentTab === 'active' && this.isQuestCompleted(quest));
            const progressX = hasButton ? x + 150 : x + 300; // więcej miejsca dla przycisku
            const progressText = this.add.text(progressX, y - 20, progress, {
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#2ecc71'
            }).setOrigin(0.5);

            // Pasek postępu
            const progressBarWidth = 120;
            const progressPercent = (objective.current || 0) / objective.count;

            const progressBarBg = this.add.rectangle(progressX, y + 15, progressBarWidth, 8, 0x8b6914).setOrigin(0.5);
            const progressBarFill = this.add.rectangle(progressX - progressBarWidth / 2, y + 15,
                progressBarWidth * progressPercent, 8, 0x2ecc71).setOrigin(0, 0.5);

            cardElements.push(progressText, progressBarBg, progressBarFill);
        }

        // Nagrody
        const rewardY = y + 30;
        const rewards = [];
        if (quest.experienceReward) rewards.push(`⭐ ${quest.experienceReward} EXP`);
        if (quest.goldReward) rewards.push(`💰 ${quest.goldReward} złota`);
        if (quest.itemReward) rewards.push(`🎁 ${quest.itemReward.name}`);

        const rewardText = this.add.text(x - 370, rewardY,
            `Nagrody: ${rewards.join(' | ')}`, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#d4af37'
        }).setOrigin(0, 0.5);

        cardElements.push(rewardText);

        // Przycisk akcji
        if (this.currentTab === 'available') {
            const acceptBtn = this.createButton(x + 350, y, 'Przyjmij', () => {
                this.acceptQuest(quest);
            }, 0x27ae60, 100, 40);
            cardElements.push(acceptBtn);
        } else if (this.currentTab === 'active' && this.isQuestCompleted(quest)) {
            const completeBtn = this.createButton(x + 350, y, 'Odbierz', () => {
                this.completeQuest(quest);
            }, 0x2ecc71, 100, 40);
            cardElements.push(completeBtn);
        }

        // Dodaj wszystkie elementy karty do kontenera
        this.questsContainer.add(cardElements);
    }

    getAvailableQuests() {
        const available = [];
        const activeIds = GameState.quests.map(q => q.id);
        const completedIds = GameState.completedQuests.map(q => q.id);

        Object.values(QUESTS).forEach(quest => {
            if (!activeIds.includes(quest.id) && !completedIds.includes(quest.id)) {
                available.push(quest);
            }
        });

        return available;
    }

    isQuestCompleted(quest) {
        if (!quest.objectives) return false;
        return quest.objectives.every(obj => (obj.current || 0) >= obj.count);
    }

    acceptQuest(quest) {
        GameState.addQuest({ ...quest });
        GameState.saveGame();
        this.showMessage(`Quest przyjęty: ${quest.title}`, 0x2ecc71);
        this.scene.restart();
    }

    completeQuest(quest) {
        GameState.completeQuest(quest.id);
        this.showMessage(`Quest ukończony! +${quest.experienceReward} EXP`, 0xf39c12);

        // Jeśli była nagroda w postaci przedmiotu
        if (quest.itemReward) {
            const item = {
                ...quest.itemReward,
                id: `item_${Date.now()}`
            };
            GameState.addItem(item);
            this.showMessage(`Otrzymano: ${item.name}`, 0x9b59b6);
        }

        this.scene.restart();
    }

    createStats(x, y) {
        const activeCount = GameState.quests.length;
        const completedCount = GameState.completedQuests.length;
        const totalCount = Object.keys(QUESTS).length;

        const stats = `Aktywne: ${activeCount} | Ukończone: ${completedCount}/${totalCount} | ` +
            `Poziom: ${GameState.player.level} | EXP: ${GameState.player.experience}`;

        this.add.text(x, y, stats, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#d4af37',
            align: 'center'
        }).setOrigin(0.5);
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

    setupScrolling() {
        // Obsługa kółka myszy
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.maxScroll > 0) {
                this.scrollY += deltaY * 0.3;
                this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.maxScroll);
                this.updateScroll();
            }
        });

        // Obsługa klawiszy strzałek
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
        this.questsContainer.y = -this.scrollY;
    }

    createButton(x, y, text, onClick, color = 0x3498db, w = 150, h = 40) {
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
