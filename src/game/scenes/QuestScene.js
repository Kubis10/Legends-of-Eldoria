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

        // Panel questów
        const panelWidth = 1000;
        const panelHeight = 640;
        this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x2c3e50)
            .setStrokeStyle(4, 0xf39c12);

        // Tytuł
        this.add.text(width / 2, height / 2 - 300, '📜 DZIENNIK QUESTÓW 📜', {
            fontFamily: 'Arial',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Zakładki
        this.currentTab = 'active';
        this.createTabs(width / 2, height / 2 - 240);

        // Obszar questów
        this.questsContainer = this.add.container(0, 0);
        this.displayQuests();

        // Statystyki (dół)
        this.createStats(width / 2, height / 2 + 280);

        // Przycisk zamknięcia
        this.createButton(width / 2 + 380, height / 2 - 300, 'X', () => {
            this.close();
        }, 0xe74c3c, 50, 50);

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

        tabs.forEach((tab, index) => {
            const tabX = x - 200 + index * 200;
            const isActive = this.currentTab === tab.key;

            const button = this.add.rectangle(tabX, y, 180, 50,
                isActive ? tab.color : 0x34495e)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, isActive ? 0xffffff : 0x7f8c8d);

            const label = this.add.text(tabX, y, tab.label, {
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                this.currentTab = tab.key;
                this.scene.restart();
            });

            button.on('pointerover', () => {
                if (!isActive) {
                    button.setFillStyle(tab.color - 0x111111);
                }
            });

            button.on('pointerout', () => {
                if (!isActive) {
                    button.setFillStyle(0x34495e);
                }
            });
        });
    }

    displayQuests() {
        this.questsContainer.removeAll(true);

        let quests = [];
        if (this.currentTab === 'active') {
            quests = GameState.quests;
        } else if (this.currentTab === 'completed') {
            quests = GameState.completedQuests;
        } else if (this.currentTab === 'available') {
            quests = this.getAvailableQuests();
        }

        const { width, height } = this.cameras.main;
        const startY = height / 2 - 180;

        if (quests.length === 0) {
            const emptyText = this.add.text(width / 2, height / 2,
                this.currentTab === 'active' ? 'Brak aktywnych questów' :
                    this.currentTab === 'completed' ? 'Nie ukończono jeszcze żadnych questów' :
                        'Brak dostępnych questów', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#7f8c8d',
                align: 'center'
            }).setOrigin(0.5);
            this.questsContainer.add(emptyText);
            return;
        }

        quests.forEach((quest, index) => {
            const questY = startY + index * 120;
            this.createQuestCard(width / 2, questY, quest, index);
        });
    }

    createQuestCard(x, y, quest, index) {
        // Określ kolor na podstawie typu questu
        const typeColors = {
            main: 0xf39c12,
            side: 0x3498db,
            boss: 0xe74c3c
        };
        const color = typeColors[quest.type] || 0x34495e;

        // Tło karty
        const cardBg = this.add.rectangle(x, y, 900, 100, 0x34495e)
            .setStrokeStyle(3, color);

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

        // Postęp celów
        if (quest.objectives && this.currentTab !== 'completed') {
            const objective = quest.objectives[0]; // Pokazujemy pierwszy cel
            const progress = `${objective.current || 0}/${objective.count}`;
            const progressText = this.add.text(x + 300, y - 20, progress, {
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#2ecc71'
            }).setOrigin(0.5);

            // Pasek postępu
            const progressBarWidth = 150;
            const progressPercent = (objective.current || 0) / objective.count;

            this.add.rectangle(x + 300, y + 15, progressBarWidth, 8, 0x7f8c8d)
                .setOrigin(0.5);
            this.add.rectangle(x + 300 - progressBarWidth / 2, y + 15,
                progressBarWidth * progressPercent, 8, 0x2ecc71)
                .setOrigin(0, 0.5);
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
            color: '#95a5a6'
        }).setOrigin(0, 0.5);

        // Przycisk akcji
        if (this.currentTab === 'available') {
            const acceptBtn = this.createButton(x + 380, y, 'Przyjmij', () => {
                this.acceptQuest(quest);
            }, 0x27ae60, 100, 40);
            this.questsContainer.add(acceptBtn);
        } else if (this.currentTab === 'active' && this.isQuestCompleted(quest)) {
            const completeBtn = this.createButton(x + 380, y, 'Odbierz', () => {
                this.completeQuest(quest);
            }, 0x2ecc71, 100, 40);
            this.questsContainer.add(completeBtn);
        }

        this.questsContainer.add([cardBg, icon, title, description, rewardText]);
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
            color: '#95a5a6',
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

    createButton(x, y, text, onClick, color = 0x3498db, w = 150, h = 40) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, w, h, color)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '16px',
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
