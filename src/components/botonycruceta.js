
export class CrucetaDireccion 
{

    constructor(scene, direccion) 
    {
        this.relatedScene = scene;
        this.direccion = direccion;
    }

    create() 
    {
        const { id, press, x, y, ang, scX, scY, alpha } = this.direccion;

        this.boton = this.relatedScene.add.image(x, y, id).setInteractive();
        this.boton.setScale(scX, scY).setAngle(ang).setDepth(4).setAlpha(alpha);
        this.boton.setX(x).setY(y);
        this.boton.setData('on', true);
        this.boton.setData('press', press);
        
        // if (!Settings.isBotonesYcruceta()) this.boton.setVisible(false);

        this.isDown = false;
    
        this.boton.on('pointerover', () => {
          this.boton.setScale(scX + 0.1, scY + 0.1);
        });

        this.boton.on('pointerout', () => {
          this.boton.setScale(scX, scY);
        });

        this.boton.on('pointerdown', () => {
            this.isDown = true;
        });

        this.boton.on('pointerup', () => {
            this.isDown = false;
        });

        console.log(this.boton);
    }
    
    get() 
    {
        return this.boton;
    }
}

// ======================================================================
export class BotonSalto extends CrucetaDireccion {}

