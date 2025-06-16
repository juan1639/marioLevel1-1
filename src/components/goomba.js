import { Settings } from "../scenes/settings";

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

        console.log(this.goombas);
    }

    update()
    {
        this.goombas.children.iterate((goomba) =>
        {
            if (goomba.getData('quieto'))
            {
                const mario = this.relatedScene.mario.get();

                if (!mario)
                {
                    console.warn("⚠️ Mario no está definido");
                    return;
                }

                const distancia = Math.abs(mario.x - goomba.x);
                //console.log(`Distancia Mario-Goomba: ${distancia}`);

                if (distancia < this.DISTANCIA_ACTIVA_GOOMBAS)
                {
                    console.log("✅ Activando Goomba");
                    goomba.setData('quieto', false);
                    goomba.setVelocityX(Settings.GOOMBA.VEL_X);
                }
            }
        });

        // Phaser.Actions.IncX(this.goombas.getChildren(), -0.5);
    }

    animaciones_goomba()
    {
        this.relatedScene.anims.create({
            key: 'goomba-andar', 
            frames: this.relatedScene.anims.generateFrameNumbers(this.SPRITE_SHEET, {frames: [0, 1]}),
            frameRate: 5,
            yoyo: true,
            repeat: -1
        });
    }

    get() 
    {
        return this.goombas;
    }
}
