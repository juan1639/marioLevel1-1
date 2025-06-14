import { Settings } from "../scenes/settings";

export class Goomba 
{
    constructor(scene) 
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.SPRITE_SHEET = 'goomba-ss1';

        this.goomba = this.relatedScene.physics.add.sprite(1200, 200, this.SPRITE_SHEET);

        this.goomba.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);

        // this.goomba.setSize(Phaser.Math.RoundTo(this.goomba.width / 1.4, 0, 10), this.goomba.body.height);

        this.goomba.setVisible(true);
        this.goomba.setFrame(0);

        this.goomba.setCollideWorldBounds(true);
        this.goomba.body.setAllowGravity(true);

        this.goomba.setData('vel_x', Settings.GOOMBA.VEL_X);
        this.goomba.setVelocityX(this.goomba.getData('vel_x'));

        this.animaciones_goomba();
        this.goomba.anims.play('goomba-andar', true);

        console.log(this.goomba);
    }

    update()
    {
        this.checkFallOutBounds(this.goomba.body.world.bounds.bottom);// BOTTOM_WORLD_BOUNDS
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
        return this.goomba;
    }
}
