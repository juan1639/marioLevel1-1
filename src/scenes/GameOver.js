import { Scene } from 'phaser';
import { Settings } from './settings.js';
import { play_sonidos } from '../utils/functions.js';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        const ancho = this.sys.game.config.width;
        const alto = this.sys.game.config.height;

        // Nuevo record (se guarda en el navegador):
        const { puntos } = Settings.marcadores;
        // (puede haberse batido antes, al terminar un nivel: por eso se mira recordEnPartida)
        Settings.actualizarRecord();
        const nuevoRecord = Settings.recordEnPartida;

        this.cameras.main.setBackgroundColor(0x000000);

        this.add.text(ancho / 2, alto / 2.6, 'GAME OVER', {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 64, color: '#ff7',
            stroke: '#e91', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(ancho / 2, alto / 1.8, `Score: ${puntos}` + (nuevoRecord ? '\n¡Nuevo récord!' : ''), {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 32, color: '#ffb',
            stroke: '#e61', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        const txtContinuar = this.add.text(ancho / 2, alto / 1.25, 'Toca la pantalla o pulsa ESPACIO', {
            fontFamily: 'arial, sans-serif', fontSize: 24, color: '#eea',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        const sonidoGameOver = this.sound.add('gameover');
        play_sonidos(sonidoGameOver, false, 0.7);
        this.events.once('shutdown', () => sonidoGameOver.destroy());

        // Se espera un poco antes de aceptar input, para no saltarse la pantalla
        // con una pulsacion que venia de la partida:
        this.time.delayedCall(1500, () =>
        {
            txtContinuar.setAlpha(1);

            this.tweens.add({
                targets: txtContinuar,
                alpha: 0.3,
                duration: 600,
                yoyo: true,
                repeat: -1
            });

            const volverAJugar = () => this.scene.start('MainMenu');

            this.input.once('pointerdown', volverAJugar);
            this.input.keyboard.once('keydown-SPACE', volverAJugar);
        });
    }
}
