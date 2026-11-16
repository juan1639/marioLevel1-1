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
        // Centro vertical de la franja de marcadores (la camara 'view-scores' ve de y=-32 a y=0):
        const posY = -16;

        // Cada marcador se identifica por su clave, que es la misma que en Settings.marcadores
        // (y la que se pasa a update(clave, valor)).
        //
        // Posiciones X fijas, medidas para un canvas de 768 px de ancho (Arial Bold + borde de 8):
        //   Score 9-243 | monedas 262-335 | vidas 356-430 | Hi 450-582
        //   Time 592-710 | boton fullscreen 736-768
        //
        // 'icono': [textura, frame, escala] dibujado justo a la izquierda del texto
        this.config = {
            puntos:  { prefijo: ' Score: ', size: 32, color: '#ff7', borde: '#e91', x: 9 },
            monedas: { prefijo: 'x', size: 24, color: '#ff7', borde: '#e91', x: 288, icono: ['moneda', 0, 0.75] },
            vidas:   { prefijo: 'x', size: 24, color: '#ffb', borde: '#e61', x: 382, icono: ['mario-ss1', 0, 1.5] },
            hi:      { prefijo: ' Hi: ', size: 24, color: '#ff7', borde: '#e91', x: 450 },
            tiempo:  { prefijo: 'Time: ', size: 24, color: '#ffb', borde: '#e61', x: 592 }
        };

        this.textos = {};

        Object.entries(this.config).forEach(([clave, cfg]) =>
        {
            const texto = new Textos(this.relatedScene);

            texto.create({
                x: cfg.x,
                y: posY,
                origin: [0, 0.5],
                texto: cfg.prefijo + this.formatear(clave, Settings.marcadores[clave]),
                size: cfg.size, style: 'bold', fll: cfg.color,
                family: 'arial, sans-serif',
                strokeColor: cfg.borde, strokeSize: 8, ShadowColor: '#111',
                bool1: true, bool2: true
            });

            this.textos[clave] = texto.get();

            if (cfg.icono)
            {
                const [textura, frame, escala] = cfg.icono;
                this.relatedScene.add.image(cfg.x - 14, posY, textura, frame).setScale(escala);
            }
        });
    }

    // clave: 'puntos', 'monedas', 'vidas', 'hi' o 'tiempo'
    update(clave, valor)
    {
        this.textos[clave].setText(this.config[clave].prefijo + this.formatear(clave, valor));
    }

    // Score y Hi siempre con 6 cifras (000400) y monedas con 2 (x05)
    formatear(clave, valor)
    {
        const CIFRAS = { puntos: 6, hi: 6, monedas: 2 };

        return CIFRAS[clave] ? String(valor).padStart(CIFRAS[clave], '0') : valor;
    }

    get()
    {
        return this.textos;
    }
}
