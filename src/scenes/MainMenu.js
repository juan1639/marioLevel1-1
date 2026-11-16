import { Scene } from 'phaser';
import { Settings } from './settings.js';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // Cada vez que se pasa por el menu empieza una partida nueva (puntos a 0, vidas iniciales):
        Settings.nuevaPartida();
        Settings.cargarRecord();

        this.add.image(512, 384, 'background');

        this.add.image(512, 300, 'logo');

        this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        /* this.input.once('pointerdown', () => {

            this.scene.start('Game');

        }); */

        this.scene.start('Game');
    }
}
