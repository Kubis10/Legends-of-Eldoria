import Phaser from 'phaser';
import GameState from '../GameState';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this._domUnlockHandler = null;
        this._gestureUnlockHandler = null;
    }

    // Bezpieczne odtwarzanie dźwięków
    playSound(key, config = {}) {
        try {
            // Jeśli audio jeszcze nieodblokowane – pomiń (unikamy ostrzeżeń autoplay)
            if (!this.audioUnlocked) return;
            if (this.sound.get(key)) {
                this.sound.play(key, config);
            } else {
                console.warn(`Sound '${key}' not found in cache`);
            }
        } catch (error) {
            console.error(`Error playing sound '${key}':`, error);
        }
    }

    // Jednorazowa próba odblokowania audio (wywoływana z gestu użytkownika)
    _attemptUnlockAudio() {
        if (this.audioUnlocked || this._unlockInProgress) return;
        const now = performance.now();
        if (this._lastUnlockTry && (now - this._lastUnlockTry) < 300) return; // throttle 300ms
        this._lastUnlockTry = now;
        if (!this.sound || !this.sound.context) return;

        const ctx = this.sound.context;
        if (ctx.state === 'running') {
            this.audioUnlocked = true;
            this._removeUnlockHint();
            return;
        }

        this._unlockInProgress = true;
        ctx.resume()
            .then(() => {
                if (ctx.state === 'running') {
                    this.audioUnlocked = true;
                    this._removeUnlockHint();
                } else {
                    this._fallbackSilentUnlock();
                }
            })
            .catch(() => {
                this._fallbackSilentUnlock();
            })
            .finally(() => { this._unlockInProgress = false; });
    }

    // Ciche odtworzenie krótkiego bufora, aby wymusić start (czasem potrzebne w mobile)
    _fallbackSilentUnlock() {
        if (this.audioUnlocked || !this.sound?.context) return;
        const ctx = this.sound.context;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0.0001; // niesłyszalne
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
            // Po krótkiej chwili sprawdź stan
            setTimeout(() => {
                if (ctx.state === 'running') {
                    this.audioUnlocked = true;
                    this._removeUnlockHint();
                } else {
                    // jeśli nadal nie – pokaż podpowiedź (pozostaw)
                }
            }, 120);
        } catch (_) { /* ignoruj */ }
    }

    create() {
        // Stan audio
        this.audioUnlocked = this.sound?.context?.state === 'running';
        this._unlockInProgress = false;

        // Dodatkowy fallback: jednorazowy DOM click/touchend
        if (!this._domAudioUnlockBound) {
            this._domUnlockHandler = (e) => {
                if (e && e.isTrusted === false) return;
                this._attemptUnlockAudio();
                if (this.audioUnlocked) {
                    document.body.removeEventListener('click', this._domUnlockHandler);
                    document.body.removeEventListener('touchend', this._domUnlockHandler);
                    this._domAudioUnlockBound = false;
                    this._domUnlockHandler = null;
                }
            };
            document.body.addEventListener('click', this._domUnlockHandler, { once: false });
            document.body.addEventListener('touchend', this._domUnlockHandler, { once: false });
            this._domAudioUnlockBound = true;
        }

        // Jednorazowe (ale elastyczne) nasłuchiwanie gestów
        if (!this._audioUnlockBound) {
            this._gestureUnlockHandler = (pointerOrEvent) => {
                // ignoruj niepewne / syntetyczne zdarzenia
                if (pointerOrEvent && pointerOrEvent.isTrusted === false) return;
                this._attemptUnlockAudio();
            };
            // pointerup często lepiej mapuje się na realny gest (zwłaszcza mobile)
            this.input.on('pointerup', this._gestureUnlockHandler);
            this.input.keyboard?.on('keydown', this._gestureUnlockHandler);
            this._audioUnlockBound = true;
        }

        this.events.once('shutdown', this._cleanupAudioUnlockListeners, this);
        this.events.once('destroy', this._cleanupAudioUnlockListeners, this);

        // Hint do kliknięcia (jeśli jeszcze nie odblokowano w ciągu ~150ms)
        this.time.delayedCall(150, () => {
            if (!this.audioUnlocked) this._showUnlockHint();
        });

        const { width, height } = this.cameras.main;

        // Tło
        this.add.rectangle(0, 0, width, height, 0x0f1722).setOrigin(0);
        // centralny panel ozdobny
        const panel = this.add.image(width / 2, height / 2, 'ui_panel_medium');
        panel.setAlpha(0.95);

        // Tytuł gry
        const title = this.add.text(width / 2, height / 4, 'LEGENDS OF ELDORIA', {
            fontFamily: 'Arial',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#f39c12',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Animacja tytułu
        this.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.05 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        // Przyciski menu
        const buttonY = height / 2 - 40;
        const buttonSpacing = 70;

        const hasSave = GameState.hasSave();

        if (hasSave) {
            this.createButton(width / 2, buttonY, 'Kontynuuj grę', () => {
                GameState.loadGame();
                this.scene.start('GameScene');
            });
        }

        this.createButton(width / 2, buttonY + buttonSpacing * (hasSave ? 1 : 0), 'Nowa gra', () => {
            this.scene.start('CharacterCreationScene');
        });

        this.createButton(width / 2, buttonY + buttonSpacing * (hasSave ? 2 : 1), 'Instrukcje', () => {
            this.showInstructions();
        });

        if (hasSave) {
            this.createButton(width / 2, buttonY + buttonSpacing * 3, 'Usuń zapis', () => {
                GameState.deleteSave();
                this.scene.restart();
            }, 0xe74c3c);
        }

        // Stopka
        this.add.text(width / 2, height - 30, 'Stworzone przez Jakub Przybysz', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#d4af37'
        }).setOrigin(0.5);
    }

    createButton(x, y, text, onClick, color = 0x3498db) {
        const button = this.add.container(x, y);

        const bg = this.add.image(0, 0, 'ui_button_large')
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setTint(0xf7c66a);
            this.tweens.add({
                targets: button,
                scale: 1.1,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.clearTint();
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', () => {
            // Jednorazowa próba odblokowania audio (w ramach gestu)
            this._attemptUnlockAudio();

            // Odtwórz dźwięk kliknięcia (tylko jeśli już odblokowano)
            this.playSound('button_click');

            this.tweens.add({
                targets: button,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: onClick
            });
        });
        return button;
    }

    showInstructions() {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
            .setOrigin(0)
            .setInteractive();

        const panelHeight = 600;
        const panel = this.add.rectangle(width / 2, height / 2, 800, panelHeight, 0x4a2c2a)
            .setStrokeStyle(4, 0xd4af37);

        // Tytuł
        const title = this.add.text(width / 2, height / 2 - panelHeight / 2 + 50, 'INSTRUKCJE GRY', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5);

        const instructions = `PORUSZANIE:
Użyj klawiszy WASD lub strzałek do poruszania się

WALKA:
Spacja - Atak podstawowy
1-4 - Użycie umiejętności
E - Interakcja z przedmiotami i NPC

UI:
I - Ekwipunek
Q - Lista questów
M - Mapa
ESC - Menu pauzy

CEL GRY:
Odkryj tajemnice Eldorii, pokonaj bossów
i ukończ główną fabułę oraz zadania poboczne!`;

        const text = this.add.text(width / 2, height / 2 + 10, instructions, {
            fontFamily: 'Arial',
            fontSize: '17px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

        // Przycisk zamknij na dole panelu
        const closeButton = this.add.image(width / 2, height / 2 + panelHeight / 2 - 40, 'ui_button_small')
            .setInteractive({ useHandCursor: true });

        const closeText = this.add.text(width / 2, height / 2 + panelHeight / 2 - 40, 'Zamknij', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        closeButton.on('pointerover', () => {
            closeButton.setTint(0xf7c66a);
        });

        closeButton.on('pointerout', () => {
            closeButton.clearTint();
        });

        closeButton.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            text.destroy();
            closeButton.destroy();
            closeText.destroy();
        });
    }

    _showUnlockHint() {
        if (this._unlockHint || this.audioUnlocked) return;
        const { width, height } = this.cameras.main;
        this._unlockHint = this.add.text(width / 2, height - 80, 'Kliknij dowolnie, aby włączyć dźwięk', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#f1c40f'
        }).setOrigin(0.5).setAlpha(0.85);
        this.tweens.add({
            targets: this._unlockHint,
            alpha: { from: 0.4, to: 0.9 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    _removeUnlockHint() {
        if (!this._unlockHint) return;
        this._unlockHint.destroy();
        this._unlockHint = null;
        this._cleanupAudioUnlockListeners();
    }

    _cleanupAudioUnlockListeners() {
        if (this._audioUnlockBound && this._gestureUnlockHandler) {
            this.input.off('pointerup', this._gestureUnlockHandler);
            this.input.keyboard?.off('keydown', this._gestureUnlockHandler);
            this._audioUnlockBound = false;
            this._gestureUnlockHandler = null;
        }

        if (this._domAudioUnlockBound && this._domUnlockHandler) {
            document.body.removeEventListener('click', this._domUnlockHandler);
            document.body.removeEventListener('touchend', this._domUnlockHandler);
            this._domAudioUnlockBound = false;
            this._domUnlockHandler = null;
        }
    }
}
