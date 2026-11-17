import { Scene } from 'phaser';
import { Settings } from './settings.js';
import { play_sonidos } from '../utils/functions.js';
import { TecladoNombre } from '../components/teclado-nombre.js';

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

        const sonidoGameOver = this.sound.add('gameover');
        play_sonidos(sonidoGameOver, false, 0.7);
        this.events.once('shutdown', () => sonidoGameOver.destroy());

        const puntosTxt = String(puntos).padStart(6, '0');

        if (!nuevoRecord)
        {
            this.add.text(ancho / 2, alto / 2.6, 'Game Over', this.estilo_titulo()).setOrigin(0.5);

            this.add.text(ancho / 2, alto / 1.8, `Score: ${puntosTxt}`, this.estilo_texto(32)).setOrigin(0.5);

            this.mostrar_continuar(alto / 1.25, 1500);
            return;
        }

        // Nuevo record: antes de continuar se pide el nombre
        this.add.text(ancho / 2, 48, 'Game Over', this.estilo_titulo()).setOrigin(0.5);

        this.add.text(ancho / 2, 108, `¡Nuevo récord!  ${puntosTxt}`, this.estilo_texto(30)).setOrigin(0.5);

        const txtPide = this.add.text(ancho / 2, 150, 'Escribe tu nombre:', this.estilo_texto(20)).setOrigin(0.5);

        // Se espera un poco antes de mostrar el teclado, para que una pulsacion
        // que venia de la partida no escriba una letra sin querer
        this.time.delayedCall(800, () =>
        {
            const teclado = new TecladoNombre(this, {
                x: ancho / 2,
                y: 266,
                alAceptar: (nombre) =>
                {
                    Settings.guardarNombreRecord(nombre);
                    txtPide.setText(`Récord guardado:  ${nombre}`);
                    this.mostrar_continuar(alto / 1.6, 600);
                }
            });

            teclado.create();
        });
    }

    // Texto parpadeante 'Toca la pantalla...' y espera la pulsacion para volver al menu.
    // (Se espera un poco antes de aceptar input, para no saltarse la pantalla sin querer)
    mostrar_continuar(y, espera)
    {
        const txtContinuar = this.add.text(this.sys.game.config.width / 2, y, 'Toca la pantalla o pulsa ESPACIO', {
            fontFamily: 'arial, sans-serif', fontSize: 24, color: '#eea',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.time.delayedCall(espera, () =>
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

    estilo_titulo()
    {
        return {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 64, color: '#ff7',
            stroke: '#e91', strokeThickness: 8,
            align: 'center'
        };
    }

    estilo_texto(size)
    {
        return {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: size, color: '#ffb',
            stroke: '#e61', strokeThickness: 6,
            align: 'center'
        };
    }
}
