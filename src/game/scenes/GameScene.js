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
        this.playerIsDead = false;
    }

    // Bezpieczne odtwarzanie dźwięków
    playSound(key, config = {}) {
        try {
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume().then(() => {
                    if (this.sound.get(key)) this.sound.play(key, config);
                }).catch(() => { });
                return;
            }
            if (this.sound.get(key)) {
                this.sound.play(key, config);
            } else {
                console.warn(`Sound '${key}' not found in cache`);
            }
        } catch (error) {
            console.error(`Error playing sound '${key}':`, error);
        }
    }

    // Uruchom audio context po pierwszej interakcji użytkownika
    startAudioContext() {
        if (!this.audioStarted && this.sound.context) {
            try {
                if (this.sound.context.state === 'suspended') {
                    this.sound.context.resume().then(() => {
                        this.audioStarted = true;
                        this._maybeStartBgm();
                    });
                } else {
                    this.audioStarted = true;
                    this._maybeStartBgm();
                }
            } catch (error) {
                console.warn('Could not start audio context:', error);
            }
        }
    }

    _maybeStartBgm() {
        // Nie uruchamiaj jeśli już gra lub wyłączono
        if (this.bgmDisabled) return;
        if (this.bgm) return;
        const exists = this.sound.get('bgm_main') || this.cache.audio.exists('bgm_main');
        if (exists) {
            try {
                // Jeśli jeszcze nie dodane jako Sound obiekt – dodaj
                if (!this.sound.get('bgm_main')) {
                    this.bgm = this.sound.add('bgm_main', { loop: true, volume: 0 });
                } else {
                    this.bgm = this.sound.get('bgm_main');
                    this.bgm.setLoop(true);
                    this.bgm.setVolume(0);
                }
                this.bgm.play();
                // Fade in do docelowego poziomu (0.4)
                this.tweens.add({
                    targets: this.bgm,
                    volume: 0.4,
                    duration: 1500,
                    ease: 'Sine.easeInOut'
                });
                // BGM started (log removed for production)
            } catch (e) {
                console.warn('Cannot start bgm_main:', e);
            }
        } else {
            // bgm_main not yet available – silent retry
        }
    }

    create() {
        // Nie uruchamiaj muzyki automatycznie - poczekaj na interakcję użytkownika
        this.audioStarted = false;
        this.bgm = null;
        this.bgmDisabled = false; // ustaw na true jeśli chcesz mieć domyślnie wyciszone
        if (!this._audioUnlockBound) {
            const unlock = () => {
                if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
                    this.sound.context.resume().catch(() => { });
                } else {
                    // Kontekst już aktywny – oznacz i spróbuj uruchomić BGM
                    if (!this.audioStarted) {
                        this.audioStarted = true;
                        this._maybeStartBgm();
                    }
                }
                // Po resume spróbuj wystartować muzykę jeśli jeszcze nie ustawiono
                if (!this.audioStarted) {
                    this.audioStarted = true;
                    this._maybeStartBgm();
                }
                window.removeEventListener('pointerdown', unlock);
                window.removeEventListener('keydown', unlock);
            };
            window.addEventListener('pointerdown', unlock, { once: true });
            window.addEventListener('keydown', unlock, { once: true });
            this._audioUnlockBound = true;
        }

        // Jeśli AudioContext już jest aktywny w momencie tworzenia sceny – uruchom natychmiast
        if (this.sound && this.sound.context && this.sound.context.state !== 'suspended') {
            this.audioStarted = true;
            this._maybeStartBgm();
        }

        // Dodatkowy listener na kliknięcie w samą scenę (na wypadek jeśli globalny zostanie przechwycony wcześniej)
        this.input.once('pointerdown', () => {
            if (!this.audioStarted && this.sound.context.state === 'suspended') {
                this.sound.context.resume().then(() => {
                    this.audioStarted = true; this._maybeStartBgm();
                }).catch(() => { });
            } else if (!this.bgm && !this.bgmDisabled) {
                this.audioStarted = true; this._maybeStartBgm();
            }
        });

        // Komunikat diagnostyczny jeśli brak startu po 2s
        this.time.delayedCall(2000, () => {
            if (!this.bgm && !this.bgmDisabled) {
                this.showMessage('Kliknij aby włączyć audio', this.player.x, this.player.y - 60, '#e67e22');
            }
        });

        // Kilka prób automatycznych jeśli audio odblokowane później
        this._bgmRetryCount = 0;
        this.time.addEvent({
            delay: 1500,
            repeat: 4,
            callback: () => {
                if (this.bgm || this.bgmDisabled) return;
                if (this.sound.context.state !== 'suspended') {
                    this.audioStarted = true;
                    this._maybeStartBgm();
                }
                this._bgmRetryCount++;
            }
        });

        // Debug: Shift+M wymusza start
        this.input.keyboard.on('keydown-M', (ev) => {
            if (ev.shiftKey) {
                // Force BGM start (debug key) – log suppressed
                this.bgmDisabled = false;
                this.audioStarted = true;
                this._maybeStartBgm();
            }
        });

        // Ustaw granice świata (50x50 kafelków po 32px)
        // Ograniczenie dolnego obszaru o 160px dla UI paska umiejętności
        const restrictedHeight = 50 * 32 - 160; // Zmniejsz wysokość o 160px dla UI
        this.physics.world.setBounds(0, 0, 50 * 32, restrictedHeight);

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
        // Ustaw granice kamery zgodnie z ograniczonym obszarem
        this.cameras.main.setBounds(0, 0, 50 * 32, restrictedHeight);

        // Klawisze sterowania
        this.setupControls();
        // Dodaj przełącznik muzyki (N) – tylko jeśli plik został załadowany
        if (!this.keys) this.keys = {};
        this.keys.musicToggle = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this.keys.musicToggle.on('down', () => {
            if (this.bgm && this.bgm.isPlaying) {
                // Fade out przed zatrzymaniem
                const ref = this.bgm;
                this.tweens.add({
                    targets: ref,
                    volume: 0,
                    duration: 1000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        if (ref && ref.isPlaying) ref.stop();
                        if (ref) ref.destroy();
                        if (this.bgm === ref) this.bgm = null;
                    }
                });
                this.bgmDisabled = true;
                this.showMessage('Muzyka: OFF (fade)', this.player.x, this.player.y - 50, '#e74c3c');
            } else {
                this.bgmDisabled = false;
                this._maybeStartBgm();
                if (this.bgm) {
                    this.showMessage('Muzyka: ON (fade)', this.player.x, this.player.y - 50, '#2ecc71');
                } else {
                    this.showMessage('Muzyka: brak pliku', this.player.x, this.player.y - 50, '#e67e22');
                }
            }
        });

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

        // Ustal kolor skóry na podstawie rasy i przygotuj przefarbowaną teksturę (tylko kolor głowy)
        const raceMap = {
            'Człowiek': 'HUMAN',
            'Elf': 'ELF',
            'Krasnolud': 'DWARF',
            'Ork': 'ORC'
        };
        const skinColors = {
            HUMAN: 0xfbe7b2,
            ELF: 0xb2fbb2,
            DWARF: 0xd1a06a,
            ORC: 0x6ad16a
        };
        const raceKey = raceMap[playerData.race] || 'HUMAN';
        const headColor = skinColors[raceKey] || 0xfbe7b2;

        const recoloredKey = `${spriteKey}_head_${headColor.toString(16)}`;
        // Automatycznie wykryj bazowy kolor głowy i przefarbuj tylko górną część (obszar głowy)
        this.ensureRecoloredTexture(spriteKey, recoloredKey, 'autoHead', headColor, 40);

        // Użyj przefarbowanej tekstury jeśli istnieje, w przeciwnym razie bazowej
        const finalKey = this.textures.exists(recoloredKey) ? recoloredKey : spriteKey;
        this.player = this.physics.add.sprite(400, 400, finalKey);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(1);
        this.player.body.setSize(28, 28);

        // Dane gracza
        this.player.playerData = playerData;
        // Inicjalizuj aktywną obronę
        this.player.activeDefense = 0;
    }

    // Utwórz nową teksturę z podmianą koloru (np. głowy) bazując na istniejącej
    ensureRecoloredTexture(sourceKey, newKey, fromColor, toColor, tolerance = 16) {
        // Jeśli już istnieje – nic nie rób
        if (this.textures.exists(newKey)) return;
        const srcTex = this.textures.get(sourceKey);
        if (!srcTex || !srcTex.getSourceImage) return;
        const sourceImage = srcTex.getSourceImage();
        if (!sourceImage || !sourceImage.width || !sourceImage.height) return;

        const width = sourceImage.width;
        const height = sourceImage.height;

        // Utwórz canvasową teksturę o tych samych wymiarach i narysuj źródłowy obraz
        const canvasTexture = this.textures.createCanvas(newKey, width, height);
        const ctx = canvasTexture.getContext();
        ctx.drawImage(sourceImage, 0, 0);

        // Pobierz piksele i ewentualnie automatycznie wykryj kolor głowy
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Region głowy: okrąg o środku (cx, cy) i promieniu r
        const cx = Math.floor(width / 2);
        const cy = Math.floor(height * 0.13); // 13% wysokości, empirically fits head position
        const r = Math.floor(height * 0.11); // 11% wysokości, empirically fits head size

        let fr, fg, fb;
        if (typeof fromColor === 'string' && fromColor.toLowerCase().includes('auto')) {
            // Histogram tylko w okręgu głowy
            const bins = new Map();
            for (let y = cy - r; y <= cy + r; y++) {
                for (let x = cx - r; x <= cx + r; x++) {
                    if (x < 0 || x >= width || y < 0 || y >= height) continue;
                    const dx = x - cx, dy = y - cy;
                    if (dx * dx + dy * dy > r * r) continue;
                    const idx = (y * width + x) * 4;
                    const r1 = data[idx];
                    const g1 = data[idx + 1];
                    const b1 = data[idx + 2];
                    const a1 = data[idx + 3];
                    if (a1 === 0) continue;
                    const brightness = (r1 + g1 + b1) / 3;
                    if (brightness < 80) continue;
                    const rq = r1 >> 3, gq = g1 >> 3, bq = b1 >> 3;
                    const key = (rq << 10) | (gq << 5) | bq;
                    const entry = bins.get(key) || { count: 0, rSum: 0, gSum: 0, bSum: 0 };
                    entry.count++;
                    entry.rSum += r1;
                    entry.gSum += g1;
                    entry.bSum += b1;
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

        let matchCount = 0;
        for (let y = cy - r; y <= cy + r; y++) {
            for (let x = cx - r; x <= cx + r; x++) {
                if (x < 0 || x >= width || y < 0 || y >= height) continue;
                const dx = x - cx, dy = y - cy;
                if (dx * dx + dy * dy > r * r) continue;
                const i = (y * width + x) * 4;
                const r2 = data[i];
                const g2 = data[i + 1];
                const b2 = data[i + 2];
                const a2 = data[i + 3];
                if (a2 === 0) continue;
                if (Math.abs(r2 - fr) <= tolerance && Math.abs(g2 - fg) <= tolerance && Math.abs(b2 - fb) <= tolerance) {
                    data[i] = tr;
                    data[i + 1] = tg;
                    data[i + 2] = tb;
                    matchCount++;
                }
            }
        }

        // Jeśli nic nie zostało przefarbowane, wykonaj fallback: wykryj bazowy kolor w całym obrazie i przefarbuj globalnie dopasowania
        if (matchCount < 10) {
            // Wykryj na całym obrazie najczęstszy jasny kolor
            const binsAll = new Map();
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
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
                    const entry = binsAll.get(key) || { count: 0, rSum: 0, gSum: 0, bSum: 0 };
                    entry.count++;
                    entry.rSum += r;
                    entry.gSum += g;
                    entry.bSum += b;
                    binsAll.set(key, entry);
                }
            }
            let bestAll = null;
            for (const [, v] of binsAll.entries()) {
                if (!bestAll || v.count > bestAll.count) bestAll = v;
            }
            if (bestAll && bestAll.count > 0) {
                const afr = Math.round(bestAll.rSum / bestAll.count);
                const afg = Math.round(bestAll.gSum / bestAll.count);
                const afb = Math.round(bestAll.bSum / bestAll.count);
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const i2 = (y * width + x) * 4;
                        const r2 = data[i2];
                        const g2 = data[i2 + 1];
                        const b2 = data[i2 + 2];
                        const a2 = data[i2 + 3];
                        if (a2 === 0) continue;
                        if (Math.abs(r2 - afr) <= tolerance && Math.abs(g2 - afg) <= tolerance && Math.abs(b2 - afb) <= tolerance) {
                            data[i2] = tr;
                            data[i2 + 1] = tg;
                            data[i2 + 2] = tb;
                        }
                    }
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
        canvasTexture.refresh();
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

            // Ustaw kolizje dla wroga
            this.physics.add.collider(enemy, this.walls);
            enemy.setCollideWorldBounds(true);

            // Dodaj kolizję wroga z graczem (atak wroga)
            this.physics.add.overlap(this.player, enemy, () => {
                this.enemyAttackPlayer(enemy);
            });

            this.enemies.push(enemy);
        }

        // Dodaj bossa jeśli lokacja go ma
        this.spawnBoss();
    }

    spawnBoss() {
        const { LOCATIONS } = require('../data/locations');
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

            // Ustaw kolizje dla bossa
            this.physics.add.collider(boss, this.walls);
            boss.setCollideWorldBounds(true);

            // Dodaj kolizję bossa z graczem (atak bossa)
            this.physics.add.overlap(this.player, boss, () => {
                this.enemyAttackPlayer(boss);
            });

            // Boss pozostaje w miejscu
            this.enemies.push(boss);

            // Pokaż ostrzeżenie na środku ekranu
            const { width, height } = this.cameras.main;
            this.showMessage(`⚠️ ${bossData.name} czeka na ciebie! ⚠️`, width / 2, height / 2 - 100, '#ff0000');
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

        // Wyświetlanie umiejętności z ograniczeniem szerokości i wordWrap
        const slotWidth = 110;
        GameState.player.skills.forEach((skill, index) => {
            const skillX = width / 2 - 220 + index * slotWidth;
            const skillButton = this.add.image(skillX + 55, skillsY + 35, 'ui_slot_wide')
                .setOrigin(0.5)
                .setScrollFactor(0);

            // Automatyczne łamanie tekstu i mniejsza czcionka dla długich nazw
            let skillFontSize = skill.name.length > 14 ? 10 : 12;
            const skillText = this.add.text(skillX + 55, skillsY + 35, `${index + 1}\n${skill.name}`, {
                fontFamily: 'Arial',
                fontSize: skillFontSize,
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: slotWidth - 10, useAdvancedWrap: true }
            }).setOrigin(0.5).setScrollFactor(0);

            uiContainer.add([skillButton, skillText]);
        });

        // Dodaj czyszczenie panelu umiejętności po zamknięciu sklepu
        this.events.on('resume', () => {
            // Usuwanie pozostałości po panelu umiejętności
            if (uiContainer) {
                uiContainer.iterate(child => {
                    if (child && child.texture && child.texture.key === 'ui_slot_wide') {
                        child.destroy();
                    }
                });
            }
            // Odśwież panel umiejętności
            this.createUI();
        });

        this.updateUI();
    }

    setupControls() {
        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            // Dodaj obsługę strzałek
            upArrow: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            downArrow: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            leftArrow: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            rightArrow: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
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
            // Odtwórz dźwięk awansu poziomu
            this.playSound('level_up');
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


        // Poruszanie gracza (WASD + strzałki) - tylko jeśli gracz żyje
        const speed = 200;
        this.player.setVelocity(0);
        let isMoving = false;

        if (!this.playerIsDead) {
            if (this.keys.up.isDown || this.keys.upArrow.isDown) {
                this.player.setVelocityY(-speed);
                isMoving = true;
            } else if (this.keys.down.isDown || this.keys.downArrow.isDown) {
                this.player.setVelocityY(speed);
                isMoving = true;
            }

            if (this.keys.left.isDown || this.keys.leftArrow.isDown) {
                this.player.setVelocityX(-speed);
                isMoving = true;
            } else if (this.keys.right.isDown || this.keys.rightArrow.isDown) {
                this.player.setVelocityX(speed);
                isMoving = true;
            }

            // Uruchom audio przy pierwszym ruchu
            if (isMoving && !this.audioStarted) {
                this.startAudioContext();
            }
        }

        // Dźwięki kroków
        if (isMoving) {
            if (!this.lastFootstep || Date.now() - this.lastFootstep > 400) {
                this.playSound('footstep');
                this.lastFootstep = Date.now();
            }
        }

        // Normalizacja prędkości przy ruchu po przekątnej
        if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            this.player.setVelocity(
                this.player.body.velocity.x * 0.707,
                this.player.body.velocity.y * 0.707
            );
        }

        // Brak dodatkowej nakładki na głowę – sprite renderuje ją samodzielnie

        // Ręczne sprawdzanie granic dla gracza (dodatkowe zabezpieczenie)
        const restrictedHeight = 50 * 32 - 160;
        if (this.player.y > restrictedHeight - 16) {
            this.player.y = restrictedHeight - 16;
            this.player.setVelocityY(0);
        }

        // Ręczne sprawdzanie granic dla wrogów
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
    }

    performAttack() {
        // Nie atakuj jeśli gracz jest martwy
        if (this.playerIsDead) {
            return;
        }

        // Odtwórz dźwięk ataku
        this.startAudioContext(); // Uruchom audio przy pierwszej akcji
        this.playSound('attack_sound');

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
        // Nie używaj umiejętności jeśli gracz jest martwy
        if (this.playerIsDead) {
            return;
        }

        const skill = GameState.player.skills[index];
        if (!skill) return;

        // Sprawdź czy gracz ma wystarczająco many
        if (GameState.player.attributes.mana < skill.manaCost) {
            this.showMessage('Niewystarczająco many!', this.player.x, this.player.y - 50);
            return;
        }

        // Odtwórz dźwięk umiejętności
        this.playSound('skill_sound');

        // Odejmij manę
        GameState.player.attributes.mana -= skill.manaCost;

        // Sprawdź typ umiejętności
        if (skill.defense) {
            // Umiejętność defensywna (np. Tarcza obronna)
            this.useDefensiveSkill(skill);
        } else if (skill.damage) {
            // Umiejętność ofensywna
            this.useOffensiveSkill(skill);
        } else {
            // Inne umiejętności (np. leczenie, buffy)
            this.useUtilitySkill(skill);
        }

        this.updateUI();
    }

    useDefensiveSkill(skill) {
        // Aktywuj tarczę obronną na określony czas
        const defenseBonus = skill.defense + GameState.player.attributes.strength;
        const duration = 10000; // 10 sekund

        // Dodaj tymczasową obronę
        if (!this.player.activeDefense) {
            this.player.activeDefense = 0;
        }
        this.player.activeDefense += defenseBonus;

        // Wizualny efekt tarczy
        this.showDefenseEffect();
        this.showMessage(`${skill.name}! +${defenseBonus} obrony na 10s`, this.player.x, this.player.y - 50, '#3498db');

        // Usuń obronę po czasie
        this.time.delayedCall(duration, () => {
            this.player.activeDefense = Math.max(0, this.player.activeDefense - defenseBonus);
            this.showMessage('Obrona wygasła', this.player.x, this.player.y - 50, '#95a5a6');
        });
    }

    useOffensiveSkill(skill) {
        const attackRange = 100;
        const damage = skill.damage + GameState.player.attributes.intelligence * 5;

        if (skill.targets && skill.targets > 1) {
            // Umiejętność atakująca wielu wrogów
            const enemiesInRange = [];

            this.enemies.forEach(enemy => {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );

                if (distance <= attackRange) {
                    enemiesInRange.push({ enemy, distance });
                }
            });

            // Posortuj po odległości i weź pierwszych N wrogów
            enemiesInRange.sort((a, b) => a.distance - b.distance);
            const targets = enemiesInRange.slice(0, skill.targets);

            if (targets.length > 0) {
                targets.forEach(target => {
                    this.damageEnemy(target.enemy, damage);
                });
                this.showMessage(`${skill.name}! (${targets.length} celów)`, this.player.x, this.player.y - 50);
            }
        } else {
            // Umiejętność atakująca jednego wroga
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
                if (skill.duration) {
                    // Umiejętność z efektem w czasie (np. trucizna)
                    this.applyDotEffect(closestEnemy, skill, damage);
                } else {
                    this.damageEnemy(closestEnemy, damage);
                }
                this.showMessage(`${skill.name}!`, this.player.x, this.player.y - 50);
            }
        }
    }

    applyDotEffect(enemy, skill, baseDamage) {
        // Zadaj początkowe obrażenia
        this.damageEnemy(enemy, baseDamage);

        // Zastosuj efekt trucizny na określony czas
        const dotDamage = Math.floor(baseDamage * 0.3); // 30% bazowych obrażeń co sekundę
        let ticks = skill.duration;

        const poisonInterval = this.time.addEvent({
            delay: 1000, // Co sekundę
            callback: () => {
                if (enemy && enemy.active && ticks > 0) {
                    this.damageEnemy(enemy, dotDamage);
                    this.showMessage(`Trucizna -${dotDamage}`, enemy.x, enemy.y - 40, '#9b59b6');
                    ticks--;
                } else {
                    poisonInterval.destroy();
                }
            },
            repeat: skill.duration - 1
        });
    }

    useUtilitySkill(skill) {
        // Placeholder dla innych typów umiejętności
        this.showMessage(`${skill.name}!`, this.player.x, this.player.y - 50, '#f39c12');
    }

    showDefenseEffect() {
        // Wizualny efekt tarczy wokół gracza
        const shield = this.add.graphics();
        shield.lineStyle(3, 0x3498db, 0.8);
        shield.strokeCircle(this.player.x, this.player.y, 40);

        // Animacja znikania tarczy
        this.tweens.add({
            targets: shield,
            alpha: 0,
            duration: 2000,
            onComplete: () => shield.destroy()
        });
    }

    damageEnemy(enemy, damage) {
        // Odtwórz dźwięk trafienia wroga
        this.playSound('enemy_hit');

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

    enemyAttackPlayer(enemy) {
        // Nie atakuj martwego gracza
        if (this.playerIsDead) {
            return;
        }

        // Sprawdź cooldown ataku (1.5 sekundy)
        const now = Date.now();
        if (enemy.lastAttack && now - enemy.lastAttack < 1500) {
            return;
        }
        enemy.lastAttack = now;

        // Oblicz obrażenia wroga
        let damage = enemy.enemyData.damage;

        // Uwzględnij aktywną obronę gracza
        if (this.player.activeDefense && this.player.activeDefense > 0) {
            const originalDamage = damage;
            damage = Math.max(1, damage - this.player.activeDefense); // Minimum 1 obrażenie

            if (damage < originalDamage) {
                this.showMessage(`Zablokowano ${originalDamage - damage} obrażeń!`, this.player.x, this.player.y - 60, '#3498db');
            }
        }

        // Odejmij obrażenia graczowi
        GameState.player.attributes.health -= damage;

        // Odtwórz dźwięk otrzymywania obrażeń
        this.playSound('player_hit');

        // Pokaż obrażenia nad graczem
        this.showMessage(`-${damage}`, this.player.x, this.player.y - 30, '#e74c3c');

        // Animacja obrażeń gracza
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 150,
            yoyo: true
        });

        // Sprawdź czy gracz zginął
        if (GameState.player.attributes.health <= 0 && !this.playerIsDead) {
            GameState.player.attributes.health = 0;
            this.playerIsDead = true; // Oznacz gracza jako martwego
            this.playerDied();
        }

        // Aktualizuj UI
        this.updateUI();
    }

    playerDied() {
        // Odtwórz dźwięk śmierci gracza
        this.playSound('player_death');

        // Pokaż komunikat o śmierci
        this.showMessage('ZGINĄŁEŚ!', this.player.x, this.player.y - 50, '#ff0000');

        // Respawn gracza z częścią zdrowia w bezpiecznym miejscu
        this.time.delayedCall(2000, () => {
            GameState.player.attributes.health = Math.floor(GameState.player.attributes.maxHealth * 0.5);
            this.player.setPosition(400, 400); // Respawn w centrum
            this.playerIsDead = false; // Wyczyść flagę śmierci po respawnie
            this.showMessage('Odrodzono!', this.player.x, this.player.y - 50, '#2ecc71');
            this.updateUI();
        });
    }

    killEnemy(enemy) {
        // Odtwórz dźwięk śmierci wroga
        this.playSound('enemy_death');

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

        // Dodaj kolizję dla nowego przedmiotu
        this.physics.add.overlap(this.player, droppedItem, () => {
            this.collectItem(droppedItem);
        });
    } collectItem(item) {
        const itemData = item.itemData;

        // Odtwórz dźwięk podnoszenia przedmiotu
        if (itemData.type === 'chest') {
            this.playSound('chest_open');
        } else {
            this.playSound('item_pickup');
        }

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
        // Nie wchodź w interakcje jeśli gracz jest martwy
        if (this.playerIsDead) {
            return;
        }

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
        this.scene.launch('PauseMenuScene', { showMusicHint: true });
    }

    showInventory() {
        // Nie otwieraj ekwipunku jeśli gracz jest martwy
        if (this.playerIsDead) {
            return;
        }
        this.playSound('menu_open');
        this.scene.pause();
        this.scene.launch('InventoryScene');
    }

    showQuests() {
        // Nie otwieraj questów jeśli gracz jest martwy
        if (this.playerIsDead) {
            return;
        }
        this.playSound('menu_open');
        this.scene.pause();
        this.scene.launch('QuestScene');
    }

    showMap() {
        // Nie otwieraj mapy jeśli gracz jest martwy
        if (this.playerIsDead) {
            return;
        }
        this.playSound('menu_open');
        this.scene.pause();
        this.scene.launch('MapScene');
    }
}