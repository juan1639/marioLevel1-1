import { Settings } from "../scenes/settings.js";

export class ColisionadoresInvisibles
{
    constructor(scene)
    {
        this.relatedScene = scene;
        this.triggers = this.relatedScene.physics.add.staticGroup();
    }

    create(posiciones)
    {
        posiciones.forEach(([x, y]) =>
        {
            const TILE_X = Settings.screen.TILE_X * Settings.getLayer1().scaleX;
            const TILE_Y = Settings.screen.TILE_Y * Settings.getLayer1().scaleY;

            const trigger = this.relatedScene.add.rectangle(
                (x * TILE_X) + (TILE_X / 2),
                (y * TILE_Y) + (TILE_Y / 2),
                TILE_X,
                TILE_Y
            );

            this.relatedScene.physics.add.existing(trigger, true); // true = estático
            trigger.setVisible(false); // invisible
            this.triggers.add(trigger);
        });
    }

    get()
    {
        return this.triggers;
    }
}
