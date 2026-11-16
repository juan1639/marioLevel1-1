import { Scene } from 'phaser';
import { Mario } from '../components/mario.js';
import { Goombas } from '../components/goomba.js';
import { ColisionadoresInvisibles } from '../components/colliders-invisibles.js';
// import { Textos } from '../components/textos.js';
import { Marcadores } from '../components/marcadores.js';
import { BotonFullScreen } from '../components/botonesinteractivos.js';
import { Settings } from './settings.js';
import { EmisorParticulas } from '../components/emisor-particulas.js';
import { Setas } from '../components/setas.js';
import { FinNivel } from '../components/fin-nivel.js';
import { Monedas } from '../components/monedas.js';

import
{
    hitBrick,
    hitVsGoombas,
    cogerSeta,
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
        this.mario = new Mario(this, {iniPosX: Settings.MARIO.X_INICIAL, iniPosY: Settings.MARIO.Y_INICIAL});

        this.goombas = new Goombas(this);
        this.setas = new Setas(this);
        this.finNivel = new FinNivel(this);
        this.monedas = new Monedas(this);
        this.colisionadoresInvisibles = new ColisionadoresInvisibles(this);

        this.botonfullscreen = new BotonFullScreen(this, {
            id: 'boton-fullscreen',
            x: this.sys.game.config.width - 32, // esquina derecha (el marcador ocupa el resto)
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
            esc: [0.8, 1.8] // rango de escala inicial de cada particula
        });

        this.marcadores = new Marcadores(this);

        this.sonido_jumpbros = this.sound.add('jumpbros');
        this.bricks_fall = this.sound.add('bricks-fall');
        this.push_block = this.sound.add('push-block');
        this.goomba_aplastado = this.sound.add('goomba-aplastado');
        this.sonido_marioTuberias = this.sound.add('mario-tuberias');
        this.musica_principal = this.sound.add('musica-principal');
        this.sonido_muerte = this.sound.add('lose-life');
        this.sonido_powerup = this.sound.add('seta');
        this.sonido_moneda = this.sound.add('p-ping');
        this.sonido_level_up = this.sound.add('level-up');
        this.sonido_estrella = this.sound.add('estrella');
        this.sonido_encoger = this.sound.add('ough');
        this.sonido_fuegos = this.sound.add('fireworks');

        // Los sonidos son globales (no de la escena): hay que destruirlos al salir/reiniciar
        // la escena, o se acumularian (y la musica sonaria duplicada) en cada vida perdida.
        const sonidos = [
            this.sonido_jumpbros, this.bricks_fall, this.push_block, this.goomba_aplastado,
            this.sonido_marioTuberias, this.musica_principal, this.sonido_muerte, this.sonido_powerup,
            this.sonido_moneda, this.sonido_level_up, this.sonido_fuegos, this.sonido_estrella,
            this.sonido_encoger
        ];
        this.events.once('shutdown', () => sonidos.forEach(sonido => sonido.destroy()));
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
        this.setas.create();
        this.finNivel.create();
        this.monedas.create();

        this.colisionadoresInvisibles.create(Settings.COLLIDERS_INVISIBLES);
        this.emisor.create();

        // Scores:
        Settings.marcadores.tiempo = Settings.TIEMPO.INICIAL;
        this.marcadores.create();

        // Cuenta atras del tiempo:
        this.time.addEvent({
            delay: Settings.TIEMPO.MS_POR_UNIDAD,
            loop: true,
            callback: this.tick_tiempo,
            callbackScope: this
        });
        this.botonfullscreen.create();

        // Click-event:
        this.input.on('pointerup', function (pointer)
        {
            if (Settings.controls.MOBILE)
            {
                return;
            }

            const x = pointer.x;
            const y = pointer.y;

            if (x < this.sys.game.config.width / 3 && y > this.sys.game.config.height / 1.5)
            {
                this.mario.activar_controles_moviles();
            }
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
        this.setas.update();
        this.finNivel.update();
        // this.layer1.setY(this.layer1.y + 0);

        // this.controls.update(delta);
    }

    tick_tiempo()
    {
        const mario = this.mario.get();

        // El tiempo se para al morir, al llegar al mastil y mientras Mario se transforma
        if (mario.getData('muerto') || mario.getData('level-up') || mario.getData('transformando'))
        {
            return;
        }

        Settings.marcadores.tiempo --;
        this.marcadores.update(5, Settings.marcadores.tiempo);

        // Poco tiempo: la musica se acelera
        if (Settings.marcadores.tiempo === Settings.TIEMPO.AVISO)
        {
            this.musica_principal.setRate(Settings.TIEMPO.VELOCIDAD_AVISO);
        }

        // Se acabo el tiempo: Mario muere (aunque sea grande o tenga la estrella)
        if (Settings.marcadores.tiempo <= 0)
        {
            this.mario.morir(true);
        }
    }

    // Se llama al terminar la animacion de muerte de Mario
    perder_vida()
    {
        Settings.marcadores.vidas --;

        if (Settings.marcadores.vidas > 0)
        {
            // Reinicia el nivel (goombas, bloques...). Los puntos se conservan.
            this.scene.restart();
        }
        else
        {
            this.scene.start('GameOver');
        }
    }

    set_cameras()
    {
        this.cameras.main.setBounds(
            0,
            0,
            this.layer1.x + this.layer1.width * Settings.getLayer1().scaleX,
            this.layer1.height * Settings.getLayer1().scaleY
        );

        // El limite derecho del mundo esta justo pasado el mastil: Mario no puede saltarlo
        // y siempre acaba tocandolo (FinNivel detecta el contacto).
        const TILE = Settings.screen.TILE_X * Settings.getLayer1().scaleX;
        const LIMITE_IZQ = this.sys.game.config.width / 16;
        const LIMITE_DER = (Settings.FIN_NIVEL.MASTIL_X + 0.5) * TILE + 10;

        this.physics.world.setBounds(
            LIMITE_IZQ,
            -100,
            LIMITE_DER - LIMITE_IZQ,
            this.layer1.height * Settings.getLayer1().scaleY + 200
        );
    }

    set_cameras_marcadores()
    {
        const { x, y, ancho, alto, scrollX, scrollY } = Settings.getCameraScores();
        
        this.mapa_scores = this.cameras.add(x, y, this.sys.game.config.width, alto).setZoom(1).setName('view-scores').setAlpha(1).setOrigin(0, 0);
        this.mapa_scores.scrollX = scrollX;
        this.mapa_scores.scrollY = scrollY;
        // this.mapa_scores.setBackgroundColor(0x00aabb);
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
        this.layer1.setCollision([41]);//             bloque '?' ya usado

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
        this.physics.add.collider(this.goombas.get(), this.goombas.get()); // chocan entre si y se dan la vuelta
        this.physics.add.collider(this.goombas.get(), this.colisionadoresInvisibles.get());

        this.physics.add.collider(this.setas.get(), this.layer1);
        this.physics.add.overlap(this.mario.get(), this.setas.get(), (mario, seta) =>
        {
            cogerSeta(mario, seta, this);
        });
        // this.physics.add.collider(this.goombas.get(), ?);
    }

    ajustes_tiles()
    {
        // Contenido de los bloques '?': en el mapa, cada moneda/seta esta dibujada justo ENCIMA
        // de su bloque. Se guarda por coordenadas del bloque ('x,y') antes de borrarlas:
        const CONTENIDOS = { 11: 'moneda', 12: 'seta', 18: '1up', 19: 'estrella' };
        this.contenidoBloques = new Map();

        this.layer1.filterTiles(tile => CONTENIDOS[tile.index]).forEach(tile =>
        {
            this.contenidoBloques.set(`${tile.x},${tile.y + 1}`, CONTENIDOS[tile.index]);
        });

        // Ladrillos de varias monedas: se pone un ladrillo (aunque en el mapa sea un '?')
        // y se quita el contenido que tuviera. Estado: monedas dadas y fin del tiempo.
        this.ladrillosMonedas = new Map();

        Settings.LADRILLOS_MONEDAS.POSICIONES.forEach(([x, y]) =>
        {
            this.layer1.putTileAt(15, x, y);
            this.contenidoBloques.delete(`${x},${y}`);
            this.ladrillosMonedas.set(`${x},${y}`, { monedas: 0, fin: null, ultimoGolpe: 0 });
        });

        // Reemplazar MONEDAS por cielo-azul:
        this.layer1.replaceByIndex(11, 1);
        // Reemplazar SETAS por cielo-azul:
        this.layer1.replaceByIndex(12, 1);
        this.layer1.replaceByIndex(18, 1);
        // Reemplazar ESTRELLA por cielo-azul:
        this.layer1.replaceByIndex(19, 1);

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
