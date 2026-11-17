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
        // Cada vez que se pasa por el menu empieza una partida nueva (puntos a 0, vidas iniciales).
        // De momento no hay menu: se pasa directamente al juego.
        Settings.nuevaPartida();
        Settings.cargarRecord();

        this.scene.start('Game');
    }
}
