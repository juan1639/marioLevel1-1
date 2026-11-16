import { Settings } from "../scenes/settings.js";

// Setas (y estrella) que salen de los bloques '?':
//  - 'seta' (roja): Mario pasa a ser grande
//  - '1up' (verde): una vida extra
//  - 'estrella': Mario invencible un rato (va dando saltos)
export class Setas
{
    // Frame de cada tipo de seta en 'general-ssheet' (= indice del tile - 1)
    static FRAMES = { seta: 11, '1up': 17, estrella: 18 };

    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.setas = this.relatedScene.physics.add.group();
    }

    // La seta 'sube' desde dentro del bloque (x = centro del bloque, yTop = borde superior del bloque),
    // y cuando ha salido del todo empieza a moverse.
    sacar(x, yTop, tipo)
    {
        const scene = this.relatedScene;
        const ESCALA = Settings.getLayer1().scaleY;
        const ALTO = Settings.screen.TILE_Y * ESCALA;

        // Origen abajo-centro: empieza 'metida' en el bloque (su base en el borde inferior del bloque)
        const seta = scene.add.sprite(x, yTop + ALTO, 'general-ssheet', Setas.FRAMES[tipo]);
        seta.setOrigin(0.5, 1).setScale(Settings.getLayer1().scaleX, ESCALA);
        seta.setData('tipo', tipo);

        // Solo se ve la parte que ya ha salido por encima del bloque (recorte en pixeles del frame):
        const recortar = () =>
        {
            const visible = Phaser.Math.Clamp(yTop - (seta.y - ALTO), 0, ALTO) / ESCALA;
            seta.setCrop(0, 0, Settings.screen.TILE_X, visible);
        };
        recortar();

        scene.tweens.add({
            targets: seta,
            y: yTop,
            duration: Settings.SETA.DURACION_SALIDA,
            onUpdate: recortar,
            onComplete: () =>
            {
                seta.setCrop();

                // Ya fuera: pasa a tener fisicas (se configura DESPUES de añadirla al grupo,
                // porque el grupo resetea velocidad, rebote, etc. al añadir).
                // OJO: 'seta' es un Sprite normal (no Arcade.Sprite), asi que no tiene
                // setBounce/setVelocityX: hay que usar los metodos de su body.
                this.setas.add(seta);
                seta.body.setAllowGravity(true);
                seta.body.setBounce(1, 0);

                if (tipo === 'estrella')
                {
                    seta.body.setVelocity(Settings.ESTRELLA.VEL_X, -Settings.ESTRELLA.VEL_SALTO);
                }
                else
                {
                    seta.body.setVelocityX(Settings.SETA.VEL_X);
                }
            }
        });
    }

    update()
    {
        const LIMITE_Y = this.relatedScene.layer1.height * Settings.getLayer1().scaleY;

        // Destruye las setas que han caido por un agujero.
        // (Se recorre una copia: no se puede destruir mientras se itera el propio grupo)
        this.setas.getChildren().slice().forEach(seta =>
        {
            if (seta.y > LIMITE_Y + 64)
            {
                seta.destroy();
                return;
            }

            // La estrella vuelve a saltar cada vez que toca el suelo
            if (seta.getData('tipo') === 'estrella' && seta.body.blocked.down)
            {
                seta.body.setVelocityY(-Settings.ESTRELLA.VEL_SALTO);
            }
        });
    }

    get()
    {
        return this.setas;
    }
}
