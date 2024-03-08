import { Settings } from "../scenes/settings";

export class Mario 
{

    constructor(scene) 
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.mario = this.relatedScene.physics.add.sprite(
            this.relatedScene.sys.game.config.width / 2, 100, 'mario-ss1'
        );

        this.mario.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);
        this.mario.setVisible(true).setFrame(0).setFlipX(false);
        this.mario.setCollideWorldBounds(true);
        this.mario.body.setAllowGravity(true);

        this.relatedScene.anims.create({
            key: 'mario-andar', 
            frames: this.relatedScene.anims.generateFrameNumbers('mario-ss1', {frames: [1, 2]}),
            frameRate: 10,
            yoyo: true,
            repeat: -1
        });

        this.relatedScene.anims.create({
            key: 'mario-quieto',
            frames: [{key: 'mario-ss1', frame: 0}],
            frameRate: 10,
        });

        this.controles_mario = this.relatedScene.input.keyboard.createCursorKeys();

        console.log(this.mario);
    }

    update()
    {
        if ((this.controles_mario.space.isDown || this.relatedScene.botonsalto.isDown) && this.mario.body.velocity.y === 0) 
        {
            this.mario.setVelocityY(Settings.getVelSalto());
        }

        if (this.controles_mario.left.isDown || this.relatedScene.crucetaleft.isDown) 
        {
            this.mario.setVelocityX(-Settings.getVelScroll());
            this.mario.anims.play('mario-andar', true);
            this.mario.setFlipX(true);
            
        } else if (this.controles_mario.right.isDown || this.relatedScene.crucetaright.isDown) 
        {
            this.mario.setVelocityX(Settings.getVelScroll());
            this.mario.anims.play('mario-andar', true);
            this.mario.setFlipX(false);
            
        } else 
        {
            this.mario.setVelocityX(0);
            this.mario.anims.play('mario-quieto', true);
        }
    }

    get() 
    {
        return this.mario;
    }
}
