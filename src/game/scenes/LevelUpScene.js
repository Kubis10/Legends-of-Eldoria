import Phaser from 'phaser';
import GameState from '../GameState';

export default class LevelUpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelUpScene' });
    }

    init(data) {
        this.newLevel = data.level || GameState.player.level;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Półprzezroczyste tło
        this.add.rectangle(0, 0, width, height, 0x000000, 0.9)
            .setOrigin(0)
            .setScrollFactor(0);

        // Panel
        this.add.rectangle(width / 2, height / 2, 600, 500, 0x2c3e50)
            .setStrokeStyle(4, 0xf39c12);

        // Tytuł z animacją
        const title = this.add.text(width / 2, height / 2 - 200, '⭐ AWANS POZIOMU! ⭐', {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#f39c12',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Animacja tytułu
        this.tweens.add({
            targets: title,
            scale: { from: 0.5, to: 1.2 },
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Bounce.easeOut'
        });

        // Nowy poziom
        const levelText = this.add.text(width / 2, height / 2 - 130, `Poziom ${this.newLevel}`, {
            fontFamily: 'Arial',
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: levelText,
            scale: { from: 0, to: 1 },
            duration: 800,
            delay: 300,
            ease: 'Back.easeOut'
        });

        // Ulepszenia statystyk
        const improvements = [
            '💪 Siła +1',
            '🎯 Zręczność +1',
            '🧠 Inteligencja +1',
            '❤️ Maks. Zdrowie +' + (10 + GameState.player.attributes.strength),
            '💙 Maks. Mana +' + (5 + GameState.player.attributes.intelligence)
        ];

        improvements.forEach((improvement, index) => {
            const text = this.add.text(width / 2, height / 2 - 30 + index * 40, improvement, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#2ecc71',
                fontStyle: 'bold'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: text,
                alpha: 1,
                x: width / 2,
                duration: 400,
                delay: 800 + index * 150,
                ease: 'Power2'
            });
        });

        // Przycisk kontynuacji
        this.time.delayedCall(3000, () => {
            const button = this.createButton(width / 2, height / 2 + 180, 'KONTYNUUJ', () => {
                this.close();
            }, 0x27ae60);

            this.tweens.add({
                targets: button,
                scale: { from: 0, to: 1 },
                duration: 300,
                ease: 'Back.easeOut'
            });
        });

        // Efekty cząsteczkowe
        this.createParticles(width / 2, height / 2);

        // Dźwięk (placeholder - w przyszłości można dodać prawdziwy dźwięk)
        console.log('🎵 LEVEL UP SOUND!');
    }

    createParticles(x, y) {
        // Symulacja cząsteczek używając grafiki
        for (let i = 0; i < 30; i++) {
            const particle = this.add.circle(x, y, 5, 0xf39c12);

            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 200;
            const targetX = x + Math.cos(angle) * speed;
            const targetY = y + Math.sin(angle) * speed;

            this.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                duration: 1000 + Math.random() * 1000,
                delay: Math.random() * 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    createButton(x, y, text, onClick, color = 0x27ae60) {
        const button = this.add.container(x, y).setScale(0);

        const bg = this.add.rectangle(0, 0, 250, 60, color)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(4, 0xffffff);

        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setFillStyle(color + 0x222222);
            this.tweens.add({
                targets: button,
                scale: 1.1,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(color);
            this.tweens.add({
                targets: button,
                scale: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', onClick);

        return button;
    }

    close() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}
