import { Settings } from "../scenes/settings";

export class AnimaBloques
{
    constructor(scene, config)
    {
        this.relatedScene = scene;
        this.config = config;
    }

    create(coorX, coorY, alTerminar)
    {
        const {offsetY, easeEtc, duracion, conYoyo, frame = 13} = this.config;

        // Sprite normal (sin fisicas): solo es decorativo, el tile de debajo es el que colisiona
        this.bloque = this.relatedScene.add.sprite(coorX, coorY, 'general-ssheet', frame);

        this.bloque.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);

        this.relatedScene.tweens.add({
            targets: this.bloque,
            y: coorY + offsetY,
            ease: easeEtc,
            duration: duracion,
            yoyo: conYoyo,
            onComplete: () =>
            {
                this.bloque.destroy();

                if (alTerminar)
                {
                    alTerminar();
                }
            }
        });
    }

    get()
    {
        return this.bloque;
    }
}
