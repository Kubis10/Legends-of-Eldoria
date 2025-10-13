import Phaser from 'phaser';
import GameState from '../GameState';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.enemies = [];
        this.items = [];
        this.map = null;
        this.walls = null;
        this.uiElements = {};
    }

    create() {
        // Ustaw granice świata (50x50 kafelków po 32px)
        this.physics.world.setBounds(0, 0, 50 * 32, 50 * 32);

        // Tworzenie prostej mapy
        this.createMap();        // Tworzenie gracza
        this.createPlayer();

        this.createEnemies();

        // NPC i interakcje specyficzne dla lokacji
        this.createLocationContent();

        // Tworzenie przedmiotów
        this.createItems();

        // Tworzenie UI
        this.createUI();

        // Kamera śledzi gracza
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBounds(0, 0, 50 * 32, 50 * 32); // Granice kamery

        // Klawisze sterowania
        this.setupControls();

        // Setup debug hotkey after this.keys is created
        this.setupDebugMode();

        // Kolizje
        this.setupCollisions();
    }

    createMap() {
        // Prosta mapa z kafelkami
        const mapWidth = 50;
        const mapHeight = 50;
        const tileSize = 32;

        this.map = this.add.group();
        this.walls = this.physics.add.staticGroup(); // Grupa dla ścian z fizyką

        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const worldX = x * tileSize;
                const worldY = y * tileSize;

                // Losowe wybieranie terenu
                let tileType = 'tile_grass';
                const rand = Math.random();
                const loc = GameState.currentLocation;

                // Prosty klimat kafelków zależnie od lokacji
                if (loc === 'DARK_FOREST') {
                    if (rand < 0.15) tileType = 'tile_wall';
                    else if (rand < 0.2) tileType = 'tile_water';
                    else tileType = 'tile_grass';
                } else if (loc === 'ABANDONED_RUINS') {
                    if (rand < 0.25) tileType = 'tile_stone';
                    else if (rand < 0.28) tileType = 'tile_wall';
                    else tileType = 'tile_grass';
                } else if (loc === 'MOUNTAIN_CAVE') {
                    if (rand < 0.4) tileType = 'tile_wall';
                    else tileType = 'tile_stone';
                } else {
                    if (rand < 0.1) tileType = 'tile_stone';
                    else if (rand < 0.15) tileType = 'tile_water';
                }

                // Ściany na krawędziach
                if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
                    tileType = 'tile_wall';
                }

                const tile = this.add.sprite(worldX, worldY, tileType)
                    .setOrigin(0);

                this.map.add(tile);

                // Dodaj ściany do grupy fizyki
                if (tileType === 'tile_wall') {
                    const wallBody = this.walls.create(worldX + 16, worldY + 16, tileType);
                    wallBody.setOrigin(0.5);
                    wallBody.setVisible(false); // Ukryj duplikat (wizualny jest już dodany wyżej)
                    wallBody.body.setSize(32, 32);
                }
            }
        }

        // Losowe ściany wewnętrzne
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(2, mapWidth - 3);
            const y = Phaser.Math.Between(2, mapHeight - 3);
            const worldX = x * tileSize;
            const worldY = y * tileSize;

            const wall = this.add.sprite(worldX, worldY, 'tile_wall')
                .setOrigin(0);
            this.map.add(wall);

            // Dodaj do grupy fizyki
            const wallBody = this.walls.create(worldX + 16, worldY + 16, 'tile_wall');
            wallBody.setOrigin(0.5);
            wallBody.setVisible(false);
            wallBody.body.setSize(32, 32);
        }
    }

    createPlayer() {
        const playerData = GameState.player;
        const classKey = playerData.class.toLowerCase();
        const spriteKey = `player_${classKey}`;

        this.player = this.physics.add.sprite(400, 400, spriteKey);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1);
        this.player.body.setSize(28, 28);

        // Dane gracza
        this.player.playerData = playerData;
    }

    createEnemies() {
        // Zależnie od aktualnej lokacji wybierz pule przeciwników
        let enemyTypes = [];
        switch (GameState.currentLocation) {
            case 'STARTING_VILLAGE':
            default:
                enemyTypes = [
                    { key: 'enemy_goblin', health: 50, damage: 10, exp: 25, name: 'Goblin' }
                ];
                break;
            case 'DARK_FOREST':
                enemyTypes = [
                    { key: 'enemy_goblin', health: 55, damage: 12, exp: 28, name: 'Goblin' },
                    { key: 'enemy_skeleton', health: 70, damage: 15, exp: 35, name: 'Szkielet' }
                ];
                break;
            case 'ABANDONED_RUINS':
                enemyTypes = [
                    { key: 'enemy_skeleton', health: 80, damage: 18, exp: 40, name: 'Szkielet' },
                    { key: 'enemy_orc', health: 110, damage: 22, exp: 55, name: 'Ork' }
                ];
                break;
            case 'MOUNTAIN_CAVE':
                enemyTypes = [
                    { key: 'enemy_troll', health: 150, damage: 25, exp: 75, name: 'Troll' },
                    { key: 'enemy_orc', health: 120, damage: 24, exp: 60, name: 'Ork' }
                ];
                break;
            case 'DRAGON_LAIR':
                enemyTypes = [
                    { key: 'enemy_skeleton', health: 90, damage: 20, exp: 45, name: 'Szkielet' }
                ];
                break;
            case 'CRYSTAL_LAKE':
                enemyTypes = [
                    { key: 'enemy_goblin', health: 60, damage: 14, exp: 30, name: 'Goblin' },
                    { key: 'enemy_skeleton', health: 75, damage: 16, exp: 38, name: 'Szkielet' }
                ];
                break;
            case 'HAUNTED_CEMETERY':
                enemyTypes = [
                    { key: 'enemy_skeleton', health: 85, damage: 19, exp: 42, name: 'Szkielet' }
                ];
                break;
            case 'ANCIENT_TEMPLE':
                enemyTypes = [
                    { key: 'enemy_orc', health: 115, damage: 23, exp: 58, name: 'Ork' },
                    { key: 'enemy_troll', health: 160, damage: 26, exp: 80, name: 'Troll' }
                ];
                break;
        }

        // Tworzenie 16 losowych wrogów
        for (let i = 0; i < 16; i++) {
            const enemyType = Phaser.Utils.Array.GetRandom(enemyTypes);
            const x = Phaser.Math.Between(100, 1500);
            const y = Phaser.Math.Between(100, 1500);

            const enemy = this.physics.add.sprite(x, y, enemyType.key);
            enemy.setScale(1);
            enemy.body.setSize(28, 28);

            // Dane wroga
            enemy.enemyData = {
                maxHealth: enemyType.health,
                health: enemyType.health,
                damage: enemyType.damage,
                exp: enemyType.exp,
                name: enemyType.name
            };

            // Pasek zdrowia
            enemy.healthBar = this.createHealthBar(enemy, enemyType.health);

            // Losowe poruszanie się
            this.time.addEvent({
                delay: Phaser.Math.Between(2000, 5000),
                callback: () => this.moveEnemyRandomly(enemy),
                loop: true
            });

            this.enemies.push(enemy);
        }

        // Dodaj bossa jeśli lokacja go ma
        this.spawnBoss();
    }

    spawnBoss() {
        const { LOCATIONS } = require('./data/locations');
        const currentLoc = LOCATIONS[GameState.currentLocation];

        if (currentLoc && currentLoc.boss) {
            let bossData;
            switch (currentLoc.boss) {
                case 'boss_ancient_dragon':
                    bossData = { key: 'enemy_dragon', health: 500, damage: 50, exp: 500, name: 'Starożytny Smok' };
                    break;
                case 'boss_troll_king':
                    bossData = { key: 'enemy_troll', health: 300, damage: 35, exp: 300, name: 'Król Trolli' };
                    break;
                case 'boss_temple_guardian':
                    bossData = { key: 'enemy_orc', health: 250, damage: 30, exp: 250, name: 'Strażnik Świątyni' };
                    break;
                default:
                    return;
            }

            // Spawn bossa w środku mapy
            const boss = this.physics.add.sprite(800, 800, bossData.key);
            boss.setScale(1.5); // Większy boss
            boss.body.setSize(40, 40);

            boss.enemyData = {
                maxHealth: bossData.health,
                health: bossData.health,
                damage: bossData.damage,
                exp: bossData.exp,
                name: bossData.name,
                isBoss: true
            };

            boss.healthBar = this.createHealthBar(boss, bossData.health);

            // Boss pozostaje w miejscu
            this.enemies.push(boss);

            this.showMessage(`⚠️ ${bossData.name} czeka na ciebie! ⚠️`, boss.x, boss.y - 100, '#ff0000');
        }
    }

    createLocationContent() {
        // W wiosce: dodaj prostych NPC z interakcją do sklepu i questów
        if (GameState.currentLocation === 'STARTING_VILLAGE') {
            this.npcs = [];
            const elder = this.physics.add.sprite(450, 420, 'npc_elder').setImmovable(true);
            elder.npcData = { id: 'VILLAGE_ELDER', name: 'Starszy Wioski', type: 'quest_giver' };
            const merchant = this.physics.add.sprite(520, 380, 'npc_merchant').setImmovable(true);
            merchant.npcData = { id: 'MERCHANT', name: 'Kupiec', type: 'shop' };
            const blacksmith = this.physics.add.sprite(380, 380, 'npc_blacksmith').setImmovable(true);
            blacksmith.npcData = { id: 'BLACKSMITH', name: 'Kowal', type: 'shop' };

            this.npcs.push(elder, merchant, blacksmith);

            // Kolizje z NPC aby nie przenikać
            this.npcs.forEach(npc => {
                this.physics.add.collider(this.player, npc);
            });

            // Proste dymki nad głową
            this.npcs.forEach(npc => {
                const label = this.add.text(npc.x, npc.y - 28, npc.npcData.name, {
                    fontFamily: 'Arial', fontSize: '12px', color: '#f1c40f', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
                npc.label = label;
            });
        }
    }

    createItems() {
        const itemTypes = [
            { key: 'icon_potion_red', type: 'potion', value: 50, name: 'Mikstura zdrowia' },
            { key: 'icon_gold', type: 'gold', value: 50, name: 'Złoto' },
            { key: 'icon_chest', type: 'chest', value: 100, name: 'Skrzynia' }
        ];

        // Tworzenie przedmiotów
        for (let i = 0; i < 15; i++) {
            const itemType = Phaser.Utils.Array.GetRandom(itemTypes);
            const x = Phaser.Math.Between(100, 1500);
            const y = Phaser.Math.Between(100, 1500);

            const item = this.physics.add.sprite(x, y, itemType.key);
            item.itemData = itemType;

            this.items.push(item);
        }
    }

    createUI() {
        const { width, height } = this.cameras.main;

        // UI jest nieruchome względem kamery
        const uiContainer = this.add.container(0, 0).setScrollFactor(0);

        // Panel gracza (lewy górny róg)
        const playerPanel = this.add.image(10 + 125, 10 + 60, 'ui_panel_small')
            .setOrigin(0.5);

        const playerName = this.add.text(20, 20, GameState.player.name, {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#f39c12'
        });

        this.uiElements.playerLevel = this.add.text(20, 45, `Poziom: ${GameState.player.level}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        });

        // Paski zdrowia i many
        this.uiElements.healthBarBg = this.add.rectangle(20, 75, 220, 15, 0x8b6914)
            .setOrigin(0);
        this.uiElements.healthBar = this.add.rectangle(20, 75, 220, 15, 0xe74c3c)
            .setOrigin(0);

        this.uiElements.manaBarBg = this.add.rectangle(20, 95, 220, 15, 0x8b6914)
            .setOrigin(0);
        this.uiElements.manaBar = this.add.rectangle(20, 95, 220, 15, 0x3498db)
            .setOrigin(0);

        this.uiElements.healthText = this.add.text(130, 75, '', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);

        this.uiElements.manaText = this.add.text(130, 95, '', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);

        uiContainer.add([
            playerPanel, playerName, this.uiElements.playerLevel,
            this.uiElements.healthBarBg, this.uiElements.healthBar, this.uiElements.healthText,
            this.uiElements.manaBarBg, this.uiElements.manaBar, this.uiElements.manaText
        ]);

        // Panel umiejętności (dolny środek)
        const skillsY = height - 80;
        const skillsPanel = this.add.image(width / 2, skillsY + 35, 'ui_panel_skillbar')
            .setOrigin(0.5)
            .setScrollFactor(0);

        uiContainer.add(skillsPanel);

        // Wyświetlanie umiejętności
        GameState.player.skills.forEach((skill, index) => {
            const skillX = width / 2 - 220 + index * 120;
            const skillButton = this.add.image(skillX + 50, skillsY + 35, 'ui_slot_wide')
                .setOrigin(0.5)
                .setScrollFactor(0);

            const skillText = this.add.text(skillX + 50, skillsY + 35, `${index + 1}\n${skill.name}`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0);

            uiContainer.add([skillButton, skillText]);
        });

        // Instrukcje (prawy górny róg)
        const instructions = this.add.text(width - 10, 10,
            'WASD - Ruch\nSPACJA - Atak\n1-4 - Umiejętności\nE - Interakcja/Zbierz\nI - Ekwipunek\nQ - Questy\nM - Mapa\nESC - Menu', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 0).setScrollFactor(0);

        uiContainer.add(instructions); this.updateUI();
    }

    setupControls() {
        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            interact: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            skill1: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            skill2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            skill3: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            skill4: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
            menu: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
            inventory: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            quests: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            map: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M)
        };

        // Obsługa ataku
        this.keys.attack.on('down', () => this.performAttack());

        // Obsługa interakcji
        this.keys.interact.on('down', () => this.performInteraction());

        // Obsługa umiejętności
        this.keys.skill1.on('down', () => this.useSkill(0));
        this.keys.skill2.on('down', () => this.useSkill(1));
        this.keys.skill3.on('down', () => this.useSkill(2));
        this.keys.skill4.on('down', () => this.useSkill(3));

        // Menu pauzy
        this.keys.menu.on('down', () => this.showPauseMenu());

        // Ekwipunek
        this.keys.inventory.on('down', () => this.showInventory());

        // Questy
        this.keys.quests.on('down', () => this.showQuests());

        // Mapa
        this.keys.map.on('down', () => this.showMap());
    }

    setupDebugMode() {
        // Debug: F10 maksuje statystyki, złoto, odkrywa mapy
        this.keys.debug = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F10);
        this.keys.debug.on('down', () => {
            try {
                const { LOCATIONS } = require('../data/locations');
                const all = Object.keys(LOCATIONS || {});
                GameState.enableDebugMode(all);
                this.showMessage('DEBUG: stats, gold, mapy odblokowane', this.player.x, this.player.y - 60, '#f39c12');
                this.updateUI();
            } catch (e) {
                console.error('Debug enable failed', e);
            }
        });
    }

    setupCollisions() {
        // Kolizje gracza ze ścianami
        this.physics.add.collider(this.player, this.walls);

        // Kolizje wrogów ze ścianami (sprawdź czy wróg jest aktywny)
        this.enemies.forEach(enemy => {
            if (enemy && enemy.active && enemy.body) {
                this.physics.add.collider(enemy, this.walls);
                enemy.setCollideWorldBounds(true); // Dodaj granice świata
            }
        });

        // Kolizje gracza z przedmiotami (sprawdź czy przedmiot jest aktywny)
        this.items.forEach(item => {
            if (item && item.active && item.body) {
                this.physics.add.overlap(this.player, item, () => {
                    this.collectItem(item);
                });
            }
        });
    }

    update() {
        if (!this.player) return;

        // Sprawdź czy był awans poziomu
        if (GameState.justLeveledUp) {
            GameState.justLeveledUp = false;
            this.scene.pause();
            this.scene.launch('LevelUpScene', { level: GameState.player.level });
        }

        // Regeneracja many (1 punkt co 2 sekundy)
        if (!this.lastManaRegen || Date.now() - this.lastManaRegen > 2000) {
            if (GameState.player.attributes.mana < GameState.player.attributes.maxMana) {
                GameState.player.attributes.mana = Math.min(
                    GameState.player.attributes.mana + 1,
                    GameState.player.attributes.maxMana
                );
                this.updateUI();
            }
            this.lastManaRegen = Date.now();
        }

        // Poruszanie gracza
        const speed = 200;
        this.player.setVelocity(0);

        if (this.keys.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.keys.down.isDown) {
            this.player.setVelocityY(speed);
        }

        if (this.keys.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.keys.right.isDown) {
            this.player.setVelocityX(speed);
        }

        // Normalizacja prędkości przy ruchu po przekątnej
        if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            this.player.setVelocity(
                this.player.body.velocity.x * 0.707,
                this.player.body.velocity.y * 0.707
            );
        }

        // Aktualizacja pasków zdrowia wrogów
        this.enemies.forEach(enemy => {
            if (enemy.healthBar) {
                enemy.healthBar.x = enemy.x - 16;
                enemy.healthBar.y = enemy.y - 20;
            }
        });

        // Automatyczne zapisywanie co minutę
        if (!this.lastSave || Date.now() - this.lastSave > 60000) {
            GameState.saveGame();
            this.lastSave = Date.now();
        }
    } performAttack() {
        const attackRange = 50;
        const damage = 20 + GameState.player.attributes.strength * 2;

        // Znajdź najbliższego wroga w zasięgu
        let closestEnemy = null;
        let closestDistance = attackRange;

        this.enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        });

        if (closestEnemy) {
            this.damageEnemy(closestEnemy, damage);
        }
    }

    useSkill(index) {
        const skill = GameState.player.skills[index];
        if (!skill) return;

        // Sprawdź czy gracz ma wystarczająco many
        if (GameState.player.attributes.mana < skill.manaCost) {
            this.showMessage('Niewystarczająco many!', this.player.x, this.player.y - 50);
            return;
        }

        // Odejmij manę
        GameState.player.attributes.mana -= skill.manaCost;

        // Wykonaj umiejętność
        const attackRange = 100;
        const damage = skill.damage + GameState.player.attributes.intelligence * 2;

        // Znajdź wroga w zasięgu
        let closestEnemy = null;
        let closestDistance = attackRange;

        this.enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        });

        if (closestEnemy) {
            this.damageEnemy(closestEnemy, damage);
            this.showMessage(`${skill.name}!`, this.player.x, this.player.y - 50);
        }

        this.updateUI();
    }

    damageEnemy(enemy, damage) {
        enemy.enemyData.health -= damage;

        // Pokaż obrażenia
        this.showMessage(`-${damage}`, enemy.x, enemy.y - 30, '#e74c3c');

        // Animacja obrażeń
        this.tweens.add({
            targets: enemy,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });

        // Aktualizuj pasek zdrowia
        this.updateEnemyHealthBar(enemy);

        // Jeśli wróg zginął
        if (enemy.enemyData.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    killEnemy(enemy) {
        // Dodaj doświadczenie
        GameState.addExperience(enemy.enemyData.exp);
        this.showMessage(`+${enemy.enemyData.exp} EXP`, enemy.x, enemy.y, '#f39c12');

        // Aktualizuj postęp questów
        GameState.checkQuestProgress(enemy.enemyData.name);

        // Losowy drop przedmiotów (30% szansa)
        if (Math.random() < 0.3) {
            this.dropItem(enemy.x, enemy.y);
        }

        // Usuń wroga
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }

        if (enemy.healthBar) {
            enemy.healthBar.destroy();
        }

        enemy.destroy();
        this.updateUI();
    }

    dropItem(x, y) {
        const dropTable = [
            { key: 'icon_potion_red', type: 'potion', effect: 'heal', value: 50, name: 'Mikstura zdrowia', price: 25 },
            { key: 'icon_gold', type: 'gold', value: 25, name: 'Złoto', price: 25 },
            { key: 'icon_gold', type: 'gold', value: 50, name: 'Złoto', price: 50 }
        ];

        const drop = Phaser.Utils.Array.GetRandom(dropTable);
        const droppedItem = this.physics.add.sprite(x, y, drop.key);
        droppedItem.itemData = { ...drop, id: `drop_${Date.now()}` };

        this.items.push(droppedItem);

        // Dodaj kolizję
        this.physics.add.overlap(this.player, droppedItem, () => {
            this.collectItem(droppedItem);
        });
    } collectItem(item) {
        const itemData = item.itemData;

        if (itemData.type === 'potion') {
            GameState.player.attributes.health = Math.min(
                GameState.player.attributes.health + itemData.value,
                GameState.player.attributes.maxHealth
            );
            this.showMessage(`+${itemData.value} HP`, item.x, item.y, '#2ecc71');
            GameState.onPotionUsed();
        } else if (itemData.type === 'gold') {
            GameState.currency += itemData.value;
            this.showMessage(`+${itemData.value} złota`, item.x, item.y, '#f1c40f');
            GameState.onGoldCollected(itemData.value);
        } else if (itemData.type === 'chest') {
            const gold = Phaser.Math.Between(50, 200);
            GameState.currency += gold;
            this.showMessage(`Skrzynia! +${gold} złota`, item.x, item.y, '#f39c12');
            GameState.onChestOpened();
            GameState.onGoldCollected(gold);
        }

        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }

        item.destroy();
        this.updateUI();
        GameState.saveGame();
    }

    performInteraction() {
        const interactRange = 60;

        // Interakcja z NPC (w wiosce)
        if (this.npcs && this.npcs.length) {
            for (const npc of this.npcs) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
                if (dist < interactRange) {
                    if (npc.npcData.type === 'shop') {
                        this.scene.pause();
                        this.scene.launch('ShopScene', { shopkeeper: npc.npcData.id });
                        return;
                    } else if (npc.npcData.type === 'quest_giver') {
                        this.scene.pause();
                        this.scene.launch('QuestScene');
                        return;
                    }
                }
            }
        }

        // Znajdź najbliższy przedmiot
        this.items.forEach(item => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                item.x, item.y
            );

            if (distance < interactRange) {
                this.collectItem(item);
            }
        });
    }

    moveEnemyRandomly(enemy) {
        if (!enemy.active) return;

        const direction = Phaser.Math.Between(0, 7);
        const speed = 50;

        switch (direction) {
            case 0: enemy.setVelocity(0, -speed); break;
            case 1: enemy.setVelocity(speed, -speed); break;
            case 2: enemy.setVelocity(speed, 0); break;
            case 3: enemy.setVelocity(speed, speed); break;
            case 4: enemy.setVelocity(0, speed); break;
            case 5: enemy.setVelocity(-speed, speed); break;
            case 6: enemy.setVelocity(-speed, 0); break;
            case 7: enemy.setVelocity(-speed, -speed); break;
            default: enemy.setVelocity(0, 0); break;
        }

        this.time.delayedCall(1000, () => {
            if (enemy.active) {
                enemy.setVelocity(0);
            }
        });
    }

    createHealthBar(enemy, maxHealth) {
        const bar = this.add.graphics();
        bar.setDepth(5);
        bar.maxHealth = maxHealth;
        return bar;
    }

    updateEnemyHealthBar(enemy) {
        const healthBar = enemy.healthBar;
        if (!healthBar) return;

        const barWidth = 32;
        const barHeight = 4;
        const healthPercent = enemy.enemyData.health / enemy.enemyData.maxHealth;

        healthBar.clear();
        // Rysuj względem pozycji grafiki (0,0) – pozycjonowanie jest ustawiane w update()
        healthBar.fillStyle(0x000000);
        healthBar.fillRect(0, 0, barWidth, barHeight);
        healthBar.fillStyle(0xe74c3c);
        healthBar.fillRect(0, 0, barWidth * healthPercent, barHeight);
    }

    updateUI() {
        const player = GameState.player;

        // Aktualizuj poziom
        this.uiElements.playerLevel.setText(`Poziom: ${player.level}`);

        // Aktualizuj paski zdrowia i many
        const healthPercent = player.attributes.health / player.attributes.maxHealth;
        const manaPercent = player.attributes.mana / player.attributes.maxMana;

        this.uiElements.healthBar.width = 220 * healthPercent;
        this.uiElements.manaBar.width = 220 * manaPercent;

        this.uiElements.healthText.setText(
            `HP: ${Math.floor(player.attributes.health)}/${player.attributes.maxHealth}`
        );
        this.uiElements.manaText.setText(
            `MP: ${Math.floor(player.attributes.mana)}/${player.attributes.maxMana}`
        );
    }

    showMessage(text, x, y, color = '#ffffff') {
        const message = this.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: '20px',
            fontStyle: 'bold',
            color: color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: message,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => message.destroy()
        });
    }

    showPauseMenu() {
        this.scene.pause();
        this.scene.launch('PauseMenuScene');
    }

    showInventory() {
        this.scene.pause();
        this.scene.launch('InventoryScene');
    }

    showQuests() {
        this.scene.pause();
        this.scene.launch('QuestScene');
    }

    showMap() {
        this.scene.pause();
        this.scene.launch('MapScene');
    }
}