
export class Textos 
{
    constructor(scene) 
    {
        this.relatedScene = scene;
    }

    create(args) 
    {
        const {
            x, y, origin,
            texto, size,
            style, fll, family,
            strokeColor, strokeSize,
            ShadowColor: shadowColor, bool1, bool2
        } = args;

        console.log(args);

        this.txt = this.relatedScene.add.text(x, y, texto, {
            fontSize: size + 'px',
            fontStyle: style,
            fill: fll,
            fontFamily: family
        });

        this.crear_tweens(texto);

        this.txt.setStroke(strokeColor, strokeSize).setShadow(2, 2, shadowColor, 2, bool1, bool2);
        this.txt.setOrigin(origin[0], origin[1]);
        // this.txt.setX(this.relatedScene.sys.game.config.width / 2);

        console.log(this.txt._text);
    }

    crear_tweens(texto) 
    {
        const array_tweens2 = [
            ' DonkeyJon ',
            ' Nivel Superado! ',
            ' Siguiente Nivel '
        ];

        array_tweens2.forEach(tween =>
        {
            if (tween === texto) {

                this.relatedScene.tweens.add({
                    targets: this.txt,
                    scale: 1.2,
                    x: 24,
                    ease: 'Ease',
                    yoyo: true,
                    hold: 900,
                    duration: 2000,
                    repeat: -1
                });
            }
        });
    }

    get()
    {
        return this.txt;
    }
}
