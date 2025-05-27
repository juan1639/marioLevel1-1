import { Scene } from 'phaser';
import { Mario } from '../components/mario.js';
import { Textos } from '../components/textos.js';
import { BotonFullScreen } from '../components/botonesinteractivos.js';
import { Settings } from './settings.js';
import { EmisorParticulas } from '../components/emisor-particulas.js';
import
{
    hitBrick,
    config_marcadores_txt,
    play_sonidos
} from '../utils/functions.js';

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
            id: 'boton-fullscreen',
            x: Math.floor(this.sys.game.config.width / 1.2),
            y: -64 * 0.5,
            ang: 0,
            scX: 0.5, scY: 0.5,
            origin: [0, 0]
        });

        this.emisor = new EmisorParticulas(this, {
            vel: [100, 200],
            ang: [0, 360],
            grav: 300,
            lifeSp: 900,
            cantidad: 35,
            esc: [Phaser.Math.FloatBetween(0.8, 1.8), 0],
            autoRun: false
        });

        this.marcadorptos = new Textos(this);
        this.marcadorhi = new Textos(this);
        
        this.sonido_marioTuberias = this.sound.add('mario-tuberias');
        this.sonido_jumpbros = this.sound.add('jumpbros');
    }

    preload() {}

    create ()
    {
        //play_sonidos(this.sonido_marioTuberias, false, 0.5);

        // CREACION del TILEmap:
        this.map1 = this.make.tilemap({ key: 'map1' });
        this.tileset1 = this.map1.addTilesetImage('SuperMarioBros-World1-1', 'tiles1');

        this.layer1 = this.map1.createLayer(
            'World1',
            this.tileset1,
            (Settings.getLayer1().left * Settings.screen.TILE_X) * Settings.getLayer1().scaleX,
            (Settings.getLayer1().top * Settings.screen.TILE_Y) * Settings.getLayer1().scaleY
        );

        this.layer1.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);

        // Camaras:
        this.set_cameras();
        this.set_cameras_marcadores();

        // Sprites: llamar a su metodo create() para inicializarlos:
        this.mario.create();

        this.set_marcadores_txt();
        this.botonfullscreen.create();

        // Camara-principal... sigue a personaje:
        this.cameras.main.startFollow(this.mario.get());

        // Colisionadores:
        this.set_colliders();
    }

    update() 
    {
        this.mario.update();
        // this.layer1.setY(this.layer1.y + 0);

        // this.controls.update(delta);
    }

    set_cameras()
    {
        this.cameras.main.setBounds(
            0,
            0,
            this.layer1.x + this.layer1.width * Settings.getLayer1().scaleX,
            this.layer1.height * Settings.getLayer1().scaleY
        );

        this.physics.world.setBounds(
            this.sys.game.config.width / 16,
            -100,
            this.layer1.x + (this.layer1.width * Settings.getLayer1().scaleX) - 300,// - this.sys.game.config.width,
            this.layer1.height * Settings.getLayer1().scaleY + 100
        );
    }

    set_cameras_marcadores()
    {
        const { x, y, ancho, alto, scrollX, scrollY } = Settings.getCameraScores();
        
        this.mapa_scores = this.cameras.add(x, y, this.sys.game.config.width, alto).setZoom(1).setName('view-scores').setAlpha(1).setOrigin(0, 0);
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
        this.layer1.setCollisionBetween(14, 16);//    bloques (interr, ladrillo, piramide)
        this.layer1.setCollisionBetween(21, 22);//    Tuberia
        this.layer1.setCollisionBetween(27, 28);//    Tuberia
        this.layer1.setCollision([40]);//             bloque (suelo)

        // this.map1.setCollision([13, 14, 16, 40]);
        // this.map1.setCollisionByExclusion([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        this.physics.add.collider(this.mario.get(), this.layer1, (player, tile) =>
        {
            hitBrick(player, tile, this);
        });
    }

    set_marcadores_txt()
    {
        config_marcadores_txt(this);
    }
}
