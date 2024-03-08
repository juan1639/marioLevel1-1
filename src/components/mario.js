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
        this.mario.setMaxVelocity(Settings.getMaxVelScroll(), Settings.getMaxVelSalto());

        this.mario.setData('acelera', Settings.getVelScroll());
        // this.mario.setData('aceleraSalto', Settings.getVelSalto());

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
        console.log(this.mario.getData('acelera'));

        if ((this.controles_mario.space.isDown || this.relatedScene.botonsalto.isDown) && this.mario.body.velocity.y === 0) 
        {
            this.mario.setVelocityY(-(Settings.getVelSalto() + Math.abs(this.mario.getData('acelera') * 0.3)));
        }

        if (this.controles_mario.left.isDown || this.relatedScene.crucetaleft.isDown) 
        {
            this.gestionar_aceleracion(false);
            this.mario.setVelocityX(this.mario.getData('acelera'));
            this.mario.anims.play('mario-andar', true);
            this.mario.setFlipX(true);
            this.gestionar_saltarYmoverse();
            
        } else if (this.controles_mario.right.isDown || this.relatedScene.crucetaright.isDown) 
        {
            this.gestionar_aceleracion(true);
            this.mario.setVelocityX(this.mario.getData('acelera'));
            this.mario.anims.play('mario-andar', true);
            this.mario.setFlipX(false);
            this.gestionar_saltarYmoverse();
                        
        } else 
        {
            if (this.mario.getData('acelera') !== Settings.getVelScroll())
            {
                if (this.mario.getData('acelera') > 0)
                {
                    this.mario.setData('acelera', this.mario.getData('acelera') - Settings.getAceleracion());

                } else
                {
                    this.mario.setData('acelera', this.mario.getData('acelera') + Settings.getAceleracion());
                }
                this.mario.setVelocityX(this.mario.getData('acelera'));

            } else
            {
                this.mario.anims.play('mario-quieto', true);
            }
        }
    }

    gestionar_aceleracion(derecha) 
    {
        if (Math.abs(this.mario.getData('acelera')) < Settings.getMaxVelScroll())
        {
            if (derecha){
                this.mario.setData('acelera', this.mario.getData('acelera') + Settings.getAceleracion());
            } else
            {
                this.mario.setData('acelera', this.mario.getData('acelera') - Settings.getAceleracion());
            }
        }
    }

    gestionar_saltarYmoverse()
    {
        if (this.relatedScene.botonsalto.isDown && this.mario.body.velocity.y === 0)
        {
            this.mario.setVelocityY(-(Settings.getVelSalto() + Math.abs(this.mario.getData('acelera') * 0.3)));
        }
    }

    get() 
    {
        return this.mario;
    }
}
