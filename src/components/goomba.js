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

        // Si Mario reaparece en el checkpoint, los goombas que quedan por detras no se crean
        const xMinima = Settings.nivel.checkpoint ? Settings.CHECKPOINT.X : -Infinity;

        Settings.ARRAY_GOOMBAS.filter(pos => pos[0] >= xMinima).forEach(pos =>
        {
            const goomba = this.relatedScene.physics.add.sprite(
                pos[0] * (Settings.screen.TILE_X * Settings.getLayer1().scaleX),
                pos[1] * (Settings.screen.TILE_Y * Settings.getLayer1().scaleY),
                this.SPRITE_SHEET
            );

            this.goombas.add(goomba);
        });

        this.goombas.children.iterate(goomba =>
        {
            goomba.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);
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
            if (goomba.getData('quieto'))
            {
                if (Math.abs(mario.x - goomba.x) < this.DISTANCIA_ACTIVA_GOOMBAS)
                {
                    // Hay que darle ya la velocidad: si se quedara a 0, en el siguiente frame
                    // se interpretaria como 'se ha quedado parado' y se daria la vuelta
                    goomba.setData('quieto', false);
                    goomba.setData('dir', Math.sign(Settings.GOOMBA.VEL_X));
                    goomba.setVelocityX(Settings.GOOMBA.VEL_X);
                }
                return;
            }

            // Muerto (aplastado o derrotado): ya no se mueve
            if (!goomba.body.enable)
            {
                return;
            }

            // Los choques (paredes, otros goombas) cambian su velocidad; aqui solo se recoge el
            // sentido y se vuelve a poner la velocidad completa. Si un choque lo ha dejado parado
            // del todo, se da la vuelta (antes se quedaba quieto para siempre, 'andando' en el sitio).
            const vx = goomba.body.velocity.x;
            const dir = vx !== 0 ? Math.sign(vx) : -goomba.getData('dir');

            goomba.setData('dir', dir);
            goomba.setVelocityX(dir * Math.abs(Settings.GOOMBA.VEL_X));
        });
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
