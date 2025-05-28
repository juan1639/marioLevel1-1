import { Settings } from "../scenes/settings";

export class AnimaBloques
{
    constructor(scene, config)
    {
        this.relatedScene = scene;
        this.config = config;
    }
  
    create(coorX, coorY)
    {
        const {offsetY, easeEtc, duracion, conYoyo} = this.config;

        this.bloque = this.relatedScene.physics.add.sprite(coorX, coorY, 'general-ssheet', 13);

        this.bloque.setScale(Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);

        this.relatedScene.tweens.add({
            targets: this.bloque,
            y: coorY + offsetY,
            ease: easeEtc,
            duration: duracion,
            yoyo: conYoyo,
            // delay: 100,
            // repeat: -1,
            // repeatDelay: frecuencia
        });

        const timeline = this.relatedScene.add.timeline([
            {
                at: duracion * 1.5,
                run: () => this.bloque.setVisible(false)
            }
        ]);

        timeline.play();

        console.log(this.bloque);
    }

    get()
    {
        return this.bloque;
    }
}
