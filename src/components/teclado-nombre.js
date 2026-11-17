import { Settings } from "../scenes/settings.js";

// Teclado en pantalla para escribir el nombre del record.
// Se puede usar tocando/pulsando las teclas o con el teclado fisico
// (letras y numeros, RETROCESO para borrar, ENTER para aceptar).
export class TecladoNombre
{
    static FILAS = [
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
        ['U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3'],
        ['4', '5', '6', '7', '8', '9', '-', '.', '⌫', 'OK']
    ];

    // config: { x, y } = centro de la fila superior; alAceptar(nombre) se llama al pulsar OK/ENTER
    constructor(scene, config)
    {
        this.relatedScene = scene;
        this.config = config;
    }

    create()
    {
        const scene = this.relatedScene;
        const { x, y } = this.config;
        const CELDA = 48;

        this.nombre = '';
        this.objetos = [];

        // Nombre escrito hasta ahora (los huecos libres se ven como '_')
        this.txtNombre = scene.add.text(x, y - 56, '', {
            fontFamily: 'courier new, monospace', fontStyle: 'bold', fontSize: 40, color: '#fff',
            stroke: '#e61', strokeThickness: 6
        }).setOrigin(0.5);
        this.objetos.push(this.txtNombre);
        this.actualizar_nombre();

        // Teclas
        TecladoNombre.FILAS.forEach((fila, f) =>
        {
            fila.forEach((tecla, c) =>
            {
                const cx = x + (c - (fila.length - 1) / 2) * CELDA;
                const cy = y + f * CELDA;

                const fondo = scene.add.rectangle(cx, cy, CELDA - 6, CELDA - 6, 0x333333)
                    .setStrokeStyle(2, 0x888888)
                    .setInteractive({ useHandCursor: true });

                const txt = scene.add.text(cx, cy, tecla, {
                    fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: tecla === 'OK' ? 18 : 22,
                    color: tecla === 'OK' ? '#7f7' : '#ff7'
                }).setOrigin(0.5);

                fondo.on('pointerover', () => fondo.setFillStyle(0x666666));
                fondo.on('pointerout', () => fondo.setFillStyle(0x333333));
                fondo.on('pointerdown', () => this.pulsar(tecla));

                this.objetos.push(fondo, txt);
            });
        });

        // Teclado fisico
        this.alPulsarTecla = (evento) =>
        {
            if (evento.key === 'Enter')
            {
                this.pulsar('OK');
            }
            else if (evento.key === 'Backspace')
            {
                this.pulsar('⌫');
            }
            else if (/^[a-zA-Z0-9.\-]$/.test(evento.key))
            {
                this.pulsar(evento.key.toUpperCase());
            }
        };

        scene.input.keyboard.on('keydown', this.alPulsarTecla);
    }

    pulsar(tecla)
    {
        if (tecla === '⌫')
        {
            this.nombre = this.nombre.slice(0, -1);
        }
        else if (tecla === 'OK')
        {
            // Hace falta al menos una letra
            if (this.nombre.length > 0)
            {
                this.terminar();
            }
            return;
        }
        else if (this.nombre.length < Settings.MAX_NOMBRE)
        {
            this.nombre += tecla;
        }

        this.actualizar_nombre();
    }

    actualizar_nombre()
    {
        this.txtNombre.setText(this.nombre.padEnd(Settings.MAX_NOMBRE, '_').split('').join(' '));
    }

    terminar()
    {
        this.relatedScene.input.keyboard.off('keydown', this.alPulsarTecla);
        this.objetos.forEach(objeto => objeto.destroy());
        this.config.alAceptar(this.nombre);
    }
}
