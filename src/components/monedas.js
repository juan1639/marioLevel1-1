import { Settings } from "../scenes/settings.js";
import { crear_animacion, mostrar_puntos } from "../utils/functions.js";

// Monedas que salen de los bloques '?': saltan girando por encima del bloque,
// vuelven a caer y desaparecen (los puntos se suman al golpear el bloque).
export class Monedas
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create()
    {
        crear_animacion(this.relatedScene, {
            key: 'moneda-gira',
            frames: this.relatedScene.anims.generateFrameNumbers('moneda', {start: 0, end: 5}),
            frameRate: 20,
            repeat: -1
        });
    }

    // x = centro del bloque, yTop = borde superior del bloque
    sacar(x, yTop)
    {
        const scene = this.relatedScene;
        const TILE = Settings.screen.TILE_Y * Settings.getLayer1().scaleY;

        const moneda = scene.add.sprite(x, yTop - TILE / 2, 'moneda');
        moneda.play('moneda-gira');

        scene.tweens.chain({
            targets: moneda,
            tweens: [
                { y: yTop - TILE * 3.5, duration: 280, ease: 'Quad.easeOut' },
                { y: yTop - TILE * 1.5, duration: 220, ease: 'Quad.easeIn' }
            ],
            onComplete: () =>
            {
                mostrar_puntos(scene, Settings.MONEDA.PUNTOS, moneda.x, moneda.y);
                moneda.destroy();
            }
        });
    }
}
