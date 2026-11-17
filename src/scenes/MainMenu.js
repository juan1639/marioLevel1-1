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

        // La escena se reutiliza al volver al menu: hay que reiniciar este estado
        this.empezando = false;

        const ancho = this.sys.game.config.width;
        const alto = this.sys.game.config.height;

        this.crear_fondo();

        // Titulo
        this.add.text(ancho / 2, 72, 'Mario Clon', {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 64, color: '#ff7',
            stroke: '#e91', strokeThickness: 10,
            shadow: { offsetX: 4, offsetY: 4, color: '#111', blur: 4, fill: true }
        }).setOrigin(0.5);

        // Boton 'Nueva Partida' (ligero 'latido' para que se vea que se puede pulsar)
        const ESCALA_BOTON = 0.55;
        const boton = this.add.image(ancho / 2, 205, 'boton-start').setScale(ESCALA_BOTON).setInteractive({ useHandCursor: true });

        const latido = this.tweens.add({
            targets: boton,
            scale: ESCALA_BOTON * 1.06,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        boton.on('pointerover', () => { latido.pause(); boton.setScale(ESCALA_BOTON * 1.1); });
        boton.on('pointerout', () => { boton.setScale(ESCALA_BOTON); latido.resume(); });

        // Si se pulsa con el dedo, el juego empieza ya con los controles tactiles
        boton.on('pointerdown', (pointer) => this.empezar(pointer.wasTouch));

        this.input.keyboard.once('keydown-SPACE', () => this.empezar(false));
        this.input.keyboard.once('keydown-ENTER', () => this.empezar(false));

        // Record
        const record = String(Settings.marcadores.hi).padStart(6, '0');

        const nombre = Settings.marcadores.hiNombre;

        this.add.text(ancho / 2, 296, `Récord: ${record}` + (nombre ? `  ${nombre}` : ''), {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 26, color: '#ffb',
            stroke: '#e61', strokeThickness: 6
        }).setOrigin(0.5);

        // Controles
        this.add.text(ancho / 2, alto - 132,
            '← →  moverse     ESPACIO  saltar     SHIFT / Z  correr\n' +
            'En el móvil: joystick para moverse (al fondo = correr) y botón A para saltar',
            {
                fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 15, color: '#fff',
                stroke: '#111', strokeThickness: 4, align: 'center', lineSpacing: 6
            }
        ).setOrigin(0.5);
    }

    // Fondo: la primera pantalla del nivel, sin objetos, con Mario en su posicion de salida
    crear_fondo()
    {
        const escala = Settings.getLayer1().scaleX;
        const TILE = Settings.screen.TILE_X * escala;

        const mapa = this.make.tilemap({ key: 'map1' });
        const tileset = mapa.addTilesetImage('SuperMarioBros-World1-1', 'tiles1');
        const capa = mapa.createLayer('World1', tileset, 0, 0).setScale(escala);

        // Monedas, setas y estrella del mapa -> cielo (como en el juego)
        [11, 12, 18, 19].forEach(indice => capa.replaceByIndex(indice, 1));

        // Mario de pie sobre el suelo
        this.add.image(Settings.MARIO.X_INICIAL * TILE, Settings.FIN_NIVEL.SUELO_Y * TILE, 'mario-ss1', 0)
            .setOrigin(0.5, 1)
            .setScale(escala);
    }

    empezar(tactil)
    {
        if (this.empezando)
        {
            return;
        }

        this.empezando = true;

        if (tactil)
        {
            Settings.controls.MOBILE = true;
        }

        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    }
}
