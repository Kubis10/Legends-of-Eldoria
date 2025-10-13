# Legends of Eldoria - Dokumentacja Deweloperska

## Architektura gry

### Struktura scen (Phaser)

1. **BootScene** - Ładowanie zasobów graficznych
2. **MainMenuScene** - Menu główne z opcjami
3. **CharacterCreationScene** - Kreator postaci
4. **GameScene** - Główna rozgrywka
5. **PauseMenuScene** - Menu pauzy

### System zarządzania stanem (GameState)

GameState to singleton zarządzający całym stanem gry:

- Dane gracza (imię, klasa, rasa, poziom, statystyki)
- Ekwipunek i przedmioty
- Questy aktywne i ukończone
- Postęp w grze
- Zapisywanie/wczytywanie (localStorage)

### Klasy postaci

#### Wojownik

- **Zdrowie**: 120
- **Mana**: 30
- **Siła**: 8
- **Zręczność**: 4
- **Inteligencja**: 2
- **Umiejętności**: Mocne uderzenie, Tarcza obronna

#### Mag

- **Zdrowie**: 70
- **Mana**: 150
- **Siła**: 2
- **Zręczność**: 3
- **Inteligencja**: 10
- **Umiejętności**: Kula ognia, Lodowy pocisk

#### Łotrzyk

- **Zdrowie**: 90
- **Mana**: 60
- **Siła**: 5
- **Zręczność**: 9
- **Inteligencja**: 4
- **Umiejętności**: Szybki atak, Trucizna

#### Strażnik

- **Zdrowie**: 100
- **Mana**: 80
- **Siła**: 6
- **Zręczność**: 7
- **Inteligencja**: 5
- **Umiejętności**: Strzał przeszywający, Deszcz strzał

### Rasy

#### Człowiek

- Zdrowie: +10
- Mana: +5
- Siła: +2

#### Elf

- Zdrowie: +5
- Mana: +15
- Zręczność: +3

#### Krasnolud

- Zdrowie: +15
- Siła: +4

#### Ork

- Zdrowie: +20
- Siła: +5

## System walki

### Atak podstawowy

- Obrażenia bazowe: 20 + (Siła × 2)
- Zasięg: 50 pikseli
- Bez kosztu many

### Umiejętności specjalne

- Każda klasa ma 2 unikalne umiejętności
- Koszt many: 8-25 MP
- Obrażenia: bazowe + (Inteligencja × 2)
- Zasięg: 100 pikseli

### Wrogowie

| Typ      | Zdrowie | Obrażenia | Doświadczenie |
| -------- | ------- | --------- | ------------- |
| Goblin   | 50      | 10        | 25            |
| Szkielet | 70      | 15        | 35            |
| Ork      | 100     | 20        | 50            |
| Troll    | 150     | 25        | 75            |

## System przedmiotów

### Typy przedmiotów

- **Broń** - Zwiększa obrażenia
- **Zbroja** - Zwiększa obronę
- **Mikstury** - Odnawia zdrowie/manę
- **Skarby** - Złoto i cenne przedmioty

### Sklep

| Przedmiot        | Typ    | Cena | Efekt           |
| ---------------- | ------ | ---- | --------------- |
| Mikstura zdrowia | Potion | 25   | +50 HP          |
| Mikstura many    | Potion | 30   | +50 MP          |
| Żelazny miecz    | Weapon | 150  | +25 DMG         |
| Stalowa zbroja   | Armor  | 200  | +30 DEF         |
| Elfi łuk         | Weapon | 250  | +30 DMG, +5 DEX |
| Magiczna różdżka | Weapon | 300  | +35 DMG, +5 INT |

## System questów

### Typy questów

- **Główne (main)** - Fabuła gry
- **Poboczne (side)** - Dodatkowe zadania
- **Boss** - Epiczne wyzwania

### Przykładowe questy

#### Początek przygody (Główny)

- Cel: Pokonaj 5 goblinów
- Nagroda: 150 EXP, 100 złota

#### Zagrożenie szkieletów (Główny)

- Cel: Pokonaj 3 szkielety
- Nagroda: 250 EXP, 200 złota

#### Władca trolli (Boss)

- Cel: Pokonaj Króla Trolli
- Nagroda: 1000 EXP, 500 złota, Miecz Króla

## Generator map

### Typy lokacji

#### Las (Forest)

- Algorytm losowy
- 15% drzew
- 5% wody
- 80% trawy

#### Dungeon

- Algorytm generowania pokoi
- 8 pokoi połączonych korytarzami
- Losowe rozmieszczenie wrogów i skarbów

#### Jaskinia (Cave)

- Algorytm cellular automata
- Naturalne, organiczne kształty
- 5 iteracji symulacji

## Zapisywanie gry

Gra zapisuje się automatycznie:

- Co minutę podczas rozgrywki
- Przy wejściu do menu pauzy
- Przy wyjściu z gry

Dane zapisywane w localStorage:

```javascript
{
  player: { /* dane gracza */ },
  inventory: [ /* przedmioty */ ],
  quests: [ /* aktywne questy */ ],
  completedQuests: [ /* ukończone */ ],
  discoveredLocations: [ /* odkryte */ ],
  defeatedEnemies: [ /* pokonani */ ],
  gameTime: 0,
  currency: 100,
  timestamp: Date.now()
}
```

## Rozszerzanie gry

### Dodawanie nowego wroga

```javascript
// W GameScene.createEnemies()
const newEnemy = {
  key: "enemy_newtype",
  health: 200,
  damage: 30,
  exp: 100,
  name: "Nowy Wróg",
};
```

### Dodawanie nowego questu

```javascript
// W src/game/data/content.js
NEW_QUEST: {
  id: 'new_quest_id',
  title: 'Tytuł questu',
  description: 'Opis zadania',
  type: 'main', // lub 'side', 'boss'
  objectives: [
    { type: 'kill', target: 'Wróg', count: 5, current: 0 }
  ],
  experienceReward: 200,
  goldReward: 150,
  itemReward: null
}
```

### Dodawanie nowej umiejętności

```javascript
// W GameState.getInitialSkills()
{
  name: 'Nazwa umiejętności',
  damage: 40,
  manaCost: 20,
  cooldown: 0
}
```

## Testowanie

### Tryb debug

Ustaw w GameScene config:

```javascript
physics: {
  arcade: {
    debug: true; // Pokazuje hitboxy i fizyki
  }
}
```

### Szybkie testowanie

- Można modyfikować `GameState.player` w konsoli deweloperskiej
- Używać `GameState.addExperience(1000)` do szybkiego levelowania
- `GameState.currency += 10000` do dodania złota

## Optymalizacja

### Wydajność

- Używaj object pooling dla często tworzonych obiektów
- Ogranicz liczbę wrogów na ekranie
- Używaj sprite atlasów zamiast pojedynczych obrazów

### Rozmiar buildu

- Kompresja grafik (WebP, PNG optimized)
- Tree shaking dla niewykorzystanego kodu
- Code splitting dla różnych scen

## Roadmap

### Wersja 1.0 (Aktualna)

- ✅ System tworzenia postaci
- ✅ Podstawowa walka
- ✅ Eksploracja
- ✅ System poziomów
- ✅ Zapisywanie/wczytywanie

### Wersja 1.1 (Planowana)

- [ ] Pełny system ekwipunku
- [ ] Rozbudowane dialogi
- [ ] Sklepy i handel
- [ ] Więcej lokacji

### Wersja 2.0 (Przyszłość)

- [ ] Animacje sprite'ów
- [ ] System dźwięku
- [ ] Muzyka tematyczna
- [ ] Multiplayer

---

**Powodzenia w tworzeniu gry!** 🎮
