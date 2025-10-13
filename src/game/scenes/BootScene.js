import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Ładowanie ekranu ładowania
        this.load.on('progress', (value) => {
            console.log('Loading:', value);
        });

        this.load.on('complete', () => {
            console.log('Loading complete');
        });

        // Tutaj wygeneruj lepsze (proceduralne) assety gry
        this.createGeneratedAssets();
    }

    create() {
        this.scene.start('MainMenuScene');
    }

    createGeneratedAssets() {
        // UI panele i przyciski (z gradientem i zaokrągleniem)
        this.createPanelTexture('ui_panel_small', 250, 120);
        this.createPanelTexture('ui_panel_pause', 500, 350); // panel dla pauzy
        this.createPanelTexture('ui_panel_skillbar', 500, 70);
        this.createPanelTexture('ui_panel_inventory', 900, 560);
        this.createPanelTexture('ui_panel_medium', 800, 600);
        this.createPanelTexture('ui_panel_large', 1000, 600);
        this.createPanelTexture('ui_panel_map', 1100, 620);
        this.createCardTexture('ui_card_quest', 900, 100);
        this.createCardTexture('ui_card_item', 280, 120);

        this.createButtonTexture('ui_button_small', 160, 40, 0x2c3e50);
        this.createButtonTexture('ui_button_large', 300, 50, 0x2c3e50);
        this.createButtonTexture('ui_button_close', 40, 40, 0xe74c3c);
        this.createSlotTexture('ui_slot', 75, 75);
        this.createSlotTexture('ui_slot_wide', 100, 50);
        this.createSlotTexture('ui_equipped', 130, 60);

        // Kafelki terenu z prostymi wzorami
        this.createTileGrass('tile_grass', 32, 32);
        this.createTileStone('tile_stone', 32, 32);
        this.createTileWater('tile_water', 32, 32);
        this.createTileWall('tile_wall', 32, 32);
        this.createTileDoor('tile_door', 32, 32);

        // Ikony przedmiotów
        this.createIconSword('icon_weapon', 38, 38);
        this.createIconShield('icon_armor', 38, 38);
        this.createIconPotion('icon_potion_red', 38, 38, 0xe74c3c);
        this.createIconCoin('icon_gold', 38, 38);
        this.createIconChest('icon_chest', 38, 38);
        this.createIconRing('icon_accessory', 38, 38);

        // Proste sylwetki gracza (klasy) z cieniowaniem
        this.createPlayerIcon('player_warrior', 32, 32, 0x4a90e2);
        this.createPlayerIcon('player_mage', 32, 32, 0x9b59b6);
        this.createPlayerIcon('player_rogue', 32, 32, 0x2ecc71);
        this.createPlayerIcon('player_ranger', 32, 32, 0xe67e22);

        // Wrogowie
        this.createEnemyIcon('enemy_goblin', 32, 32, 0x27ae60);
        this.createEnemyIcon('enemy_skeleton', 32, 32, 0xbdc3c7);
        this.createEnemyIcon('enemy_orc', 32, 32, 0x16a085);
        this.createEnemyIcon('enemy_troll', 40, 40, 0x8e44ad);
        this.createEnemyIcon('enemy_dragon', 48, 48, 0xc0392b, true);

        // NPC (proste ikony)
        this.createNPCIcon('npc_elder', 32, 32, 0xf1c40f);       // złoty
        this.createNPCIcon('npc_merchant', 32, 32, 0x3498db);    // niebieski
        this.createNPCIcon('npc_blacksmith', 32, 32, 0x95a5a6);  // stalowy
    }

    // ===== Helpers: drawing utilities =====
    drawVerticalGradient(graphics, x, y, w, h, topColor, bottomColor, steps = 24) {
        for (let i = 0; i < steps; i++) {
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(topColor),
                Phaser.Display.Color.ValueToColor(bottomColor),
                steps - 1,
                i
            );
            const col = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
            const yPos = y + Math.round((h / steps) * i);
            const sliceH = Math.ceil(h / steps) + 1;
            graphics.fillStyle(col, 1);
            graphics.fillRect(x, yPos, w, sliceH);
        }
    }

    drawRoundedGradient(graphics, x, y, w, h, topColor, bottomColor, radius, steps = 24) {
        // Prostsze podejście - rysuj pełny zaokrąglony prostokąt dla każdego koloru
        radius = Math.min(radius, Math.min(w, h) / 2);

        // Rysuj od dołu do góry, żeby górne warstwy przykryły dolne
        for (let i = steps - 1; i >= 0; i--) {
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(topColor),
                Phaser.Display.Color.ValueToColor(bottomColor),
                steps - 1,
                i
            );
            const col = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

            // Oblicz obszar dla tego koloru
            const startY = (h / steps) * i;
            const endY = h;
            const currentH = endY - startY;

            if (currentH > 0) {
                graphics.fillStyle(col, 1);
                this.drawRoundedRect(graphics, x, y + startY, w, currentH, radius, true);
            }
        }
    }

    drawRoundedRect(graphics, x, y, width, height, radius, filled = false) {
        // Upewnij się, że radius nie jest większy niż połowa mniejszego wymiaru
        radius = Math.min(radius, Math.min(width, height) / 2);

        graphics.beginPath();
        graphics.moveTo(x + radius, y);
        graphics.lineTo(x + width - radius, y);
        graphics.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
        graphics.lineTo(x + width, y + height - radius);
        graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
        graphics.lineTo(x + radius, y + height);
        graphics.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
        graphics.lineTo(x, y + radius);
        graphics.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2, false);
        graphics.closePath();

        if (filled) {
            graphics.fillPath();
        } else {
            graphics.strokePath();
        }
    }

    createPanelTexture(key, width, height, baseColor = 0x4a2c2a) {
        const g = this.add.graphics();
        const radius = 12;
        // Jednolity kolor tła (bez gradientu) z zaokrąglonymi rogami
        g.fillStyle(0x5b3a32, 1); // ciepły brąz
        try {
            g.fillRoundedRect(0, 0, width, height, radius);
        } catch (e) {
            this.drawRoundedRect(g, 0, 0, width, height, radius, true);
        }
        // Obrys (złoty) - dopasowany promień (odrobinę mniejszy od tła)
        g.lineStyle(4, 0xd4af37, 1);
        const borderRadius = Math.max(radius - 2, 4);
        try {
            g.strokeRoundedRect(2, 2, width - 4, height - 4, borderRadius);
        } catch (e) {
            this.drawRoundedRect(g, 2, 2, width - 4, height - 4, borderRadius, false);
        }
        g.generateTexture(key, width, height);
        g.destroy();
    }

    createButtonTexture(key, width, height, color) {
        const g = this.add.graphics();
        const radius = 10;
        // Jednolity kolor tła przycisku
        const fillColor = (typeof color === 'number') ? color : 0x3b4756;
        g.fillStyle(fillColor, 1);
        try {
            g.fillRoundedRect(0, 0, width, height, radius);
        } catch (e) {
            this.drawRoundedRect(g, 0, 0, width, height, radius, true);
        }
        // Obrys
        g.lineStyle(3, 0xd4af37, 0.9);
        const borderRadius = Math.max(radius - 1.5, 4);
        try {
            g.strokeRoundedRect(1.5, 1.5, width - 3, height - 3, borderRadius);
        } catch (e) {
            this.drawRoundedRect(g, 1.5, 1.5, width - 3, height - 3, borderRadius, false);
        }
        g.generateTexture(key, width, height);
        g.destroy();
    }

    createSlotTexture(key, width, height) {
        const g = this.add.graphics();
        const radius = 8;
        // Jednolity kolor slotu
        g.fillStyle(0x4a3a2f, 1);
        try {
            g.fillRoundedRect(0, 0, width, height, radius);
        } catch (e) {
            this.drawRoundedRect(g, 0, 0, width, height, radius, true);
        }
        g.lineStyle(2, 0xa0783b, 1);
        const borderRadius = Math.max(radius - 1, 3);
        try {
            g.strokeRoundedRect(1, 1, width - 2, height - 2, borderRadius);
        } catch (e) {
            this.drawRoundedRect(g, 1, 1, width - 2, height - 2, borderRadius, false);
        }
        g.generateTexture(key, width, height);
        g.destroy();
    }

    createCardTexture(key, width, height) {
        const g = this.add.graphics();
        const radius = 12;
        // Jednolity kolor karty (bez połysku)
        g.fillStyle(0x4e342e, 1);
        try {
            g.fillRoundedRect(0, 0, width, height, radius);
        } catch (e) {
            this.drawRoundedRect(g, 0, 0, width, height, radius, true);
        }
        g.lineStyle(3, 0x8b6914, 0.9);
        const borderRadius = Math.max(radius - 1.5, 4);
        try {
            g.strokeRoundedRect(1.5, 1.5, width - 3, height - 3, borderRadius);
        } catch (e) {
            this.drawRoundedRect(g, 1.5, 1.5, width - 3, height - 3, borderRadius, false);
        }
        g.generateTexture(key, width, height);
        g.destroy();
    }

    // ===== Terrain tiles =====
    createTileGrass(key, w, h) {
        const g = this.add.graphics();
        this.drawVerticalGradient(g, 0, 0, w, h, 0x3fae5a, 0x2d8a46, 12);
        g.fillStyle(0xffffff, 0.06);
        for (let i = 0; i < 20; i++) {
            g.fillRect(Phaser.Math.Between(1, w - 3), Phaser.Math.Between(1, h - 3), 2, 2);
        }
        g.lineStyle(1, 0x1c5e31, 0.6);
        g.strokeRect(0.5, 0.5, w - 1, h - 1);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createTileStone(key, w, h) {
        const g = this.add.graphics();
        this.drawVerticalGradient(g, 0, 0, w, h, 0x9aa3a7, 0x6d7478, 10);
        g.fillStyle(0x000000, 0.15);
        for (let i = 0; i < 12; i++) {
            const sx = Phaser.Math.Between(2, w - 6);
            const sy = Phaser.Math.Between(2, h - 6);
            g.fillRect(sx, sy, Phaser.Math.Between(2, 4), Phaser.Math.Between(1, 2));
        }
        g.lineStyle(1, 0x4b5256, 0.6);
        g.strokeRect(0.5, 0.5, w - 1, h - 1);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createTileWater(key, w, h) {
        const g = this.add.graphics();
        this.drawVerticalGradient(g, 0, 0, w, h, 0x4aa3df, 0x1d5ea8, 16);
        g.lineStyle(2, 0xffffff, 0.2);
        for (let i = 0; i < 3; i++) {
            const y = (h / 4) * (i + 1);
            g.beginPath();
            g.moveTo(2, y);
            for (let x = 2; x < w - 2; x += 4) {
                g.lineTo(x, y + Math.sin(x * 0.5 + i) * 1.5);
            }
            g.strokePath();
        }
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createTileWall(key, w, h) {
        const g = this.add.graphics();
        this.drawVerticalGradient(g, 0, 0, w, h, 0x485460, 0x2b3238, 8);
        g.lineStyle(1, 0x1d2226, 0.8);
        // cegiełki
        for (let y = 0; y < h; y += 8) {
            for (let x = (y / 8) % 2 === 0 ? 0 : 4; x < w; x += 8) {
                g.strokeRect(x + 0.5, y + 0.5, 8, 8);
            }
        }
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createTileDoor(key, w, h) {
        const g = this.add.graphics();
        this.drawVerticalGradient(g, 0, 0, w, h, 0x8b5a2b, 0x5a3a1b, 10);
        g.lineStyle(2, 0x3a220f, 0.8);
        // deski
        for (let x = 4; x < w; x += 8) {
            g.moveTo(x, 2);
            g.lineTo(x, h - 2);
        }
        g.strokePath();
        // klamka
        g.fillStyle(0xf1c40f, 0.9);
        g.fillCircle(w - 8, h / 2, 2);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    // ===== Icons and characters =====
    createPlayerIcon(key, w, h, color) {
        const g = this.add.graphics();
        // cień
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(w / 2 + 2, h - 4, w * 0.6, 6);
        // ciało
        const top = Phaser.Display.Color.ValueToColor(color).brighten(20).color;
        const bottom = Phaser.Display.Color.ValueToColor(color).darken(20).color;
        this.drawVerticalGradient(g, 4, 6, w - 8, h - 10, top, bottom, 10);
        g.lineStyle(2, 0x000000, 0.6);
        g.strokeRect(4.5, 6.5, w - 9, h - 11);
        // głowa
        g.fillStyle(0xffe0bd, 1);
        g.fillCircle(w / 2, 8, 4);
        // akcent klasy
        g.fillStyle(0xffffff, 0.5);
        g.fillRect(w / 2 - 6, h - 18, 12, 3);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createEnemyIcon(key, w, h, color, horns = false) {
        const g = this.add.graphics();
        this.drawVerticalGradient(g, 2, 2, w - 4, h - 4, color, Phaser.Display.Color.ValueToColor(color).darken(25).color, 8);
        g.lineStyle(2, 0x000000, 0.5);
        g.strokeRect(2.5, 2.5, w - 5, h - 5);
        // oczy
        g.fillStyle(0xffffff, 1);
        g.fillCircle(w / 2 - 5, h / 2 - 4, 2);
        g.fillCircle(w / 2 + 5, h / 2 - 4, 2);
        g.fillStyle(0x000000, 1);
        g.fillCircle(w / 2 - 5, h / 2 - 4, 1);
        g.fillCircle(w / 2 + 5, h / 2 - 4, 1);
        // rogi dla smoka
        if (horns) {
            g.fillStyle(0xf39c12, 0.9);
            g.fillTriangle(4, 4, 8, 2, 10, 8);
            g.fillTriangle(w - 4, 4, w - 8, 2, w - 10, 8);
        }
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createIconSword(key, w, h) {
        const g = this.add.graphics();
        g.fillStyle(0xcccccc, 1);
        g.fillRect(w / 2 - 2, 6, 4, h - 14);
        g.fillStyle(0x999999, 1);
        g.fillTriangle(w / 2 - 6, 6, w / 2 + 6, 6, w / 2, 0);
        g.fillStyle(0x8b4513, 1);
        g.fillRect(w / 2 - 6, h - 10, 12, 4);
        g.fillStyle(0x5d3310, 1);
        g.fillRect(w / 2 - 2, h - 10, 4, 8);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createIconShield(key, w, h) {
        const g = this.add.graphics();
        g.fillStyle(0x2980b9, 1);
        g.fillEllipse(w / 2, h / 2, w - 8, h - 8);
        g.lineStyle(3, 0xffffff, 0.8);
        g.strokeEllipse(w / 2, h / 2, w - 8, h - 8);
        g.fillStyle(0xffffff, 0.2);
        g.fillEllipse(w / 2 - 4, h / 2 - 6, 8, 6);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createIconPotion(key, w, h, fillColor) {
        const g = this.add.graphics();
        // butelka
        g.lineStyle(2, 0xffffff, 0.9);
        g.strokeCircle(w / 2, h / 2 + 4, 10);
        g.fillStyle(fillColor, 0.9);
        g.fillCircle(w / 2, h / 2 + 4, 9);
        // korek
        g.fillStyle(0x8b4513, 1);
        g.fillRect(w / 2 - 4, h / 2 - 8, 8, 5);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createIconCoin(key, w, h) {
        const g = this.add.graphics();
        g.fillStyle(0xf1c40f, 1);
        g.fillCircle(w / 2, h / 2, 10);
        g.lineStyle(2, 0x7f6a00, 0.8);
        g.strokeCircle(w / 2, h / 2, 10);
        g.fillStyle(0x7f6a00, 0.8);
        g.fillRect(w / 2 - 3, h / 2 - 6, 6, 12);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createIconChest(key, w, h) {
        const g = this.add.graphics();
        this.drawVerticalGradient(g, 4, 6, w - 8, h - 12, 0x8b5a2b, 0x5a3a1b, 8);
        g.lineStyle(2, 0x3a220f, 0.8);
        g.strokeRect(4, 6, w - 8, h - 12);
        g.fillStyle(0xf1c40f, 1);
        g.fillRect(w / 2 - 3, h - 12, 6, 6);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    createIconRing(key, w, h) {
        const g = this.add.graphics();
        g.lineStyle(5, 0xf1c40f, 1);
        g.strokeCircle(w / 2, h / 2, 9);
        g.lineStyle(2, 0xffffff, 0.6);
        g.strokeCircle(w / 2, h / 2, 11);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    // ===== NPC icons =====
    createNPCIcon(key, w, h, color) {
        const g = this.add.graphics();
        // cień
        g.fillStyle(0x000000, 0.2);
        g.fillEllipse(w / 2 + 2, h - 4, w * 0.6, 6);
        // szata/tunika
        this.drawVerticalGradient(g, 4, 10, w - 8, h - 12, color, Phaser.Display.Color.ValueToColor(color).darken(20).color, 8);
        g.lineStyle(2, 0x000000, 0.5);
        g.strokeRect(4.5, 10.5, w - 9, h - 13);
        // głowa
        g.fillStyle(0xffe0bd, 1);
        g.fillCircle(w / 2, 8, 4);
        g.generateTexture(key, w, h);
        g.destroy();
    }
}
