import { Settings } from "../scenes/settings.js";
import { Textos } from "./textos.js";

export class Marcadores
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create()
    {
        this.marcadores = this.relatedScene.add.group();

        const ancho = this.relatedScene.sys.game.config.width;
        const alto = this.relatedScene.sys.game.config.height;

        const posY = -40;

        this.args = [
            [ ' Score: ', 32, '#ff7', '#e91', 9, posY, Settings.marcadores.puntos],
            [ ' Level: ', 24, '#ffb', '#e61', Math.floor(ancho / 2.6), posY, Settings.marcadores.nivel],
            [ ' Hi: ', 24, '#ff7', '#e91', Math.floor(ancho / 1.6), posY, Settings.marcadores.hi]
        ];

        this.args.forEach((arg, index) =>
        {
            /* let cadaMarcador = this.relatedScene.add.text(arg[5], arg[6], arg[0] + arg[7], {
                fontSize: arg[1] + 'px',
                fill: arg[2],
                fontFamily: 'verdana, arial, sans-serif',
                shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    color: arg[3],
                    blur: arg[4],
                    fill: true
                },
            }); */

            let cadaMarcador = new Textos(this.relatedScene);

            cadaMarcador.create({
                x: arg[4],
                y: arg[5],
                origin: [0, 0],
                texto: arg[0] + arg[6], size: 32, style: 'bold',  fll: arg[2],
                family: 'arial, sans-serif',
                strokeColor: arg[3], strokeSize: 8, ShadowColor: '#111',
                bool1: true, bool2: true
            });

            this.marcadores.add(cadaMarcador.get());
        });

        console.log(this.marcadores);
    }

    update(id, valor)
    {
        this.marcadores.getChildren()[id].setText(this.args[id][0] + valor);
    }

    get()
    {
        return this.marcadores;
    }
}
