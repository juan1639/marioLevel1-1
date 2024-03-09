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
            x: Math.floor(widthScreen / 2), y: Math.floor(heightScreen / 4), texto: ' Cargando... ',
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

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = (Math.floor(widthScreen / 1.55) * progress);
        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');
        
        this.load.tilemapTiledJSON('map1', 'super-mario.json');
        this.load.image('tiles1', 'super-mario.png');
        this.load.spritesheet('mario-ss1', 'mario-ss1.png', {frameWidth: 16, frameHeight: 16});

        // Plugin Joystick mobile
        const url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
        this.load.plugin('rexvirtualjoystickplugin', url, true);

        // Audio & Musica
        this.load.audio('mario-tuberias', 'mario-tuberias.mp3');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
