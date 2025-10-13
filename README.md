# 🎮 Legends of Eldoria

![Legends of Eldoria](https://img.shields.io/badge/Game-RPG-blueviolet)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Phaser](https://img.shields.io/badge/Phaser-3.70.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📖 Opis

**Legends of Eldoria** to gra RPG osadzona w fantastycznym świecie Eldorii, pełnym magii, przygód i niebezpieczeństw. Gracz wciela się w postać bohatera, który wyrusza na wielką podróż, aby odkryć tajemnice zapomnianych ruin, pokonać potężnych bossów i zbadać nieznane obszary.

## ✨ Cechy gry

### 🎨 Tworzenie postaci

- Wybór spośród 4 ras: Człowiek, Elf, Krasnolud, Ork
- 4 klasy postaci: Wojownik, Mag, Łotrzyk, Strażnik
- Customizacja imienia i wyglądu postaci
- Unikalne bonusy i umiejętności dla każdej kombinacji rasy i klasy

### 🗺️ Eksploracja

- Otwarty świat z różnorodnymi lokacjami
- Proceduralne generowanie dungeonów i jaskiń
- Ukryte skarby i tajemne przejścia
- Wiele typów terenu: lasy, jaskinie, ruiny, wioski

### ⚔️ System walki

- Dynamiczny system walki w czasie rzeczywistym
- Umiejętności specjalne dla każdej klasy
- System many i punktów zdrowia
- Różnorodne typy wrogów z unikalnymi zachowaniami
- Epickie walki z bossami

### 📜 Questy

- Rozbudowana fabuła główna
- Liczne zadania poboczne
- Zlecenia od NPC
- System nagród (doświadczenie, złoto, przedmioty)

### 📊 Rozwój postaci

- System poziomów i doświadczenia
- Automatyczne ulepszanie atrybutów przy awansie
- Ekwipunek i system przedmiotów
- Zbroje, bronie i akcesoria
- Mikstury zdrowia i many

### 💬 Interakcje z NPC

- Dialogi z mieszkańcami Eldorii
- Kupcy oferujący przedmioty
- Kowale ulepszający ekwipunek
- Tajemniczy wędrowcy z legendarnymi questami

## 🎮 Sterowanie

### Poruszanie się

- **W/↑** - Ruch w górę
- **S/↓** - Ruch w dół
- **A/←** - Ruch w lewo
- **D/→** - Ruch w prawo

### Akcje

- **SPACJA** - Atak podstawowy
- **1-4** - Użycie umiejętności specjalnych (kosztują manę)
- **E** - Interakcja/zbieranie przedmiotów

### Menu

- **I** - Ekwipunek (zarządzanie przedmiotami, ekwipowanie, używanie mikstur)
- **Q** - Lista questów (aktywne, ukończone, dostępne)
- **M** - Mapa świata (odkrywanie lokacji, szybka podróż)
- **ESC** - Menu pauzy (zapisz grę, wyjdź)

## 🚀 Uruchomienie gry

### Wymagania

- Node.js 14.0 lub nowszy
- npm lub yarn

### Instalacja

1. Sklonuj repozytorium:

```bash
git clone https://github.com/yourusername/legends-of-eldoria.git
cd legends-of-eldoria
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Uruchom grę w trybie deweloperskim:

```bash
npm start
```

4. Otwórz przeglądarkę i wejdź na:

```
http://localhost:3000
```

### Build produkcyjny

```bash
npm run build
```

## 🏗️ Struktura projektu

```
legends-of-eldoria/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── game/
│   │   ├── config.js                 # Konfiguracja gry
│   │   ├── GameState.js              # Zarządzanie stanem gry
│   │   ├── scenes/
│   │   │   ├── BootScene.js          # Ładowanie zasobów
│   │   │   ├── MainMenuScene.js      # Menu główne
│   │   │   ├── CharacterCreationScene.js  # Tworzenie postaci
│   │   │   ├── GameScene.js          # Główna scena gry
│   │   │   ├── PauseMenuScene.js     # Menu pauzy
│   │   │   ├── InventoryScene.js     # System ekwipunku
│   │   │   ├── QuestScene.js         # Dziennik questów
│   │   │   ├── MapScene.js           # Mapa świata
│   │   │   ├── ShopScene.js          # Sklep i handel
│   │   │   └── LevelUpScene.js       # Ekran awansu poziomu
│   │   └── data/
│   │       ├── content.js            # Questy, dialogi, przedmioty
│   │       └── locations.js          # Lokacje i generator map
│   ├── components/
│   │   └── game/
│   │       └── Game.js               # Główny komponent React
│   ├── styles/
│   │   └── GlobalStyles.js           # Style globalne
│   ├── App.js                        # Główna aplikacja
│   └── index.js                      # Punkt wejścia
└── package.json
```

## 🛠️ Technologie

- **React 18.2.0** - Framework UI
- **Phaser 3.70.0** - Engine gry 2D
- **Styled Components 6.1.8** - Stylowanie CSS-in-JS
- **Create React App** - Konfiguracja projektu

## 📋 Funkcje do implementacji

### W trakcie rozwoju:

- [ ] System ekwipunku i inwentarza
- [ ] Rozbudowany interfejs questów
- [ ] System dialogów z wyborami
- [ ] Sklepy i handel z NPC
- [ ] Większa różnorodność lokacji
- [ ] Animacje postaci i wrogów
- [ ] System dźwięku i muzyki
- [ ] Multiplayer (długoterminowy plan)

### Gotowe:

- [x] Tworzenie postaci
- [x] System walki podstawowy
- [x] Eksploracja świata
- [x] System poziomów
- [x] Zapisywanie/wczytywanie gry
- [x] Menu główne i pauza
- [x] Podstawowy system questów

## 🤝 Wkład w projekt

Chcesz pomóc w rozwoju gry? Wspaniale!

1. Fork projektu
2. Stwórz branch z nową funkcją (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📝 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

## 👨‍💻 Autor

Projekt stworzony z pasją do gier RPG i programowania.

## 🙏 Podziękowania

- **Phaser Team** - za wspaniały engine do tworzenia gier
- **React Team** - za potężny framework UI
- **Społeczność gamedev** - za inspirację i wsparcie

---

**Miłej zabawy w Eldorii! ⚔️🛡️🏰**
