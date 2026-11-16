
export class EmisorParticulas
{
    constructor(scene, config)
    {
        this.relatedScene = scene;
        this.config = config;
    }

    // Crea UN solo emisor (parado) que se reutiliza en cada explosion
    create()
    {
        const {vel, ang, grav, lifeSp, esc} = this.config;

        this.emisor = this.relatedScene.add.particles(0, 0, 'brick-particle', {
            speed: { min: vel[0], max: vel[1] },
            angle: { min: ang[0], max: ang[1] },
            gravityY: grav,
            lifespan: lifeSp,
            // Escala inicial aleatoria por particula (entre esc[0] y esc[1]), que baja hasta 0:
            scale: {
                onEmit: (particula) =>
                {
                    particula.escalaInicial = Phaser.Math.FloatBetween(esc[0], esc[1]);
                    return particula.escalaInicial;
                },
                onUpdate: (particula, key, t) => particula.escalaInicial * (1 - t)
            },
            emitting: false // No emite automáticamente, se lanza con explotar()
        });
    }

    explotar(x, y)
    {
        this.emisor.explode(this.config.cantidad, x, y);
    }

    get()
    {
        return this.emisor;
    }
}
