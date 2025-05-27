
export class EmisorParticulas
{
    constructor(scene, config)
    {
        this.relatedScene = scene;
        this.config = config;
    }
  
    create(x, y)
    {
        const {vel, ang, grav, lifeSp, cantidad, esc, autoRun, duracion} = this.config;

        // Crea un emitter que puedes reutilizar
        this.emisor = this.relatedScene.add.particles(x, y, 'brick-particle', {
            speed: { min: vel[0], max: vel[1] },
            angle: { min: ang[0], max: ang[1] },
            gravityY: grav,
            lifespan: lifeSp,
            quantity: cantidad,
            scale: { start: esc[0], end: esc[1] },
            on: autoRun // No emite automáticamente, lo activas manualmente
        });

        this.relatedScene.time.delayedCall(duracion, () => this.emisor.stop());

        console.log(this.emisor);
    }

    update() {}

    get()
    {
        return this.emisor;
    }
}
