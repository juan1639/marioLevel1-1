import { Settings } from "../scenes/settings.js";
import { play_sonidos, sumar_puntos, mostrar_puntos, ms_restantes } from "../utils/functions.js";

// Secuencia de fin de nivel:
//  1. Mario toca el mastil -> se agarra (puntos segun la altura)
//  2. Mario y la bandera bajan por el mastil
//  3. Mario salta al otro lado, baja al suelo y anda hasta la puerta del castillo
//  4. Entra al castillo -> '¡Nivel superado!' -> siguiente nivel
export class FinNivel
{
    constructor(scene)
    {
        this.relatedScene = scene;
    }

    create()
    {
        const scene = this.relatedScene;
        const FIN = Settings.FIN_NIVEL;
        const TILE = Settings.screen.TILE_X * Settings.getLayer1().scaleX;
        const ESCALA = Settings.getLayer1().scaleX;

        this.TILE = TILE;
        this.iniciado = false;

        // Posiciones en pixeles del mundo:
        this.MASTIL_CENTRO_X = (FIN.MASTIL_X + 0.5) * TILE;
        this.MASTIL_TOP = FIN.MASTIL_TOP_Y * TILE;
        this.BASE_TOP = FIN.BASE_Y * TILE;
        this.SUELO_TOP = FIN.SUELO_Y * TILE;
        this.PUERTA_X = (FIN.PUERTA_X + 0.5) * TILE;

        // La bandera esta dibujada en el mapa (tiles 9 y 10). Se sustituye por sprites para poder
        // bajarla: el tile 9 pasa a ser cielo y el 10 (bandera + palo) solo palo (tile 17).
        const layer = scene.layer1;
        layer.putTileAt(1, FIN.MASTIL_X - 1, FIN.BANDERA_Y);
        layer.putTileAt(17, FIN.MASTIL_X, FIN.BANDERA_Y);

        const yBandera = (FIN.BANDERA_Y + 0.5) * TILE;

        this.bandera = [
            scene.add.sprite((FIN.MASTIL_X - 0.5) * TILE, yBandera, 'general-ssheet', 8).setScale(ESCALA),
            scene.add.sprite(this.MASTIL_CENTRO_X, yBandera, 'general-ssheet', 9).setScale(ESCALA)
        ];
    }

    update()
    {
        if (this.iniciado)
        {
            return;
        }

        const mario = this.relatedScene.mario.get();

        if (mario.getData('muerto') || mario.getData('transformando'))
        {
            return;
        }

        // ¿Mario toca el mastil? (el mastil es una linea en el centro de su tile)
        if (mario.body.right >= this.MASTIL_CENTRO_X - 2)
        {
            this.iniciar();
        }
    }

    iniciar()
    {
        const scene = this.relatedScene;
        const marioComp = scene.mario;
        const mario = marioComp.get();

        this.iniciado = true;
        mario.setData('level-up', true);

        // A partir de aqui Mario se mueve con tweens: sin fisicas (ni gravedad ni colisiones)
        mario.body.setEnable(false);
        mario.setDepth(1);

        scene.mario.terminarEstrella(false);
        scene.musica_principal.stop();
        play_sonidos(scene.sonido_level_up, false, 0.7);

        // Mario se agarra al mastil por la izquierda (dentro de los limites del palo):
        const mitadAlto = mario.displayHeight / 2;
        mario.x = this.MASTIL_CENTRO_X - mario.displayWidth / 2 + 4;
        mario.y = Phaser.Math.Clamp(mario.y, this.MASTIL_TOP + mitadAlto, this.BASE_TOP - mitadAlto);
        mario.setFlipX(false);
        marioComp.playAnim('desliza-bandera');

        // Puntos segun la altura:
        const altura = (this.BASE_TOP - (mario.y + mitadAlto)) / this.TILE;
        const [, puntos] = Settings.FIN_NIVEL.PUNTOS.find(([minima]) => altura >= minima);
        sumar_puntos(0, puntos, scene);
        mostrar_puntos(scene, puntos, mario.x + this.TILE, mario.y);

        // Mario y bandera bajan a la vez:
        const yFinalMario = this.BASE_TOP - mitadAlto;
        const duracionMario = Math.max(1, (yFinalMario - mario.y) / Settings.FIN_NIVEL.VEL_DESLIZA * 1000);

        const yFinalBandera = this.BASE_TOP - this.TILE / 2;
        const duracionBandera = (yFinalBandera - this.bandera[0].y) / Settings.FIN_NIVEL.VEL_DESLIZA * 1000;

        scene.tweens.add({
            targets: this.bandera,
            y: yFinalBandera,
            duration: duracionBandera
        });

        scene.tweens.add({
            targets: mario,
            y: yFinalMario,
            duration: duracionMario,
            // Espera a que la bandera llegue abajo antes de seguir:
            onComplete: () => scene.time.delayedCall(Math.max(0, duracionBandera - duracionMario) + 200, () => this.ir_al_castillo())
        });
    }

    ir_al_castillo()
    {
        const scene = this.relatedScene;
        const marioComp = scene.mario;
        const mario = marioComp.get();

        // Salta al otro lado del mastil (mirando hacia el)...
        mario.x = this.MASTIL_CENTRO_X + mario.displayWidth / 2 - 4;
        mario.setFlipX(true);

        const ySuelo = this.SUELO_TOP - mario.displayHeight / 2;
        const xBajada = this.MASTIL_CENTRO_X + this.TILE * 1.5;

        scene.time.delayedCall(400, () =>
        {
            mario.setFlipX(false);
            marioComp.playAnim('andar');

            scene.tweens.chain({
                targets: mario,
                tweens: [
                    {
                        // ...baja del bloque base al suelo...
                        x: xBajada,
                        y: ySuelo,
                        duration: 300,
                        ease: 'Quad.easeIn'
                    },
                    {
                        // ...y anda hasta la puerta del castillo
                        x: this.PUERTA_X,
                        duration: (this.PUERTA_X - xBajada) / Settings.FIN_NIVEL.VEL_ANDAR * 1000
                    }
                ],
                onComplete: () => this.entrar_castillo()
            });
        });
    }

    entrar_castillo()
    {
        const scene = this.relatedScene;
        const ancho = scene.sys.game.config.width;
        const alto = scene.sys.game.config.height;

        scene.mario.get().setVisible(false);

        // Al completar el nivel tambien se guarda el record (por si luego se cierra la pagina)
        if (Settings.actualizarRecord())
        {
            scene.marcadores.update(2, Settings.marcadores.hi);
        }
        play_sonidos(scene.sonido_fuegos, false, 0.7);

        scene.add.text(ancho / 2, alto / 3, '¡Nivel superado!', {
            fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 48, color: '#ff7',
            stroke: '#e91', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

        // Siguiente nivel: el mismo mapa con el contador de nivel +1 (se conservan puntos y vidas).
        // Se espera como minimo a que termine la musica de 'level-up' (al reiniciar se cortaria):
        const espera = Math.max(Settings.FIN_NIVEL.ESPERA_SIGUIENTE, ms_restantes(scene.sonido_level_up) + 300);

        scene.time.delayedCall(espera, () =>
        {
            Settings.marcadores.nivel ++;
            scene.scene.restart();
        });
    }
}
