import Phaser from 'phaser';
import GameState from '../GameState';
import { LOCATIONS } from '../data/locations';

export default class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Półprzezroczyste tło
        this.add.rectangle(0, 0, width, height, 0x000000, 0.85)
            .setOrigin(0)
            .setScrollFactor(0);

        // Panel mapy (niżej żeby tytuł się zmieścił)
        const panelWidth = 1100;
        const panelHeight = 620;
        const panelY = height / 2 + 10;
        const panelX = width / 2;
        this.add.image(panelX, panelY, 'ui_panel_map');

        // Tytuł (wewnątrz panelu)
        this.add.text(panelX, panelY - panelHeight / 2 + 35, '🗺️ MAPA ELDORII 🗺️', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        // Rysowanie mapy (przesunięta lekko w dół)
        this.drawMap(panelX, panelY + 20);

        // Legenda (lewy dolny róg)
        this.createLegend(panelX - panelWidth / 2 + 40, panelY + panelHeight / 2 - 140);

        // Informacje o lokacji (środek, wyżej)
        this.locationInfo = this.add.text(panelX, panelY + panelHeight / 2 - 110, '', {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Statystyki odkryć (prawy dolny róg, wyżej od krawędzi)
        this.createDiscoveryStats(panelX + panelWidth / 2 - 20, panelY + panelHeight / 2 - 35);

        // Przycisk zamknięcia (w prawym górnym rogu panelu, wewnątrz)
        this.createCloseButton(panelX + panelWidth / 2 - 30, panelY - panelHeight / 2 + 30);

        // Klawisz M do zamknięcia
        this.input.keyboard.once('keydown-M', () => {
            this.close();
        });
    }

    drawMap(centerX, centerY) {
        // Definiujemy pozycje lokacji na mapie
        const mapLocations = [
            {
                id: 'STARTING_VILLAGE',
                x: centerX - 200,
                y: centerY + 50,
                icon: '🏘️',
                name: 'Wioska Początkowa'
            },
            {
                id: 'DARK_FOREST',
                x: centerX - 50,
                y: centerY - 80,
                icon: '🌲',
                name: 'Mroczny Las'
            },
            {
                id: 'ABANDONED_RUINS',
                x: centerX + 150,
                y: centerY - 30,
                icon: '🏛️',
                name: 'Opuszczone Ruiny'
            },
            {
                id: 'MOUNTAIN_CAVE',
                x: centerX + 200,
                y: centerY - 150,
                icon: '⛰️',
                name: 'Górska Jaskinia'
            },
            {
                id: 'DRAGON_LAIR',
                x: centerX + 350,
                y: centerY - 100,
                icon: '🐉',
                name: 'Smocza Jama'
            },
            {
                id: 'CRYSTAL_LAKE',
                x: centerX - 300,
                y: centerY - 50,
                icon: '💎',
                name: 'Kryształowe Jezioro'
            },
            {
                id: 'HAUNTED_CEMETERY',
                x: centerX + 50,
                y: centerY + 100,
                icon: '⚰️',
                name: 'Nawiedzony Cmentarz'
            },
            {
                id: 'ANCIENT_TEMPLE',
                x: centerX - 150,
                y: centerY - 180,
                icon: '🛕',
                name: 'Starożytna Świątynia'
            }
        ];

        // Rysowanie ścieżek między lokacjami
        this.drawPaths(mapLocations, centerX, centerY);

        // Rysowanie lokacji
        mapLocations.forEach(location => {
            const isDiscovered = GameState.discoveredLocations.includes(location.id);
            const isCurrentLocation = this.isCurrentLocation(location.id);

            // Okrąg lokacji
            const circle = this.add.circle(location.x, location.y, 35,
                isCurrentLocation ? 0xf39c12 : (isDiscovered ? 0x27ae60 : 0x5d4037))
                .setStrokeStyle(3, isCurrentLocation ? 0xffffff : 0xa0783b);

            if (isDiscovered || isCurrentLocation) {
                circle.setInteractive({ useHandCursor: true });

                // Ikona lokacji
                this.add.text(location.x, location.y, location.icon, {
                    fontFamily: 'Arial',
                    fontSize: '28px'
                }).setOrigin(0.5);

                // Nazwa lokacji
                this.add.text(location.x, location.y + 50, location.name, {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    fontStyle: 'bold',
                    color: isCurrentLocation ? '#f39c12' : '#ffffff',
                    align: 'center',
                    wordWrap: { width: 100 }
                }).setOrigin(0.5);

                // Interakcje
                circle.on('pointerover', () => {
                    circle.setStrokeStyle(3, 0xf39c12);
                    this.showLocationInfo(location.id);
                });

                circle.on('pointerout', () => {
                    circle.setStrokeStyle(3, isCurrentLocation ? 0xffffff : 0xa0783b);
                    this.locationInfo.setText('');
                });

                circle.on('pointerdown', () => {
                    this.travelToLocation(location.id);
                });
            } else {
                // Nieodkryta lokacja - znak zapytania
                this.add.text(location.x, location.y, '?', {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    fontStyle: 'bold',
                    color: '#d4af37'
                }).setOrigin(0.5);
            }
        });

        // Znacznik gracza (pulsujący)
        const playerMarker = this.add.text(centerX - 200, centerY + 50, '👤', {
            fontFamily: 'Arial',
            fontSize: '24px'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: playerMarker,
            scale: { from: 1, to: 1.3 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    drawPaths(locations, centerX, centerY) {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xa0783b, 0.5);

        // Ścieżki między lokacjami
        const paths = [
            [0, 1], // Wioska -> Las
            [1, 2], // Las -> Ruiny
            [2, 3], // Ruiny -> Jaskinia
            [3, 4], // Jaskinia -> Smok
            [0, 5], // Wioska -> Jezioro
            [1, 7], // Las -> Świątynia
            [0, 6], // Wioska -> Cmentarz
            [6, 2]  // Cmentarz -> Ruiny
        ];

        paths.forEach(([from, to]) => {
            if (locations[from] && locations[to]) {
                const start = locations[from];
                const end = locations[to];

                graphics.beginPath();
                graphics.moveTo(start.x, start.y);
                graphics.lineTo(end.x, end.y);
                graphics.strokePath();
            }
        });
    }

    isCurrentLocation(locationId) {
        // Sprawdź czy gracz jest obecnie w tej lokacji
        return GameState.currentLocation === locationId;
    }

    showLocationInfo(locationId) {
        const location = LOCATIONS[locationId];
        if (!location) return;

        let info = `${location.name}\n${location.description}`;

        if (location.enemies) {
            info += `\n⚔️ Wrogowie: ${location.enemies.length}`;
        }

        if (location.boss) {
            info += `\n💀 Boss obecny!`;
        }

        if (location.npcs) {
            info += `\n👥 NPC: ${location.npcs.length}`;
        }

        this.locationInfo.setText(info);
    }

    travelToLocation(locationId) {
        const location = LOCATIONS[locationId];
        if (!location) return;

        // Zapisz nową lokację
        GameState.currentLocation = locationId;

        if (!GameState.discoveredLocations.includes(locationId)) {
            GameState.discoveredLocations.push(locationId);
            this.showMessage(`Odkryto nową lokację: ${location.name}!`, 0x2ecc71);
        }

        GameState.saveGame();

        // Możesz tutaj dodać logikę przejścia do nowej lokacji
        this.showMessage(`Podróżujesz do: ${location.name}`, 0x3498db);
    }

    createLegend(x, y) {
        const legend = [
            { icon: '👤', label: 'Twoja pozycja', color: '#f39c12' },
            { icon: '🟢', label: 'Odkryte lokacje', color: '#27ae60' },
            { icon: '⚫', label: 'Nieodkryte', color: '#d4af37' }
        ];

        this.add.text(x, y - 20, 'LEGENDA:', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffff'
        });

        legend.forEach((item, index) => {
            const itemY = y + index * 25 + 10;

            this.add.text(x, itemY, item.icon, {
                fontFamily: 'Arial',
                fontSize: '16px'
            });

            this.add.text(x + 30, itemY, item.label, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: item.color
            });
        });
    }

    createDiscoveryStats(x, y) {
        const discovered = GameState.discoveredLocations.length;
        const total = Object.keys(LOCATIONS).length + 3; // +3 dla dodatkowych lokacji

        const stats = `Odkryto lokacji: ${discovered}/${total}`;

        this.add.text(x, y, stats, {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#d4af37',
            align: 'right'
        }).setOrigin(1, 0.5);
    }

    showMessage(text, color) {
        const { width } = this.cameras.main;
        const message = this.add.text(width / 2, 100, text, {
            fontFamily: 'Arial',
            fontSize: '22px',
            fontStyle: 'bold',
            color: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 50,
            duration: 2500,
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

    close() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
