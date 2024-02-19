import React, { Component } from 'react';
import Phaser from 'phaser';

class Game extends Component {
    componentDidMount() {
        this.initializeGame();
        this.resizeGame();
        window.addEventListener('resize', this.resizeGame);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeGame);
        if (this.game) {
            this.game.destroy(true);
        }
    }

    initializeGame() {
        const config = {
            type: Phaser.AUTO,
            parent: 'game-container',
            width: '100%',
            height: '100%',
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            scene: {
                preload: this.preload,
                create: this.create,
                update: this.update
            }
        };

        this.game = new Phaser.Game(config);
    }

    preload() {
        // Metoda wczytywania zasobów gry (np. grafiki, dźwięki)
        // Tutaj należy wczytać wszystkie potrzebne zasoby
    }

    create() {
        // Metoda tworzenia gry, wywoływana po wczytaniu zasobów
        // Tutaj należy zainicjalizować wszystkie obiekty gry
    }

    update() {
        // Metoda aktualizacji gry, wywoływana w każdej klatce animacji
        // Tutaj należy umieścić logikę gry, np. ruch postaci, kolizje, itp.
    }

    resizeGame = () => {
        const { innerWidth, innerHeight } = window;
        this.game.scale.resize(innerWidth, innerHeight);
    }

    render() {
        return (
            <div id="game-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
                {/* Kontener, w którym będzie renderowana gra */}
            </div>
        );
    }
}

export default Game;
