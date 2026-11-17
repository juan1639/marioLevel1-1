
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

        this.txt = this.relatedScene.add.text(x, y, texto, {
            fontSize: size + 'px',
            fontStyle: style,
            fill: fll,
            fontFamily: family
        });

        this.txt.setStroke(strokeColor, strokeSize).setShadow(2, 2, shadowColor, 2, bool1, bool2);
        this.txt.setOrigin(origin[0], origin[1]);
    }

    get()
    {
        return this.txt;
    }
}
