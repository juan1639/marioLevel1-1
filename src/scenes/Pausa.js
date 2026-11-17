import { Scene } from 'phaser';

// Escena que se muestra ENCIMA de 'Game' mientras esta pausada.
// (Una escena pausada no recibe teclas ni toques: por eso la pausa se quita desde aqui)
export class Pausa extends Scene
{
    constructor ()
    {
        super('Pausa');
    }

    create ()
    {
        const ancho = this.sys.game.config.width;
        const alto = this.sys.game.config.height;

        // Oscurece el juego que queda detras
        this.add.rectangle(0, 0, ancho, alto, 0x000000, 0.5).setOrigin(0, 0);

        this.add.text(ancho / 2, alto / 2 - 30, 'PAUSA', {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 64, color: '#ff7',
            stroke: '#e91', strokeThickness: 10
        }).setOrigin(0.5);

        this.add.text(ancho / 2, alto / 2 + 40, 'Pulsa P / ESC o toca la pantalla para continuar', {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 20, color: '#fff',
            stroke: '#111', strokeThickness: 4
        }).setOrigin(0.5);

        // Se usa 'pointerdown' (un toque NUEVO): el toque que ha pausado el juego ya ha empezado
        this.input.once('pointerdown', () => this.continuar());
        this.input.keyboard.once('keydown-P', () => this.continuar());
        this.input.keyboard.once('keydown-ESC', () => this.continuar());
    }

    continuar()
    {
        this.scene.resume('Game');
        this.scene.stop();
    }
}
