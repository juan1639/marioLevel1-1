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

        // Centro vertical de la franja de marcadores (la camara 'view-scores' ve de y=-32 a y=0):
        const posY = -16;

        // El indice de cada fila es el 'id' que se pasa a update(id, valor):
        // 0 = puntos, 1 = nivel, 2 = hi, 3 = vidas
        // [texto, tamaño, color, colorBorde, x, y, valor]
        this.args = [
            [ ' Score: ', 32, '#ff7', '#e91', 9, posY, Settings.marcadores.puntos],
            [ ' Level: ', 24, '#ffb', '#e61', Math.floor(ancho / 2.95), posY, Settings.marcadores.nivel],
            [ ' Hi: ', 24, '#ff7', '#e91', Math.floor(ancho / 1.6), posY, Settings.marcadores.hi],
            [ 'x', 24, '#ffb', '#e61', Math.floor(ancho / 1.83), posY, Settings.marcadores.vidas]
        ];

        this.args.forEach(arg =>
        {
            let cadaMarcador = new Textos(this.relatedScene);

            cadaMarcador.create({
                x: arg[4],
                y: arg[5],
                origin: [0, 0.5],
                texto: arg[0] + arg[6], size: arg[1], style: 'bold',  fll: arg[2],
                family: 'arial, sans-serif',
                strokeColor: arg[3], strokeSize: 8, ShadowColor: '#111',
                bool1: true, bool2: true
            });

            this.marcadores.add(cadaMarcador.get());
        });

        // Icono de Mario delante del contador de vidas:
        const [, , , , xVidas] = this.args[3];
        this.relatedScene.add.image(xVidas - 14, posY, 'mario-ss1', 0).setScale(1.5);
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
