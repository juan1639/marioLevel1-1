import { Settings } from "../scenes/settings.js";

// Fuegos artificiales: un cohete sube y explota en una lluvia de chispas de colores.
// La textura de la chispa (un circulo blanco) se genera por codigo y se colorea con 'tint'.
export class FuegosArtificiales
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create()
    {
        const scene = this.relatedScene;

        // Las texturas son globales: solo se genera la primera vez
        if (!scene.textures.exists('chispa'))
        {
            const g = scene.make.graphics({ x: 0, y: 0 }, false);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 4);
            g.generateTexture('chispa', 8, 8);
            g.destroy();
        }

        this.emisor = scene.add.particles(0, 0, 'chispa', {
            speed: { min: 60, max: 230 },
            angle: { min: 0, max: 360 },
            gravityY: 140,
            lifespan: { min: 700, max: 1200 },
            scale: { start: 1, end: 0.2 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            emitting: false
        }).setDepth(9);
    }

    // Lanza cohetes sin parar (uno cada Settings.FUEGOS.CADENCIA ms) dentro de la zona indicada
    // (coordenadas del mundo). Se paran solos al reiniciar o cambiar de escena.
    empezar(xMin, xMax, yMin, yMax, ySalida)
    {
        const lanzar = () => this.lanzar(
            Phaser.Math.Between(xMin, xMax),
            ySalida,
            Phaser.Math.Between(yMin, yMax)
        );

        lanzar();

        this.relatedScene.time.addEvent({
            delay: Settings.FUEGOS.CADENCIA,
            loop: true,
            callback: lanzar
        });
    }

    lanzar(x, ySalida, yExplosion)
    {
        const scene = this.relatedScene;
        const color = Phaser.Utils.Array.GetRandom(Settings.FUEGOS.COLORES);

        // Cohete: una chispa que sube y explota al llegar arriba
        const cohete = scene.add.image(x, ySalida, 'chispa').setTint(color).setDepth(9);

        scene.tweens.add({
            targets: cohete,
            y: yExplosion,
            duration: 450,
            ease: 'Quad.easeOut',
            onComplete: () =>
            {
                cohete.destroy();
                this.emisor.setParticleTint(color);
                this.emisor.explode(Settings.FUEGOS.CHISPAS, x, yExplosion);
            }
        });
    }
}
