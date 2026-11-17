import { Scene } from 'phaser';
import { Textos } from '../components/textos';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        const widthScreen = this.sys.game.config.width;
        const heightScreen = this.sys.game.config.height;

        this.add.image(0, 0, 'background').setOrigin(0, 0);

        this.txtcargando = new Textos(this);

        this.txtcargando.create({
            x: Math.floor(widthScreen / 2), y: Math.floor(heightScreen / 4),
            origin: [0.5, 0], texto: ' Cargando... ',
            size: 20, style: '', fll: '#ff0', family: 'verdana',
            strokeColor: '#ee9011', strokeSize: 4, ShadowColor: '#111111', bool1: false, bool2: true
        });

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(
            Math.floor(widthScreen / 2), Math.floor(heightScreen / 2),
            Math.floor(widthScreen / 1.5), Math.floor(heightScreen / 12)
        ).setStrokeStyle(1, 0xffee88);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(
            Math.floor(widthScreen / 2) - Math.floor(widthScreen / 3) + 4,
            Math.floor(heightScreen / 2),
            4,
            Math.floor(heightScreen / 14),
            0xff9911
        );

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            // Barra de progreso: crece segun el % cargado
            bar.width = (Math.floor(widthScreen / 1.55) * progress);
        });
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.spritesheet('boton-fullscreen', 'boton-fullscreen.png', {frameWidth: 64, frameHeight: 64});

        this.load.image('brick-particle', 'particula-ladrillo-mario.png');

        this.load.tilemapTiledJSON('map1', 'mario-level-1-1.json');
        this.load.image('tiles1', 'super_mario.png');

        this.load.spritesheet('mario-ss1', 'mario-ss1.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('mario-ss1-grande', 'mario-ss1-grande.png', {frameWidth: 16, frameHeight: 32});

        this.load.spritesheet('goomba-ss1', 'goomba-ss1.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('moneda', 'coin.png', {frameWidth: 32, frameHeight: 32});

        this.load.spritesheet('general-ssheet', 'super_mario.png', {frameWidth: 16, frameHeight: 16});

        // Audio & Musica
        this.load.audio('jumpbros', 'audio/jumpbros.ogg');
        this.load.audio('fireworks', 'audio/fireworks.mp3');
        this.load.audio('bricks-fall', 'audio/bricks-fall.mp3');
        this.load.audio('push-block', 'audio/wall.wav');
        this.load.audio('p-ping', 'audio/p-ping.mp3');
        this.load.audio('ough', 'audio/ough.mp3');
        this.load.audio('goomba-aplastado', 'audio/squit.mp3');
        this.load.audio('gameover', 'audio/gameover_mario.mp3');
        this.load.audio('musica-principal', 'audio/musica-mario-bros.mp3');
        this.load.audio('lose-life', 'audio/mario-lose-life.mp3');
        this.load.audio('level-up', 'audio/level-up.mp3');
        this.load.audio('seta', 'audio/seta.mp3');
        this.load.audio('estrella', 'audio/estrella.mp3');
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
