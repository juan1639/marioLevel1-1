import { Settings } from '../scenes/settings.js';

export class CollidersInvisibles
{
    constructor(scene) 
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.collidersInvisibles = this.relatedScene.physics.add.staticGroup();

        Settings.COLLIDERS_INVISIBLES.forEach(pos =>
        {
            const collider = this.relatedScene.physics.add.sprite(
                pos[0] * (Settings.screen.TILE_X * Settings.getLayer1().scaleX),
                pos[1] * (Settings.screen.TILE_Y * Settings.getLayer1().scaleY),
                'goomba-ss1'
            ).setOrigin(0, 0).setData('ancho', pos[2]);

            this.collidersInvisibles.add(collider);
        });

        this.collidersInvisibles.children.iterate(collider =>
        {
            collider.setScale(Settings.getLayer1().scaleX * collider.getData('ancho'), Settings.getLayer1().scaleY);
            //collider.setSize(Phaser.Math.RoundTo(this.goomba.width / 1.4, 0, 10), this.goomba.body.height);
            // collider.setSize(0, 0, collider.getData('ancho') * Settings.getLayer1().scaleX, Settings.getLayer1().scaleY);
            collider.setVisible(true);
            collider.setFrame(0);
            collider.body.setImmovable(true);
            collider.body.setAllowGravity(false);
            collider.refreshBody();
        });

        console.log(this.collidersInvisibles);
    }

    get()
    {
        return this.collidersInvisibles;
    }
}
