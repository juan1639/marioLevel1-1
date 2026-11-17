
// Boton de salto para los controles tactiles: un circulo con una 'A', fijo en pantalla.
// Expone isDown / isUp igual que una tecla, para que Mario lo use como la barra espaciadora.
export class BotonSalto
{
    constructor(scene, config)
    {
        this.relatedScene = scene;
        this.config = config;
    }

    create()
    {
        const { x, y, radio } = this.config;
        const scene = this.relatedScene;

        this.isDown = false;
        this.pointerId = null;

        this.boton = scene.add.circle(x, y, radio, 0x888888, 0.6)
            .setStrokeStyle(4, 0xcccccc, 0.8)
            .setScrollFactor(0)
            .setDepth(20);

        this.texto = scene.add.text(x, y, 'A', {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: Math.round(radio * 0.9),
            color: '#eee', stroke: '#333', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

        // Zona tactil circular (un poco mas grande que el dibujo, para que sea facil acertar)
        const zona = new Phaser.Geom.Circle(radio, radio, radio * 1.2);
        this.boton.setInteractive(zona, Phaser.Geom.Circle.Contains);

        this.boton.on('pointerdown', (pointer) =>
        {
            this.isDown = true;
            this.pointerId = pointer.id;
            this.boton.setFillStyle(0xcccccc, 0.8);
        });

        // Se suelta al levantar ESE dedo, aunque sea fuera del boton
        // (el joystick puede estar usando otro dedo a la vez)
        scene.input.on('pointerup', (pointer) =>
        {
            if (pointer.id === this.pointerId)
            {
                this.soltar();
            }
        });

        this.mostrar(false);
    }

    soltar()
    {
        this.isDown = false;
        this.pointerId = null;
        this.boton.setFillStyle(0x888888, 0.6);
    }

    get isUp()
    {
        return !this.isDown;
    }

    mostrar(visible)
    {
        this.boton.setVisible(visible);
        this.texto.setVisible(visible);

        if (visible)
        {
            this.boton.setInteractive();
        }
        else
        {
            this.boton.disableInteractive();
            this.soltar();
        }
    }
}
