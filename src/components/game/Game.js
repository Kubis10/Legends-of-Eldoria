import React, { Component } from 'react';
import Phaser from 'phaser';
import BootScene from '../../game/scenes/BootScene';
import MainMenuScene from '../../game/scenes/MainMenuScene';
import CharacterCreationScene from '../../game/scenes/CharacterCreationScene';
import GameScene from '../../game/scenes/GameScene';
import PauseMenuScene from '../../game/scenes/PauseMenuScene';
import InventoryScene from '../../game/scenes/InventoryScene';
import QuestScene from '../../game/scenes/QuestScene';
import MapScene from '../../game/scenes/MapScene';
import ShopScene from '../../game/scenes/ShopScene';
import LevelUpScene from '../../game/scenes/LevelUpScene';

class Game extends Component {
    componentDidMount() {
        this.initializeGame();
    }

    componentWillUnmount() {
        if (this.game) {
            this.game.destroy(true);
        }
    }

    initializeGame() {
        const config = {
            type: Phaser.AUTO,
            parent: 'game-container',
            width: 1280,
            height: 720,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [
                BootScene,
                MainMenuScene,
                CharacterCreationScene,
                GameScene,
                PauseMenuScene,
                InventoryScene,
                QuestScene,
                MapScene,
                ShopScene,
                LevelUpScene
            ],
            backgroundColor: '#000000'
        };

        this.game = new Phaser.Game(config);
    }

    render() {
        return (
            <div id="game-container" style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#000000'
            }}>
                {/* Kontener, w którym będzie renderowana gra */}
            </div>
        );
    }
}

export default Game;
