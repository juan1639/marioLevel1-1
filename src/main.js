// 'phaser' debe importarse ANTES que el plugin: el plugin usa la variable global Phaser al cargarse
import 'phaser';
import VirtualJoyStickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 768, //256 768
    height: 480, //240 576
    parent: 'game-container',
    backgroundColor: '#121212',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
          gravity: {y: 1100},
          debug: false
        }
    },
    input: {
        activePointers: 3 // varios dedos a la vez: joystick + boton de salto
    },
    plugins: {
        global: [
            // Joystick virtual (controles tactiles). Se obtiene con plugins.get('rexvirtualjoystickplugin')
            { key: 'rexvirtualjoystickplugin', plugin: VirtualJoyStickPlugin, start: true }
        ]
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver
    ]
};

export default new Phaser.Game(config);
