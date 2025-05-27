
export class BotonFullScreen
{
    constructor(scene, direccion)
    {
        this.relatedScene = scene;
        this.direccion = direccion;
    }
  
    create()
    {
        const {id, x, y, ang, scX, scY, origin} = this.direccion;

        this.boton = this.relatedScene.add.image(x, y, id).setInteractive();
        this.boton.setOrigin(origin[0], origin[1]).setScale(scX, scY);
        this.boton.setAngle(ang).setFrame(0).setDepth(50);
        this.boton.setX(x).setY(y);
    
        this.boton.on('pointerover', () =>
        {
            // this.boton.setFrame(1);
            this.boton.setScale(scX + 0.1, scY + 0.1);
        });
        
        this.boton.on('pointerout', () =>
        {
            // this.boton.setFrame(0);
            this.boton.setScale(scX, scY);
        });
    
        this.boton.on('pointerdown', () =>
        {
            if (!this.relatedScene.scale.isFullscreen)
            {
                this.relatedScene.scale.startFullscreen();
            } else {
                this.relatedScene.scale.stopFullscreen();
            }
        });
    }
}

  