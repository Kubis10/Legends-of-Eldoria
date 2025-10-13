# 🎮 Legends of Eldoria

![Legends of Eldoria](https://img.shields.io/badge/Game-RPG-blueviolet)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Phaser](https://img.shields.io/badge/Phaser-3.90.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📖 Opis

**Legends of Eldoria** to kompletna gra RPG osadzona w fantastycznym świecie Eldorii, pełnym magii, przygód i niebezpieczeństw. Gracz wciela się w postać bohatera, który wyrusza na wielką podróż przez 8 różnorodnych lokacji, aby odkryć tajemnice zapomnianych ruin, pokonać potężnych bossów i zbadać nieznane obszary. Gra oferuje pełny system progresji, bogaty interfejs użytkownika i głęboką rozgrywkę RPG.

## ✨ Cechy gry

### 🎨 Tworzenie postaci

- **4 rasy**: Człowiek, Elf, Krasnolud, Ork - każda z unikalnymi bonusami
- **4 klasy**: Wojownik, Mag, Łotrzyk, Strażnik - różne style gry
- **Customizacja**: Wybór imienia i personalizacja wyglądu
- **Unikalne umiejętności**: Każda kombinacja rasy i klasy oferuje inne możliwości

### 🗺️ Eksploracja świata

- **8 kompletnych lokacji**:
  - 🏘️ Wioska Początkowa (NPC, sklepy, questy)
  - 🌲 Mroczny Las (pierwsze wyzwania)
  - 🏛️ Opuszczone Ruiny (starożytne tajemnice)
  - ⛰️ Górska Jaskinia (niebezpieczne tunele)
  - 🐉 Smocza Jama (legendarny boss)
  - 💎 Kryształowe Jezioro (magiczne moce)
  - ⚰️ Nawiedzony Cmentarz (duchy i nieumarli)
  - 🛕 Starożytna Świątynia (ostateczne wyzwanie)
- **Dynamiczny świat**: Lokacje odblokowywane przez progresję questów
- **Interaktywna mapa**: Pełna mapa świata z szybką podróżą
- **System odkrywania**: Śledzenie postępu eksploracji

### ⚔️ System walki

- **Dynamiczna walka w czasie rzeczywistym**
- **Umiejętności specjalne**: 2 unikalne umiejętności dla każdej klasy
- **System many i zdrowia**: Strategiczne zarządzanie zasobami
- **Różnorodne wrogowie**: Gobliny, szkielety, orki, trolle i inne
- **Epickie bossy**: Potężni przeciwnicy w wybranych lokacjach
- **Paski zdrowia**: Wizualne wskaźniki zdrowia wrogów
- **Efekty wizualne**: Komunikaty obrażeń i doświadczenia

### 📜 System questów

- **Rozbudowana fabuła główna**: Główne questy prowadzące przez historię
- **Zadania poboczne**: Dodatkowe wyzwania i nagrody
- **Progresja lokacji**: Questy odblokowują nowe obszary
- **Interaktywny dziennik**: Śledzenie aktywnych i ukończonych zadań
- **System nagród**: Doświadczenie, złoto i przedmioty za wykonanie

### 📊 Rozwój postaci

- **System poziomów**: Automatyczny wzrost statystyk przy awansie
- **Atrybuty**: Siła, Zręczność, Inteligencja wpływają na rozgrywkę
- **Zdrowie i mana**: Strategiczne zarządzanie zasobami
- **Ekwipunek**: Bronie, zbroje i przedmioty consumable
- **Waluta**: System złota do zakupów u kupców

### 🏪 System handlu

- **NPC kupcy**: Różni sprzedawcy w wiosce początkowej
- **Kowal**: Specjalistyczne bronie i zbroje
- **Kupiec**: Mikstury i podstawowe przedmioty
- **Przejrzysty interfejs**: Łatwe zarządzanie zakupami i sprzedażą
- **Zarządzanie złotem**: Widoczny stan finansów podczas transakcji

### 💬 Interakcje z NPC

- **Starszy Wioski**: Wydaje główne questy i oferuje wskazówki
- **Kupcy**: Oferują różnorodne przedmioty
- **System dialogów**: Naturalne interakcje z postaciami
- **Lokalizacja w wiosce**: Łatwe odnalezienie potrzebnych NPC

### 🎨 Interfejs użytkownika

- **Nowoczesny design**: Zaokrąglone narożniki i ciepła paleta kolorów
- **Intuicyjna nawigacja**: Łatwe przechodzenie między menu
- **Responsive design**: Dostosowanie do różnych rozdzielczości
- **Animacje**: Płynne przejścia i efekty wizualne
- **Przejrzyste informacje**: Czytelne wyświetlanie danych gracza

## 🎮 Sterowanie

### Poruszanie się

- **W/↑** - Ruch w górę
- **S/↓** - Ruch w dół
- **A/←** - Ruch w lewo
- **D/→** - Ruch w prawo

### Akcje

- **SPACJA** - Atak podstawowy
- **1-2** - Użycie umiejętności specjalnych (kosztują manę)
- **E** - Interakcja/zbieranie przedmiotów

### Menu i interfejs

- **I** - Ekwipunek (zarządzanie przedmiotami, używanie mikstur)
- **Q** - Lista questów (aktywne, ukończone, postęp)
- **M** - Mapa świata (odkrywanie lokacji, szybka podróż)
- **ESC** - Menu pauzy (zapisz grę, powrót do menu, wyjście)

### Specjalne

- **F10** - Tryb debug (maksymalne statystyki, złoto, odblokowane lokacje)

## 🚀 Uruchomienie gry

### Wymagania

- Node.js 14.0 lub nowszy
- npm lub yarn
- Nowoczesna przeglądarka internetowa

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
│   │   ├── config.js                 # Konfiguracja gry Phaser
│   │   ├── GameState.js              # Zarządzanie stanem gry i zapisami
│   │   ├── scenes/
│   │   │   ├── BootScene.js          # Ładowanie zasobów i UI textures
│   │   │   ├── MainMenuScene.js      # Menu główne z opcjami
│   │   │   ├── CharacterCreationScene.js  # Kreator postaci (rasa/klasa)
│   │   │   ├── GameScene.js          # Główna scena rozgrywki
│   │   │   ├── PauseMenuScene.js     # Menu pauzy z opcjami
│   │   │   ├── InventoryScene.js     # Zarządzanie ekwipunkiem
│   │   │   ├── QuestScene.js         # Dziennik questów i postęp
│   │   │   ├── MapScene.js           # Mapa świata z podróżami
│   │   │   ├── ShopScene.js          # Sklep z przewijaniem i handlem
│   │   │   └── LevelUpScene.js       # Ekran awansu poziomu
│   │   └── data/
│   │       ├── content.js            # Questy, dialogi, przedmioty sklepu
│   │       └── locations.js          # 8 lokacji z wrogami i bossami
│   ├── components/
│   │   └── game/
│   │       └── Game.js               # Główny komponent React
│   ├── styles/
│   │   └── GlobalStyles.js           # Style globalne CSS-in-JS
│   ├── App.js                        # Główna aplikacja React
│   └── index.js                      # Punkt wejścia aplikacji
├── package.json
├── README.md
└── DEVELOPMENT.md
```

## 🛠️ Technologie

- **React 18.2.0** - Framework UI do zarządzania aplikacją
- **Phaser 3.90.0** - Engine gry 2D z najnowszymi funkcjami
- **Styled Components 6.1.8** - Stylowanie CSS-in-JS
- **Create React App** - Konfiguracja i build system
- **LocalStorage** - Zapisywanie stanu gry lokalnie

## 🎯 Aktualne funkcje

### ✅ W pełni zaimplementowane:

- **Sistema postaci**: Pełne tworzenie z 4 rasami i 4 klasami
- **Rozgrywka**: Kompletny system walki z umiejętnościami
- **Świat gry**: 8 różnorodnych lokacji z unikalnymi wrogami
- **Progresja**: System poziomów, doświadczenia i questów
- **Interfejs**: Nowoczesny UI z zaokrąglonymi narożnikami
- **Ekwipunek**: Pełne zarządzanie przedmiotami i miksturami
- **Handel**: Funkcjonalny sklep z kupcem i kowalem
- **Mapa**: Interaktywna mapa świata z szybką podróżą
- **Questy**: Dziennik questów z śledzeniem postępu
- **Zapisywanie**: Automatyczne zapisywanie stanu gry
- **Boss fights**: Epickie walki z potężnymi przeciwnikami
- **Debug mode**: Tryb deweloperski z F10 do testów
- **Loading screens**: Płynne przejścia między lokacjami
- **NPC interactions**: Pełne interakcje ze starszym wioski i kupcami

### 🔧 Szczegóły techniczne:

- **Proceduralne tekstury UI**: Generowane w BootScene
- **Zaokrąglone interfejsy**: Kompatybilność z Phaser 3.90.0
- **Maskowane przewijanie**: W sklepie i innych długich listach
- **Dynamiczne pozycjonowanie**: Responsive design UI
- **Efekty wizualne**: Animacje, komunikaty i przejścia
- **Optymalizacja**: Object pooling i zarządzanie pamięcią

## 📊 Statystyki gry

### Lokacje: 8 kompletnych obszarów

- Każda z unikalnymi wrogami i wyzwaniami
- 3 lokacje z bossami (Smocza Jama, Nawiedzony Cmentarz, Starożytna Świątynia)
- System progresywnego odblokowywania

### Klasy postaci: 4 różne style gry

- **Wojownik**: Wytrzymały melee fighter
- **Mag**: Potężne zaklęcia dystansowe
- **Łotrzyk**: Szybki i zwinny assassin
- **Strażnik**: Wszechstronny łucznik

### Sistema questów

- Główne questy prowadzące fabułę
- Zadania poboczne dla dodatkowej zawartości
- System odblokowywania nowych lokacji

## 📋 Roadmap przyszłych funkcji

### Wersja 1.1 (Planowana):

- [ ] Rozszerzone animacje postaci
- [ ] System dźwięku i muzyki
- [ ] Więcej typów przedmiotów (pierścienie, naszyjniki)
- [ ] Dodatkowe umiejętności dla każdej klasy
- [ ] Losowe eventy w świecie
- [ ] System achievementów

### Wersja 2.0 (Długoterminowa):

- [ ] Multiplayer cooperativo
- [ ] Rozbudowany crafting system
- [ ] Rozgałęziona fabuła z wyborami
- [ ] Dodatkowe rasy i klasy
- [ ] Większy świat z więcej lokacjami
- [ ] System gildii i frakcji

## 🎮 Jak grać

### Pierwsze kroki:

1. **Stwórz postać** - Wybierz rasę i klasę według stylu gry
2. **Poznaj wioskę** - Porozmawiaj ze Starszym i kupcami
3. **Pierwszy quest** - Zacznij od "Początek przygody"
4. **Eksploracja** - Odkrywaj Mroczny Las i kolejne lokacje
5. **Rozwój** - Zdobywaj doświadczenie i ulepszaj postać

### Wskazówki:

- **Zarządzaj maną** - Umiejętności specjalne są potężne ale kosztowne
- **Kupuj mikstury** - Regularnie zaopatruj się u kupca
- **Eksploruj** - Każda lokacja ma ukryte skarby
- **Czytaj questy** - Dziennik pomoże Ci śledzić cele
- **Używaj mapy** - Szybka podróż oszczędza czas

## 🔧 Tryb debug

Dla deweloperów i testerów dostępny jest tryb debug:

- **Aktywacja**: Naciśnij F10 w grze
- **Funkcje**: Maksymalne statystyki, dużo złota, wszystkie lokacje odblokowane
- **Użycie**: Idealny do testowania końcowych lokacji i bossów

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
