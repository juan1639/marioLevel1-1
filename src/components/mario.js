import { Settings } from "../scenes/settings";
import { Textos } from "./textos.js";
import { play_sonidos, crear_animacion, ms_restantes } from "../utils/functions";

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
        this.SPRITE_SHEET_GRANDE = 'mario-ss1-grande';

        // Tamaño del cuerpo fisico, en pixeles del frame (sin escalar):
        this.ANCHO_BODY = Math.round(Settings.screen.TILE_X / 1.4);
        this.ALTO_BODY = Settings.screen.TILE_Y;
        this.ALTO_BODY_GRANDE = Settings.screen.TILE_Y * 2;

        this.mario = this.relatedScene.physics.add.sprite(this.X_INICIAL, this.Y_INICIAL, this.SPRITE_SHEET);

        this.mario.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);

        this.mario.body.setSize(this.ANCHO_BODY, this.ALTO_BODY, true);

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
        this.mario.setData('grande', false);
        this.mario.setData('transformando', false);
        this.mario.setData('invulnerable', false);

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
        if (this.mario.getData('level-up') || this.mario.getData('muerto') || this.mario.getData('transformando'))
        {
            return;
        }

        this.salto();
        this.direccion();
        // (El fin de nivel, al tocar el mastil, lo comprueba FinNivel.update())
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
                    this.playAnim('quieto');
                }
                else
                {
                    this.playAnim('saltando');
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
            this.playAnim('saltando');
        }
        else
        {
            this.playAnim('andar');
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

    esGrande()
    {
        return this.mario.getData('grande');
    }

    // Reproduce la animacion de la accion ('andar', 'quieto'...) segun el tamaño de Mario
    playAnim(accion)
    {
        const key = this.esGrande() ? `mario-grande-${accion}` : `mario-${accion}`;
        this.mario.anims.play(key, true);
    }

    // Cambia el sprite y el cuerpo fisico entre Mario pequeño y grande, manteniendo los pies
    // en el mismo sitio (el sprite crece/encoge desde su centro, asi que hay que mover 'y').
    setGrande(grande)
    {
        if (grande === this.esGrande())
        {
            return;
        }

        const AJUSTE_Y = (Settings.screen.TILE_Y * Settings.getLayer1().scaleY) / 2;

        this.mario.setData('grande', grande);
        this.mario.anims.stop();
        this.mario.setTexture(grande ? this.SPRITE_SHEET_GRANDE : this.SPRITE_SHEET, 0);
        this.mario.y += grande ? -AJUSTE_Y : AJUSTE_Y;
        this.mario.body.setSize(this.ANCHO_BODY, grande ? this.ALTO_BODY_GRANDE : this.ALTO_BODY, true);
    }

    // Transformacion con parpadeo (grande <-> pequeño). El juego se congela mientras dura.
    transformar(grande, alTerminar)
    {
        const scene = this.relatedScene;
        const CAMBIOS = 9; // impar: termina en el tamaño 'grande' pedido

        this.mario.setData('transformando', true);
        scene.physics.pause();

        let cambio = 0;

        scene.time.addEvent({
            delay: 90,
            repeat: CAMBIOS - 1,
            callback: () =>
            {
                cambio ++;
                this.setGrande(cambio % 2 === 1 ? grande : !grande);

                if (cambio === CAMBIOS)
                {
                    scene.physics.resume();
                    this.mario.setData('transformando', false);

                    if (alTerminar)
                    {
                        alTerminar();
                    }
                }
            }
        });
    }

    // Seta roja cogida
    crecer()
    {
        if (this.esGrande() || this.mario.getData('transformando'))
        {
            return;
        }

        this.transformar(true);
    }

    // Golpe de un enemigo: si es grande encoge (y queda invulnerable un rato); si es pequeño, muere
    recibirGolpe()
    {
        if (this.mario.getData('invulnerable') || this.mario.getData('transformando'))
        {
            return;
        }

        if (!this.esGrande())
        {
            this.morir(true);
            return;
        }

        const scene = this.relatedScene;

        this.mario.setData('invulnerable', true);
        play_sonidos(scene.sonido_marioTuberias, false, 0.7);

        this.transformar(false, () =>
        {
            const parpadeo = scene.tweens.add({
                targets: this.mario,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: -1
            });

            scene.time.delayedCall(Settings.MARIO.TIEMPO_INVULNERABLE, () =>
            {
                parpadeo.stop();
                this.mario.setAlpha(1);
                this.mario.setData('invulnerable', false);
            });
        });
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

        // Al terminar, se espera a que acabe el sonido de 'perder vida' (al reiniciar se cortaria)
        const terminar = () => scene.time.delayedCall(
            Math.max(Settings.MARIO.PAUSA_MUERTE, ms_restantes(scene.sonido_muerte) + 200),
            () => scene.perder_vida()
        );

        if (!conAnimacion)
        {
            terminar();
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
            onComplete: terminar
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

        // --- Mario grande ---
        // El spritesheet grande solo tiene 3 frames dibujados (0 = quieto, 1-2 = andar),
        // asi que 'saltando' y 'desliza-bandera' usan, de momento, frames provisionales:
        crear_animacion(this.relatedScene, {
            key: 'mario-grande-andar',
            frames: this.relatedScene.anims.generateFrameNumbers(this.SPRITE_SHEET_GRANDE, {frames: [0, 1, 2]}),
            frameRate: 10,
            yoyo: true,
            repeat: -1
        });

        crear_animacion(this.relatedScene, {
            key: 'mario-grande-quieto',
            frames: [{key: this.SPRITE_SHEET_GRANDE, frame: 0}],
            frameRate: 10,
        });

        crear_animacion(this.relatedScene, {
            key: 'mario-grande-saltando',
            frames: [{key: this.SPRITE_SHEET_GRANDE, frame: 1}],
            frameRate: 10,
        });

        crear_animacion(this.relatedScene, {
            key: 'mario-grande-desliza-bandera',
            frames: [{key: this.SPRITE_SHEET_GRANDE, frame: 0}],
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
