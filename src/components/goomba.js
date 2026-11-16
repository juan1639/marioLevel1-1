import { Settings } from "../scenes/settings";
import { crear_animacion } from "../utils/functions.js";

export class Goombas
{
    constructor(scene) 
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.SPRITE_SHEET = 'goomba-ss1';
        this.animaciones_goomba();

        this.goombas = this.relatedScene.physics.add.group();

        Settings.ARRAY_GOOMBAS.forEach(pos =>
        {
            const goomba = this.relatedScene.physics.add.sprite(
                pos[0] * (Settings.screen.TILE_X * Settings.getLayer1().scaleX),
                pos[1] * (Settings.screen.TILE_Y * Settings.getLayer1().scaleY),
                this.SPRITE_SHEET
            );

            this.goombas.add(goomba);

            console.log(goomba);
        });

        this.goombas.children.iterate(goomba =>
        {
            goomba.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);
            // this.goomba.setSize(Phaser.Math.RoundTo(this.goomba.width / 1.4, 0, 10), this.goomba.body.height);
            goomba.setVisible(true);
            goomba.setFrame(0);
            goomba.body.setAllowGravity(true);
            goomba.setCollideWorldBounds(true);
            goomba.setData('quieto', true);
            goomba.setVelocityX(0);
            goomba.setBounce(1, 0);
            goomba.anims.play('goomba-andar', true);
        });

        this.DISTANCIA_ACTIVA_GOOMBAS = this.relatedScene.sys.game.config.width;
    }

    update()
    {
        const mario = this.relatedScene.mario.get();
        const LIMITE_Y = this.relatedScene.layer1.height * Settings.getLayer1().scaleY;

        // Se recorre una copia: no se puede destruir mientras se itera el propio grupo
        this.goombas.getChildren().slice().forEach(goomba =>
        {
            // Goomba que ha caido por un agujero
            if (goomba.y > LIMITE_Y + 64)
            {
                goomba.destroy();
                return;
            }

            // Se activa (empieza a andar) cuando Mario esta a menos de una pantalla
            if (goomba.getData('quieto') && Math.abs(mario.x - goomba.x) < this.DISTANCIA_ACTIVA_GOOMBAS)
            {
                goomba.setData('quieto', false);
                goomba.setVelocityX(Settings.GOOMBA.VEL_X);
            }
        });

        // Phaser.Actions.IncX(this.goombas.getChildren(), -0.5);
    }

    animaciones_goomba()
    {
        crear_animacion(this.relatedScene, {
            key: 'goomba-andar', 
            frames: this.relatedScene.anims.generateFrameNumbers(this.SPRITE_SHEET, {frames: [0, 1]}),
            frameRate: 5,
            yoyo: true,
            repeat: -1
        });

        crear_animacion(this.relatedScene, {
            key: 'goomba-aplastado',
            frames: [{key: this.SPRITE_SHEET, frame: 2}],
            frameRate: 10,
        });
    }

    get() 
    {
        return this.goombas;
    }
}
