import React, { Component } from 'react';
import Phaser from 'phaser';

class Game extends Component {
    componentDidMount() {
        this.game = new Phaser.Game({
            // Konfiguracja gry
            // np. szerokość, wysokość, tryb renderowania, itp.
            // Więcej informacji znajdziesz w dokumentacji Phaser.js
        });
    }

    componentWillUnmount() {
        this.game.destroy(true);
    }

    render() {
        return (
            <div id="game-container">
                {/* Jeśli chcesz, możesz dodać tutaj elementy UI */}
            </div>
        );
    }
}

export default Game;