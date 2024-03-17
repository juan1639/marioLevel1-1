import { Scene } from 'phaser';
import { Mario } from '../components/mario.js';
import { Textos } from '../components/textos.js';
import { BotonFullScreen } from '../components/botonesinteractivos.js';
import { Settings } from './settings.js';
import { play_sonidos } from '../utils/functions.js';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    init() 
    {
        this.mario = new Mario(this);

        this.botonfullscreen = new BotonFullScreen(this, {
            id: 'boton-fullscreen', x: Math.floor(this.sys.game.config.width / 1), y: -64 * 0.4,
            ang: 0, scX: 0.4, scY: 0.4, origin: [0, 0]
        });
        
        this.marcadorptos = new Textos(this);
        this.marcadorhi = new Textos(this);
        
        this.sonido_marioTuberias = this.sound.add('mario-tuberias');
        this.sonido_jumpbros = this.sound.add('jumpbros');
    }

    preload() {}

    create ()
    {
        play_sonidos(this.sonido_marioTuberias, false, 0.5);

        this.map1 = this.make.tilemap({ key: 'map1' });
        // this.tileset1 = this.map1.addTilesetImage('tiles1-1', 'tiles1');
        this.tileset1 = this.map1.addTilesetImage('tiles-ejemplo1', 'tiles1');
        // this.layer1 = this.map1.createLayer('1-1', this.tileset1, 0, 0);
        this.layer1 = this.map1.createLayer('pantalla-ejemplo1', this.tileset1, 0, 0);
        this.layer1.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);

        this.set_cameras();
        this.set_cameras_marcadores();
        
        this.mario.create();

        this.set_marcadores_txt();
        this.botonfullscreen.create();

        this.cameras.main.startFollow(this.mario.get());

        this.set_colliders();
    }

    update() 
    {
        this.mario.update();

        // this.controls.update(delta);
    }

    set_cameras()
    {
        this.cameras.main.setBounds(
            0, 0,
            this.layer1.x + this.layer1.width * Settings.getLayer1().scaleX,
            this.layer1.height * Settings.getLayer1().scaleY
        );

        this.physics.world.setBounds(
            this.sys.game.config.width / 4, 0,
            this.layer1.x + (this.layer1.width * Settings.getLayer1().scaleX),// - this.sys.game.config.width,
            this.layer1.height * Settings.getLayer1().scaleY
        );
    }

    set_cameras_marcadores()
    {
        const { x, y, ancho, alto, scrollX, scrollY } = Settings.getCameraScores();
        
        this.mapa_scores = this.cameras.add(x, y, ancho, alto).setZoom(0.9).setName('view-scores').setAlpha(1).setOrigin(0, 0);
        this.mapa_scores.scrollX = scrollX;
        this.mapa_scores.scrollY = scrollY;
        // this.mapa_scores.setBackgroundColor(0x00aabb);
        console.log(this.mapa_scores);
    }
    
    set_keyControlsCameras()
    {
        const cursores = this.input.keyboard.createCursorKeys();

        const controlConfig = {
            camera: this.cameras.main,
            left: cursores.left,
            right: cursores.right,
            speed: 0.2
        };

        this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);
    }

    set_colliders()
    {
        this.map1.setCollisionBetween(14, 16);
        this.map1.setCollisionBetween(21, 22);
        this.map1.setCollisionBetween(27, 28);
        this.map1.setCollision(40);
        // this.map1.setCollisionByExclusion([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        this.physics.add.collider(this.mario.get(), this.layer1);
    }

    set_marcadores_txt()
    {
        this.marcadorptos.create({
            x: 4, y: -40, origin: [0, 0],
            texto: '0', size: 28, style: 'bold',  fll: '#ffa',
            family: 'arial, sans-serif',
            strokeColor: '#ee9011', strokeSize: 9, ShadowColor: '#111111',
            bool1: false, bool2: true
        });

        this.marcadorhi.create({
            x: this.sys.game.config.width / 1.4, y: -40, origin: [0.5, 0],
            texto: 'Hi: 5000', size: 28, style: 'bold',  fll: '#ffa',
            family: 'arial, sans-serif',
            strokeColor: '#ee9011', strokeSize: 9, ShadowColor: '#111111',
            bool1: true, bool2: true
        });
    }
}
