import { Scene } from 'phaser';
import { Mario } from '../components/mario.js';
import { Goombas } from '../components/goomba.js';
import { ColisionadoresInvisibles } from '../components/colliders-invisibles.js';
// import { Textos } from '../components/textos.js';
import { Marcadores } from '../components/marcadores.js';
import { BotonFullScreen } from '../components/botonesinteractivos.js';
import { Settings } from './settings.js';
import { EmisorParticulas } from '../components/emisor-particulas.js';

import
{
    hitBrick,
    hitVsGoombas,
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
        this.mario = new Mario(this, {iniPosX: 7, iniPosY: 9});

        this.goombas = new Goombas(this);
        this.colisionadoresInvisibles = new ColisionadoresInvisibles(this);

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

        this.marcadores = new Marcadores(this);

        this.sonido_jumpbros = this.sound.add('jumpbros');
        this.bricks_fall = this.sound.add('bricks-fall');
        this.push_block = this.sound.add('push-block');
        this.goomba_aplastado = this.sound.add('goomba-aplastado');
        this.sonido_marioTuberias = this.sound.add('mario-tuberias');
        this.musica_principal = this.sound.add('musica-principal');
    }

    preload() {}

    create ()
    {
        play_sonidos(this.musica_principal, true, 0.5);
        
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
        this.ajustes_tiles();

        // Camaras:
        this.set_cameras();
        this.set_cameras_marcadores();

        // Sprites: llamar a su metodo create() para inicializarlos:
        this.mario.create();
        this.goombas.create();

        this.colisionadoresInvisibles.create(Settings.COLLIDERS_INVISIBLES);

        // Scores:
        this.marcadores.create();
        this.botonfullscreen.create();

        // Click-event:
        this.input.on('pointerup', function (pointer)
        {
            if (Settings.controls.MOBILE)
            {
                return;
            }

            console.log(pointer);

            var x = pointer.x;
            var y = pointer.y;

            if (x < this.sys.game.config.width / 3 && y > this.sys.game.config.height / 1.5)
            {
                Settings.controls.MOBILE = true;
                this.mario.get_mobile_controls().get().setAlpha(0);
                this.mario.get_joystick().y = this.sys.game.config.height - 96;
            }

            // Aquí puedes agregar la lógica que quieras ejecutar al hacer clic
            console.log('Clic en:', x, y);
            // Por ejemplo, mover un sprite a la posición del clic:
            // this.player.x = x;
            // this.player.y = y;

        }, this);

        // Camara-principal... sigue a personaje:
        this.cameras.main.startFollow(this.mario.get());

        // Colisionadores:
        this.set_colliders();
    }

    update() 
    {
        this.mario.update();
        this.goombas.update();
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
            this.layer1.x + (this.layer1.width * Settings.getLayer1().scaleX) - 470,// - this.sys.game.config.width,
            this.layer1.height * Settings.getLayer1().scaleY + 200
        );
        console.log(this.physics.world);
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

        this.physics.add.overlap(this.mario.get(), this.goombas.get(), (mario, goomba) =>
        {
            hitVsGoombas(mario, goomba, this);
        });

        this.physics.add.collider(this.goombas.get(), this.layer1);
        this.physics.add.collider(this.goombas.get(), this.colisionadoresInvisibles.get());
        // this.physics.add.collider(this.goombas.get(), ?);
    }

    ajustes_tiles()
    {
        // Reemplazar MONEDAS por cielo-azul:
        this.layer1.replaceByIndex(11, 1);
        // Reemplazar SETAS por cielo-azul:
        this.layer1.replaceByIndex(12, 1);
        this.layer1.replaceByIndex(18, 1);

        // -----------------------------------------
        // tile.getLeft(), tile.getBottom()
        //  
        //  - SETA:
        //  [672, 320], [2496, 320], [3488 , 192]
        // -----------------------------------------
        // - SETA 1up:
        // [2048, 288]
        // ----------------------------------------- 
        //  - ESTRELLA:
        // [3232, 320]
    }
}
