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

            goomba.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);
            // this.goomba.setSize(Phaser.Math.RoundTo(this.goomba.width / 1.4, 0, 10), this.goomba.body.height);

            goomba.setVisible(true);
            goomba.setFrame(0);

            goomba.setCollideWorldBounds(true);
            goomba.body.setAllowGravity(true);

            // goomba.setData('vel_x', Settings.GOOMBA.VEL_X);
            // goomba.setVelocityX(goomba.getData('vel_x'));
            // goomba.setVelocityX(-60);

            //this.animaciones_goomba();
            goomba.anims.play('goomba-andar', true);

            this.goombas.add(goomba);

            console.log(goomba);
        });

        this.goombas.children.iterate(goomba =>
        {
            goomba.setVelocityX(Settings.GOOMBA.VEL_X);

        });

        console.log(this.goombas);
    }

    update()
    {
        
        // Phaser.Actions.IncX(this.goombas.getChildren(), -0.5);
        //this.checkFallOutBounds(this.goomba.body.world.bounds.bottom);// BOTTOM_WORLD_BOUNDS
    }

    checkFallOutBounds(BOTTOM_BOUNDS)
    {
        if (this.goomba.body.bottom >= BOTTOM_BOUNDS)
        {
            console.log(this.goomba.body.bottom, this.goomba.visible);
            
            /* if (this.mario.visible)
            {
                this.mario.setVisible(false);
            } */

            this.goomba.setX(400).setY(200);
        }
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
