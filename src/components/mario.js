import { Settings } from "../scenes/settings";
import { play_sonidos } from "../utils/functions";

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
        this.mario.setData('allow-salto', 0);
        this.mario.setData('cadencia-salto', 99);

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

        this.joyStick = this.relatedScene.plugins.get('rexvirtualjoystickplugin').add(this.relatedScene, {
            x: 24,
            y: this.relatedScene.sys.game.config.height - 24,
            radius: 100,
            base: this.relatedScene.add.circle(0, 0, 25, 0x888888, 0.6),
            // base: this.add.image(0, 0, 'base-joystick').setScale(2),
            thumb: this.relatedScene.add.circle(0, 0, 10, 0xcccccc),
            // thumb: this.add.image(0, 0, 'base-joystick').setScale(1)
            dir: '8dir',
            fixed: true,
            enable: true
        });

        this.controlJoy = this.joyStick.createCursorKeys();
        this.controles_mario = this.relatedScene.input.keyboard.createCursorKeys();

        console.log(this.mario);
    }

    update()
    {
        // console.log(this.mario.getData('acelera'));

        if ((this.controles_mario.space.isDown || this.controlJoy.up.isDown)
            && this.mario.body.velocity.y === 0
            && this.relatedScene.time.now > this.mario.getData('allow-salto')
        ) 
        {
            this.mario.setVelocityY(-(Settings.getVelSalto() + Math.abs(this.mario.getData('acelera') * 0.3)));
            this.mario.setData('allow-salto', this.relatedScene.time.now + this.mario.getData('cadencia-salto'));
            play_sonidos(this.relatedScene.sonido_jumpbros, false, 0.8);
        }

        if (this.controles_mario.left.isDown || this.controlJoy.left.isDown) 
        {
            this.gestionar_aceleracion(false);
            this.mario.setVelocityX(this.mario.getData('acelera'));
            this.mario.anims.play('mario-andar', true);
            this.mario.setFlipX(true);
            
        } else if (this.controles_mario.right.isDown || this.controlJoy.right.isDown) 
        {
            this.gestionar_aceleracion(true);
            this.mario.setVelocityX(this.mario.getData('acelera'));
            this.mario.anims.play('mario-andar', true);
            this.mario.setFlipX(false);

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

    get() 
    {
        return this.mario;
    }
}
