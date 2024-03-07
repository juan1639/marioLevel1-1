import { Scene } from 'phaser';
import { Mario } from '../components/mario.js';
import { CrucetaDireccion } from '../components/botonycruceta.js';
import { Textos } from '../components/textos.js';
import { Settings } from './settings.js';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    init() 
    {
        this.crucetaleft = new CrucetaDireccion(this, {
            id: 'cruceta-left', press: false, x: 50, y: 100, ang: 0, scX: 0.5, scY: 1, alpha: 0.3
        });

        this.crucetaright = new CrucetaDireccion(this, {
            id: 'cruceta-right', press: false, x: 200, y: 100, ang: 0, scX: 0.5, scY: 1, alpha: 0.3
        });

        this.mario = new Mario(this);

        this.textoIMI = new Textos(this);

        this.sonido_marioTuberias = this.sound.add('mario-tuberias');
    }

    preload() {}

    create ()
    {
        this.sonido_marioTuberias.play();
        this.sonido_marioTuberias.volume = 0.5;

        const map1 = this.make.tilemap({ key: 'map1' });
        const tileset1 = map1.addTilesetImage('tiles1-1', 'tiles1');
        this.layer1 = map1.createLayer('1-1', tileset1, 0, 0);

        this.set_cameras();
        
        this.mario.create();

        this.textoIMI.create({
            x: 120, y: 0, texto: 'Centro IMI de Zalla', size: 20, style: '', fll: '#ff0', family: 'verdana',
            strokeColor: '#ee9011', strokeSize: 4, ShadowColor: '#111111', bool1: false, bool2: true 
        });

        this.crucetaleft.create();
        this.crucetaright.create();

        this.cameras.main.startFollow(this.mario.get());

        console.log(this.input.activePointer);
        console.log(this.cameras.main);
    }

    update(time, delta) 
    {
        this.textoIMI.get().setX(this.cameras.main.scrollX + this.sys.game.config.width / 2);
        
        this.crucetaleft.get().setX(this.cameras.main.scrollX + (this.crucetaleft.get().width / 2) * this.crucetaleft.get().scaleX);
        this.crucetaright.get().setX(this.cameras.main.scrollX + this.sys.game.config.width - (this.crucetaleft.get().width / 2) * this.crucetaleft.get().scaleX);

        if (this.crucetaleft.isDown) this.mario.get().setVelocityX(-Settings.getVelScroll());
        if (this.crucetaright.isDown) this.mario.get().setVelocityX(Settings.getVelScroll());

        // this.controls.update(delta);
    }

    set_cameras()
    {
        this.cameras.main.setBounds(0, 0, this.layer1.x + this.layer1.width, this.layer1.height);

        this.physics.world.setBounds(
            this.sys.game.config.width / 2, 0,
            this.layer1.x + this.layer1.width - this.sys.game.config.width, this.layer1.height
        );
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
}
