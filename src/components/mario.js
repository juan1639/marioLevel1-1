import { Settings } from "../scenes/settings";
import { Textos } from "./textos.js";
import { play_sonidos, crear_animacion } from "../utils/functions";

export class Mario 
{
    constructor(scene, args) 
    {
        this.relatedScene = scene;
        this.args = args;
    }

    create()
    {
        const {iniPosX, iniPosY} = this.args;

        this.X_INICIAL = iniPosX * (Settings.screen.TILE_X * Settings.getLayer1().scaleX);
        this.Y_INICIAL = iniPosY * (Settings.screen.TILE_Y * Settings.getLayer1().scaleY);
        this.SPRITE_SHEET = 'mario-ss1';

        this.mario = this.relatedScene.physics.add.sprite(this.X_INICIAL, this.Y_INICIAL, this.SPRITE_SHEET);

        this.mario.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);

        this.mario.setSize(Phaser.Math.RoundTo(this.mario.width / 1.4, 0, 10), this.mario.body.height);

        this.mario.setVisible(true);
        this.mario.setFrame(0);
        this.mario.setFlipX(false);

        this.mario.setCollideWorldBounds(true);
        this.mario.body.setAllowGravity(true);

        this.mario.setMaxVelocity(Settings.MARIO.MAX_VEL_SCROLL, Settings.MARIO.MAX_VEL_SALTO);

        this.mario.setData('acelera', Settings.MARIO.VEL_SCROLL);
        // this.mario.setData('aceleraSalto', Settings.getVelSalto());
        this.mario.setData('allow-salto', 0);
        this.mario.setData('cadencia-salto', 99);
        this.mario.setData('jump-key-up', true);
        this.mario.setData('level-up', false);
        this.mario.setData('muerto', false);

        this.animaciones_mario();

        // CONFIG Joystick rexvirtual-joystick-plugin:
        this.joyStick = this.relatedScene.plugins.get('rexvirtualjoystickplugin').add(this.relatedScene, {
            x: 128,
            y: -999,
            // y: this.relatedScene.sys.game.config.height - 96,
            radius: 50,
            base: this.relatedScene.add.circle(0, 0, 64, 0x888888, 0.6),
            // base: this.add.image(0, 0, 'base-joystick').setScale(2),
            thumb: this.relatedScene.add.circle(0, 0, 28, 0xcccccc),
            // thumb: this.add.image(0, 0, 'base-joystick').setScale(1)
            dir: '8dir',
            fixed: true,
            enable: true
        });

        // SELECT - MOBILE-CONTROLS (rexvirtual-joystick-plugin):
        this.mobile_controls_option = new Textos(this.relatedScene);
        
        this.mobile_controls_option.create({
            x: 128,
            y: this.relatedScene.sys.game.config.height - 96,
            origin: [0.5, 0.5],
            texto: '  Touch \n controls ', size: 28, style: 'bold',  fll: '#eea',
            family: 'arial, sans-serif',
            strokeColor: '#d71', strokeSize: 8, ShadowColor: '#111',
            bool1: true, bool2: true
        });
        this.mobile_controls_option.get().setAlpha(0.7);

        this.controlJoy = this.joyStick.createCursorKeys();
        this.controles_mario = this.relatedScene.input.keyboard.createCursorKeys();

        // Settings.controls.MOBILE se conserva al reiniciar la escena (tras perder una vida):
        if (Settings.controls.MOBILE)
        {
            this.activar_controles_moviles();
        }
    }

    // Oculta el texto 'Touch controls' y coloca el joystick en pantalla
    activar_controles_moviles()
    {
        Settings.controls.MOBILE = true;
        this.mobile_controls_option.get().setAlpha(0);
        this.joyStick.y = this.relatedScene.sys.game.config.height - 96;
    }

    update()
    {
        if (this.mario.getData('level-up') || this.mario.getData('muerto'))
        {
            return;
        }

        this.salto();
        this.direccion();
        this.checkLevelUp(this.relatedScene.physics.world.bounds.width);// RIGHT_WORLD_BOUNDS (LEVEL-UP)
        this.checkFallOutBounds(this.mario.body.world.bounds.bottom);// BOTTOM_WORLD_BOUNDS
    }

    salto()
    {
        const CONTROLES_SALTO = Settings.controls.MOBILE ? this.controlJoy.up : this.controles_mario.space;

        if ((CONTROLES_SALTO.isDown)
            && this.enSuelo()
            && this.relatedScene.time.now > this.mario.getData('allow-salto') 
            && this.mario.getData('jump-key-up')
        ) 
        {
            this.mario.setVelocityY(-(Settings.MARIO.VEL_SALTO + Math.abs(this.mario.getData('acelera') * 0.52)));
            this.mario.setData('allow-salto', this.relatedScene.time.now + this.mario.getData('cadencia-salto'));
            this.mario.setData('jump-key-up', false);
            play_sonidos(this.relatedScene.sonido_jumpbros, false, 0.4);
        }

        if (CONTROLES_SALTO.isUp)
        {
            this.mario.setData('jump-key-up', true);
        }
    }

    direccion()
    {
        const CONTROLES_DIR = Settings.controls.MOBILE ? this.controlJoy : this.controles_mario;

        if (CONTROLES_DIR.left.isDown) 
        {
            this.gestionar_aceleracion(false);
            this.mario.setVelocityX(this.mario.getData('acelera'));
            this.selecc_anima_salto_anima_suelo();
            this.mario.setFlipX(true);
            
        } else if (CONTROLES_DIR.right.isDown) 
        {
            this.gestionar_aceleracion(true);
            this.mario.setVelocityX(this.mario.getData('acelera'));
            this.selecc_anima_salto_anima_suelo();
            this.mario.setFlipX(false);

        } else 
        {
            if (this.mario.getData('acelera') !== Settings.MARIO.VEL_SCROLL)
            {
                if (this.mario.getData('acelera') > 0)
                {
                    this.mario.setData('acelera', this.mario.getData('acelera') - Settings.MARIO.DECELERACION);
                    this.mario.setData('acelera', this.mario.getData('acelera') < 0 ? 0 : this.mario.getData('acelera'));

                } else
                {
                    this.mario.setData('acelera', this.mario.getData('acelera') + Settings.MARIO.DECELERACION);
                    this.mario.setData('acelera', this.mario.getData('acelera') > 0 ? 0 : this.mario.getData('acelera'));

                }
                this.mario.setVelocityX(this.mario.getData('acelera'));

            } else
            {
                if (this.enSuelo())
                {
                    this.mario.anims.play('mario-quieto', true);
                }
                else
                {
                    this.mario.anims.play('mario-saltando', true);
                }
            }
        }
    }

    gestionar_aceleracion(derecha) 
    {
        if (Math.abs(this.mario.getData('acelera')) < Settings.MARIO.MAX_VEL_SCROLL)
        {
            if (derecha)
            {
                this.mario.setData('acelera', this.mario.getData('acelera') + Settings.MARIO.ACELERACION);
            } else
            {
                this.mario.setData('acelera', this.mario.getData('acelera') - Settings.MARIO.ACELERACION);
            }
        }
    }

    selecc_anima_salto_anima_suelo()
    {
        if (!this.enSuelo())
        {
            this.mario.anims.play('mario-saltando', true);
        }
        else
        {
            this.mario.anims.play('mario-andar', true);
        }
    }

    checkLevelUp(RIGHT_BOUNDS)
    {
        const AJUSTE_MANUAL_X = (Settings.screen.TILE_X * Settings.getLayer1().scaleX) - 8;

        if (this.mario.x >= RIGHT_BOUNDS + AJUSTE_MANUAL_X)
        {
            console.log('limite LEVEL-UP!');
            this.mario.setData('level-up', true);
            this.mario.anims.play('mario-desliza-bandera', true);
        }
    }

    checkFallOutBounds(BOTTOM_BOUNDS)
    {
        if (this.mario.body.bottom >= BOTTOM_BOUNDS)
        {
            // Ya esta fuera de la pantalla: sin animacion de salto
            this.morir(false);
        }
    }

    // Esta Mario apoyado en algo solido? (velocity.y === 0 tambien es cierto en lo alto del salto)
    enSuelo()
    {
        return this.mario.body.blocked.down || this.mario.body.touching.down;
    }

    // Muerte de Mario: se congela el juego, Mario salta y cae fuera de la pantalla,
    // y despues la escena Game decide (perder_vida) si se reinicia el nivel o es Game Over.
    morir(conAnimacion)
    {
        if (this.mario.getData('muerto'))
        {
            return;
        }

        const scene = this.relatedScene;

        this.mario.setData('muerto', true);

        // Congela todas las fisicas (Mario y goombas). Tweens y timers siguen funcionando:
        scene.physics.pause();
        scene.cameras.main.stopFollow();

        scene.musica_principal.stop();
        play_sonidos(scene.sonido_muerte, false, 0.7);

        if (!conAnimacion)
        {
            scene.time.delayedCall(Settings.MARIO.PAUSA_MUERTE * 2, () => scene.perder_vida());
            return;
        }

        this.mario.anims.play('mario-muere');

        scene.tweens.chain({
            targets: this.mario,
            tweens: [
                {
                    // Pausa y salto hacia arriba
                    y: this.mario.y - (Settings.screen.TILE_Y * Settings.getLayer1().scaleY) * 3,
                    delay: Settings.MARIO.PAUSA_MUERTE,
                    duration: 400,
                    ease: 'Quad.easeOut'
                },
                {
                    // Caida hasta salir por debajo de la pantalla
                    y: scene.cameras.main.worldView.bottom + 64,
                    duration: 900,
                    ease: 'Quad.easeIn'
                }
            ],
            onComplete: () => scene.time.delayedCall(Settings.MARIO.PAUSA_MUERTE, () => scene.perder_vida())
        });
    }

    animaciones_mario()
    {
        crear_animacion(this.relatedScene, {
            key: 'mario-andar',
            frames: this.relatedScene.anims.generateFrameNumbers(this.SPRITE_SHEET, {frames: [1, 2, 3]}),
            frameRate: 10,
            yoyo: true,
            repeat: -1
        });

        crear_animacion(this.relatedScene, {
            key: 'mario-quieto',
            frames: [{key: this.SPRITE_SHEET, frame: 0}],
            frameRate: 10,
        });

        crear_animacion(this.relatedScene, {
            key: 'mario-desliza-bandera',
            frames: [{key: this.SPRITE_SHEET, frame: 6}],
            frameRate: 10,
        });

        crear_animacion(this.relatedScene, {
            key: 'mario-saltando',
            frames: [{key: this.SPRITE_SHEET, frame: 5}],
            frameRate: 10,
        });

        crear_animacion(this.relatedScene, {
            key: 'mario-muere',
            frames: [{key: this.SPRITE_SHEET, frame: 7}],
            frameRate: 10,
        });
    }

    get() 
    {
        return this.mario;
    }

    get_joystick()
    {
        return this.joyStick;
    }

    get_mobile_controls()
    {
        return this.mobile_controls_option;
    }
}
