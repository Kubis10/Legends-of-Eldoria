# Legends of Eldoria - Dokumentacja Deweloperska

## 🏗️ Architektura gry

### System scen (Phaser 3.90.0)

Gra używa modularnej architektury scen Phaser:

1. **BootScene** - Generowanie proceduralne UI textures, ładowanie zasobów
2. **MainMenuScene** - Menu główne z animacjami i opcjami
3. **CharacterCreationScene** - Kreator postaci z preview i bonusami
4. **GameScene** - Główna rozgrywka z systemem walki i eksploracji
5. **PauseMenuScene** - Menu pauzy z ESC toggle funkcjonalnością
6. **InventoryScene** - Zarządzanie ekwipunkiem z głębokością warstw
7. **QuestScene** - Dziennik questów z postępem i odblokowywaniem lokacji
8. **MapScene** - Interaktywna mapa z szybką podróżą i loading screens
9. **ShopScene** - Sklep z maskowanym przewijaniem i układem 2-kolumnowym
10. **LevelUpScene** - Ekran awansu z automatycznym przydziałem statystyk

### System zarządzania stanem (GameState)

GameState jest singletonem zarządzającym całym stanem gry z rozszerzonymi funkcjami:

```javascript
// Podstawowe właściwości
{
  player: {
    name: string,
    race: string,
    class: string,
    level: number,
    health: number,
    maxHealth: number,
    mana: number,
    maxMana: number,
    experience: number,
    experienceToNext: number,
    strength: number,
    dexterity: number,
    intelligence: number
  },
  inventory: Array<Item>,
  quests: Array<Quest>,
  completedQuests: Array<string>,
  discoveredLocations: Array<string>,
  currentLocation: string,
  defeatedEnemies: Array<string>,
  gameTime: number,
  currency: number,
  debugMode: boolean
}
```

#### Kluczowe metody GameState:

- `enableDebugMode()` - Aktywacja trybu debug (F10)
- `unlockLocation(locationId)` - Odblokowanie nowej lokacji
- `addExperience(amount)` - Dodanie EXP z auto-levelingiem
- `addQuest(questId)` - Aktywacja nowego questu
- `completeQuest(questId)` - Ukończenie questu z nagrodami
- `onGoldCollected()`, `onChestOpened()`, `onPotionUsed()` - Quest triggers
- `saveGame()` / `loadGame()` - Perzystencja w localStorage

### 🖼️ System UI i grafiki

#### Proceduralne generowanie tekstur (BootScene)

Wszystkie elementy UI są generowane proceduralnie z ciepłą paletą:

```javascript
// Kolory UI
const UI_COLORS = {
  PRIMARY: 0x8b4513, // Ciepły brąz
  SECONDARY: 0xd2691e, // Pomarańczowy brąz
  ACCENT: 0xf4a460, // Jasny brąz
  GOLD: 0xffd700, // Złoty
  SUCCESS: 0x228b22, // Leśny zielony
  DANGER: 0xdc143c, // Czerwony
};

// Standardowe rozmiary
const UI_SIZES = {
  PANEL_LARGE: { width: 1000, height: 700 },
  PANEL_MEDIUM: { width: 800, height: 600 },
  BUTTON_LARGE: { width: 200, height: 60 },
  BUTTON_SMALL: { width: 150, height: 40 },
};
```

#### Zaokrąglone narożniki

Wykorzystanie natywnych funkcji Phaser 3.90.0 z fallbackiem:

```javascript
// W BootScene - detekcja możliwości
const supportsRoundedRect = typeof graphics.fillRoundedRect === "function";

if (supportsRoundedRect) {
  graphics.fillRoundedRect(x, y, width, height, radius);
} else {
  // Custom implementation z arc()
  this.drawRoundedRect(graphics, x, y, width, height, radius);
}
```

### 🗺️ System lokacji

#### Definicja lokacji (locations.js)

Każda z 8 lokacji zawiera:

```javascript
LOCATION_ID: {
    name: 'Nazwa lokacji',
    description: 'Opis lokacji dla gracza',
    mapType: 'forest|dungeon|cave|village|mountain|lake|cemetery|temple',
    enemies: [
        { type: 'goblin', count: 5, level: 1 },
        { type: 'skeleton', count: 3, level: 2 }
    ],
    boss: {
        type: 'ancient_dragon',
        name: 'Starożytny Smok',
        health: 500,
        damage: 75,
        exp: 1000
    },
    npcs: ['village_elder', 'merchant', 'blacksmith'], // tylko dla wiosek
    unlockRequirement: 'quest_id' // lub null dla domyślnie dostępnych
}
```

#### MapGenerator

Różne algorytmy dla różnych typów map:

- **Forest**: Losowe rozmieszczenie drzew (15%), woda (5%), trawa (80%)
- **Dungeon**: Generator pokoi z korytarzami (8 pokoi)
- **Cave**: Cellular automata dla organicznych kształtów (5 iteracji)
- **Village**: Predefiniowane układy budynków i NPC
- **Mountain**: Wysokościowe generowanie ze szczytami
- **Lake**: Centralne jezioro z wybrzeżami
- **Cemetery**: Siatka grobów z ścieżkami
- **Temple**: Symetryczne układy świętych sal

### ⚔️ System walki

#### Mechanika ataku

```javascript
// Atak podstawowy
const baseDamage = 20 + player.strength * 2;
const range = 50; // pikseli
const manaCost = 0;

// Umiejętności specjalne
const skillDamage = baseDamage + player.intelligence * 2;
const skillRange = 100;
const skillManaCost = 8 - 25; // zależnie od umiejętności
```

#### Typy wrogów z AI

| Typ      | Zdrowie | Obrażenia | EXP  | Zachowanie             |
| -------- | ------- | --------- | ---- | ---------------------- |
| Goblin   | 50      | 10        | 25   | Podstawowe tropienie   |
| Skeleton | 70      | 15        | 35   | Agresywne ataki        |
| Orc      | 100     | 20        | 50   | Grupowe ataki          |
| Troll    | 150     | 25        | 75   | Powolne ale silne      |
| Dragon   | 500     | 75        | 1000 | Boss z pattern attacks |

#### Paski zdrowia wrogów

Automatyczne generowanie i pozycjonowanie:

```javascript
createHealthBar(enemy, maxHealth) {
    const bar = this.add.graphics();
    const width = 60;
    const height = 8;

    // Pozycjonowanie relative do wroga
    bar.x = enemy.x - width/2;
    bar.y = enemy.y - enemy.height/2 - 15;

    // Update przy każdym obrażeniu
    enemy.healthBar = bar;
    return bar;
}
```

### 🎯 System questów

#### Struktura questu (content.js)

```javascript
QUEST_ID: {
    id: 'unique_quest_id',
    title: 'Nazwa questu',
    description: 'Szczegółowy opis zadania',
    type: 'main|side|boss',
    objectives: [
        {
            type: 'kill|collect|interact|visit',
            target: 'goblin|gold|npc_id|location_id',
            count: 5,
            current: 0,
            description: 'Pokonaj 5 goblinów'
        }
    ],
    experienceReward: 150,
    goldReward: 100,
    itemReward: null,
    unlockLocation: 'DARK_FOREST', // opcjonalne
    completedMessage: 'Quest completed!',
    isCompleted: false
}
```

#### Quest triggers w GameScene

Automatyczne aktualizacje postępu:

```javascript
// W GameScene - po pokonaniu wroga
GameState.onEnemyDefeated(enemy.enemyData.type);

// W GameState
onEnemyDefeated(enemyType) {
    this.quests.forEach(quest => {
        quest.objectives.forEach(obj => {
            if (obj.type === 'kill' && obj.target === enemyType) {
                obj.current = Math.min(obj.current + 1, obj.count);
                this.checkQuestCompletion(quest);
            }
        });
    });
}
```

### 🏪 System sklepów (ShopScene)

#### Maskowane przewijanie

```javascript
// Kontener z maską dla smooth scrolling
const mask = this.add.graphics();
mask.fillRect(startX, startY, containerWidth, containerHeight);
this.scrollContainer.setMask(mask.createGeometryMask());

// Scroll handling z bounds checking
this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
  const newY = this.scrollContainer.y - deltaY * 0.5;
  const minY = -(this.totalContentHeight - containerHeight);
  const maxY = 0;
  this.scrollContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
});
```

#### Layout 2-kolumnowy

```javascript
// Automatyczne układanie w kolumnach
items.forEach((item, index) => {
  const column = index % 2;
  const row = Math.floor(index / 2);
  const x = column * (itemWidth + spacing);
  const y = row * (itemHeight + spacing);

  this.createItemDisplay(x, y, item);
});
```

### 🗺️ System mapy (MapScene)

#### Dynamiczne pozycjonowanie gracza

```javascript
// Aktualizacja pozycji znacznika gracza
const currentLoc = mapLocations.find(
  (loc) => loc.id === GameState.currentLocation
);
const playerX = currentLoc ? currentLoc.x : defaultX;
const playerY = currentLoc ? currentLoc.y : defaultY;

// Pulsująca animacja znacznika
this.tweens.add({
  targets: playerMarker,
  scale: { from: 1, to: 1.3 },
  duration: 800,
  yoyo: true,
  repeat: -1,
});
```

#### Loading screens

```javascript
showLoadingScreen() {
    // Półprzezroczyste tło
    this.loadingBg = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
        .setDepth(1000);

    // Animowane kropki
    this.loadingTimer = this.time.addEvent({
        delay: 300,
        callback: () => {
            dots = (dots.length >= 3) ? '' : dots + '.';
            this.loadingText.setText(`Ładowanie${dots}`);
        },
        loop: true
    });
}
```

### 🔧 Debug System

#### Aktywacja (F10 w GameScene)

```javascript
setupDebugMode() {
    this.input.keyboard.on('keydown-F10', () => {
        GameState.enableDebugMode();
        this.showMessage('DEBUG: stats, gold, mapy odblokowane',
                        this.player.x, this.player.y - 60, '#f39c12');
    });
}
```

#### Funkcje debug mode

```javascript
enableDebugMode() {
    this.debugMode = true;

    // Maksymalne statystyki
    this.player.level = 99;
    this.player.health = this.player.maxHealth = 9999;
    this.player.mana = this.player.maxMana = 9999;
    this.player.strength = 99;
    this.player.dexterity = 99;
    this.player.intelligence = 99;

    // Dużo złota
    this.currency = 999999;

    // Odblokuj wszystkie lokacje
    this.discoveredLocations = Object.keys(LOCATIONS);

    this.saveGame();
}
```

## 🔧 Rozszerzanie gry

### Dodawanie nowej lokacji

1. **Definicja w locations.js**:

```javascript
NEW_LOCATION: {
    name: 'Nowa Lokacja',
    description: 'Opis nowej lokacji',
    mapType: 'forest', // lub inny typ
    enemies: [
        { type: 'new_enemy', count: 3, level: 5 }
    ],
    boss: null, // lub definicja bossa
    unlockRequirement: 'some_quest_id'
}
```

2. **Dodanie do mapy (MapScene.js)**:

```javascript
// W drawMap() - dodaj nową pozycję
{
    id: 'NEW_LOCATION',
    x: centerX + offsetX,
    y: centerY + offsetY,
    icon: '🆕',
    name: 'Nowa Lokacja'
}
```

3. **Opcjonalnie - ścieżki między lokacjami**:

```javascript
// W drawPaths() - dodaj połączenia
const paths = [
  // ... existing paths
  [existingLocationIndex, newLocationIndex],
];
```

### Dodawanie nowego wroga

1. **Definicja typu w GameScene**:

```javascript
const enemyTypes = {
  new_enemy: {
    key: "enemy_sprite_key",
    health: 120,
    damage: 30,
    exp: 60,
    name: "Nowy Wróg",
    behavior: "aggressive", // basic, aggressive, defensive
  },
};
```

2. **Sprite w BootScene** (jeśli potrzebny):

```javascript
// Generowanie nowego sprite'a
this.createEnemySprite("enemy_sprite_key", color, size);
```

### Dodawanie nowego questu

1. **Definicja w content.js**:

```javascript
NEW_QUEST: {
    id: 'new_quest_unique_id',
    title: 'Tytuł Nowego Questu',
    description: 'Szczegółowy opis zadania dla gracza',
    type: 'main', // lub 'side', 'boss'
    objectives: [
        {
            type: 'kill',
            target: 'new_enemy',
            count: 3,
            current: 0,
            description: 'Pokonaj 3 nowych wrogów'
        }
    ],
    experienceReward: 200,
    goldReward: 150,
    itemReward: null,
    unlockLocation: null, // lub 'LOCATION_ID'
    completedMessage: 'Gratulacje! Quest ukończony!',
    isCompleted: false
}
```

2. **Trigger w odpowiednim miejscu**:

```javascript
// Przykład - automatyczne nadanie po ukończeniu innego questu
if (questId === "prerequisite_quest") {
  GameState.addQuest("NEW_QUEST");
}
```

### Dodawanie nowej umiejętności

1. **W GameState.getInitialSkills()**:

```javascript
{
    name: 'Nowa Umiejętność',
    damage: 45,
    manaCost: 25,
    cooldown: 0,
    description: 'Opis efektu umiejętności',
    effectType: 'damage|heal|buff', // opcjonalne
    range: 120 // opcjonalne
}
```

2. **Handling w GameScene.useSkill()**:

```javascript
// Dodaj specjalną logikę jeśli potrzebna
if (skill.name === "Nowa Umiejętność") {
  // Custom behavior
  this.createSpecialEffect(this.player.x, this.player.y);
}
```

### Dodawanie przedmiotu do sklepu

1. **W content.js - SHOP_ITEMS**:

```javascript
{
    id: 'new_item_id',
    name: 'Nowy Przedmiot',
    description: 'Opis przedmiotu i jego efektów',
    type: 'weapon|armor|potion|misc',
    price: 250,
    effect: {
        type: 'damage|defense|health|mana',
        value: 35
    },
    rarity: 'common|rare|epic|legendary'
}
```

2. **Opcjonalnie - sprite w BootScene**:

```javascript
this.createItemSprite("item_new_item", color, iconChar);
```

## 🧪 Testowanie i debugging

### Komendy konsoli deweloperskiej

```javascript
// Dodaj EXP
GameState.addExperience(1000);

// Dodaj złoto
GameState.currency += 5000;

// Odblokuj lokację
GameState.unlockLocation("DRAGON_LAIR");

// Aktywuj quest
GameState.addQuest("MAIN_QUEST_1");

// Wymaxuj statystyki
GameState.enableDebugMode();

// Reset gry
GameState.resetGame();
```

### Performance monitoring

```javascript
// W GameScene.update() - monitoring FPS
if (this.debugMode) {
  this.debugText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
}
```

### Memory leak prevention

```javascript
// Cleanup w scene transitions
scene.events.on("shutdown", () => {
  // Zniszcz timery
  if (this.someTimer) this.someTimer.destroy();

  // Zniszcz tweeny
  this.tweens.killAll();

  // Wyczyść event listenery
  this.input.keyboard.removeAllListeners();
});
```

## 📊 Optymalizacja

### Object pooling dla projektili

```javascript
// Pula obiektów dla częstych kreacji/destrukcji
this.projectilePool = [];

getProjectile() {
    if (this.projectilePool.length > 0) {
        return this.projectilePool.pop().setActive(true).setVisible(true);
    }
    return this.physics.add.sprite(0, 0, 'projectile');
}

returnProjectile(projectile) {
    projectile.setActive(false).setVisible(false);
    this.projectilePool.push(projectile);
}
```

### Sprite atlas optimization

```javascript
// W BootScene - użycie atlasów zamiast pojedynczych obrazów
this.load.multiatlas("game_atlas", "atlas/game.json", "atlas/");

// Użycie w scenach
this.add.image(x, y, "game_atlas", "sprite_name");
```

### Bounds checking optymalizacja

```javascript
// Sprawdzaj kolizje tylko dla obiektów w viewporcie
const camera = this.cameras.main;
const visibleEnemies = this.enemies.filter((enemy) =>
  Phaser.Geom.Rectangle.Overlaps(camera.worldView, enemy.getBounds())
);
```

---

**Happy coding! 🎮💻**
