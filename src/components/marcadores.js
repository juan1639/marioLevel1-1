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

        // Centro vertical de la franja de marcadores (la camara 'view-scores' ve de y=-32 a y=0):
        const posY = -16;

        // Posiciones X fijas, medidas para un canvas de 768 px de ancho (Arial Bold + borde de 8):
        //   Score (28px, hasta 6 cifras) 9-217 | monedas 222-297 | Level 305-409 | vidas 416-491
        //   Hi (hasta 5 cifras) 494-613 | Time 616-734 | boton fullscreen 736-768
        //
        // El indice de cada fila es el 'id' que se pasa a update(id, valor):
        // 0 = puntos, 1 = nivel, 2 = hi, 3 = vidas, 4 = monedas, 5 = tiempo
        // [texto, tamaño, color, colorBorde, x, y, valor]
        this.args = [
            [ ' Score: ', 28, '#ff7', '#e91', 9, posY, Settings.marcadores.puntos],
            [ ' Level: ', 24, '#ffb', '#e61', 305, posY, Settings.marcadores.nivel],
            [ ' Hi: ', 24, '#ff7', '#e91', 494, posY, Settings.marcadores.hi],
            [ 'x', 24, '#ffb', '#e61', 444, posY, Settings.marcadores.vidas],
            [ 'x', 24, '#ff7', '#e91', 250, posY, Settings.marcadores.monedas],
            [ 'Time: ', 24, '#ffb', '#e61', 616, posY, Settings.marcadores.tiempo]
        ];

        this.args.forEach((arg, id) =>
        {
            let cadaMarcador = new Textos(this.relatedScene);

            cadaMarcador.create({
                x: arg[4],
                y: arg[5],
                origin: [0, 0.5],
                texto: arg[0] + this.formatear(id, arg[6]), size: arg[1], style: 'bold',  fll: arg[2],
                family: 'arial, sans-serif',
                strokeColor: arg[3], strokeSize: 8, ShadowColor: '#111',
                bool1: true, bool2: true
            });

            this.marcadores.add(cadaMarcador.get());
        });

        // Iconos delante de los contadores de vidas y monedas:
        this.relatedScene.add.image(this.args[3][4] - 14, posY, 'mario-ss1', 0).setScale(1.5);
        this.relatedScene.add.image(this.args[4][4] - 14, posY, 'moneda', 0).setScale(0.75);
    }

    update(id, valor)
    {
        this.marcadores.getChildren()[id].setText(this.args[id][0] + this.formatear(id, valor));
    }

    // Las monedas se muestran siempre con 2 cifras (x05)
    formatear(id, valor)
    {
        return id === 4 ? String(valor).padStart(2, '0') : valor;
    }

    get()
    {
        return this.marcadores;
    }
}
