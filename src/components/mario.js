
export class Mario 
{

    constructor(scene) 
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.mario = this.relatedScene.physics.add.sprite(
            this.relatedScene.sys.game.config.width / 2, 100, 'mario-ss1'
        );

        this.mario.setVisible(false).setFrame(0).setCollideWorldBounds(true);
        this.mario.body.setAllowGravity(false);

        console.log(this.mario);
    }

    update() {}

    get() 
    {
        return this.mario;
    }
}
