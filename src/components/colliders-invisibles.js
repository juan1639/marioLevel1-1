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
                (x * TILE_X) + (TILE_X / 2),// BRRR tuve que poner +16 'a pelo'
                (y * TILE_Y) + (TILE_Y / 2),
                TILE_X,
                TILE_Y
            );

            this.relatedScene.physics.add.existing(trigger, true); // true = estático
            trigger.setVisible(false); // invisible
            //trigger.setFillStyle(0xff0000, 0.5); // rojo semitransparente
            this.triggers.add(trigger);
        });
    
        /* this.relatedScene.colisionadoresInvisibles.body.setCollider(this.relatedScene.goombas.get(), (goomba, trigger) => {
            goomba.body.velocity.x *= -1; // invierte dirección
        }); */
    }

    setColliders(goombas, callback)
    {
        this.scene.physics.add.collider(goombas, this.triggers, callback);
    }

    get()
    {
        return this.triggers;
    }
}
