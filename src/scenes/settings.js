// ===========================================================================
//  ELEMENTOS DEL MAPA DE TILES (json)
//  
//  1.cielo                 | 1-3 5-7.nube              | 9-10.bandera
//  11.moneda               | 12.seta(roja)             | 13,17.mastil
//  14.bloque-interrog.     | 15.bloque-ladrillo        | 16.bloque-piramides
//  18.seta(marron)         | 19.estrella               | 21-22, 27-28 tuberia
//  23-25.bloque-castillo   | 30-32.montaña verde       | 36-38 matorral
//  40.bloque-suelo
// ---------------------------------------------------------------------------
export class Settings
{
    static controls =
    {
        MOBILE: false
    };

    static screen =
    {
        width: 256,
        height: 240,
        TILE_X: 16,
        TILE_Y: 16
    };
    
    static layer1 =
    {
        scaleX: 2,
        scaleY: 2,
        top: 0,
        left: 0
    };

    static MARIO =
    {
        VEL_SCROLL: 0,
        MAX_VEL_SCROLL: 280,
        VEL_SALTO: 455,
        MAX_VEL_SALTO: 640,
        ACELERACION: 7,
        DECELERACION: 14,
        X_INICIAL: 7,
        Y_INICIAL: 9,
        PAUSA_MUERTE: 600, // ms de pausa antes/despues de la animacion de muerte
        TIEMPO_INVULNERABLE: 2000 // ms sin poder recibir daño tras encoger
    };

    // Fin de nivel (coordenadas en TILES del mapa)
    static FIN_NIVEL =
    {
        MASTIL_X: 198,      // columna del mastil
        BANDERA_Y: 3,       // fila de la bandera (tiles 9 y 10, a la izquierda y sobre el mastil)
        MASTIL_TOP_Y: 4,    // primera fila del palo del mastil
        BASE_Y: 12,         // fila del bloque base del mastil
        PUERTA_X: 204,      // columna de la puerta del castillo
        SUELO_Y: 13,        // fila del suelo
        VEL_DESLIZA: 300,   // px/s bajando por el mastil
        VEL_ANDAR: 160,     // px/s andando hacia el castillo
        // Puntos segun la altura a la que se agarra al mastil (en tiles sobre la base): [altura minima, puntos]
        PUNTOS: [[7, 5000], [5, 2000], [3, 800], [1, 400], [0, 100]],
        ESPERA_SIGUIENTE: 3500 // ms desde que entra al castillo hasta empezar el siguiente nivel
    };

    static SETA =
    {
        VEL_X: 100,
        DURACION_SALIDA: 700, // ms que tarda en salir del bloque
        PUNTOS: 1000
    };

    static ARRAY_GOOMBAS =
    [
        [24, 12],
        [50, 12], [52, 12],
        [83, 1], [85, 1],
        [98, 12], [100, 12],
        [112, 12], [114, 12],
        [124, 12], [126, 12],
        [130, 12], [132, 12],
        [173, 12], [175, 12],
    ];

    static GOOMBA =
    {
        VEL_X: -60  
    };

    static COLLIDERS_INVISIBLES =
    [
        [69, 12], [70, 12],
        [86, 12], [88, 12],
        [153, 12], [154, 12],
    ];

    static gameOver = false;

    static VIDAS_INICIALES = 3;

    static marcadores =
    {
        puntos: 0,
        nivel: 1,
        hi: 5000,
        vidas: Settings.VIDAS_INICIALES
    };

    // Reinicia los valores que NO deben conservarse entre partidas
    // (al reiniciar la escena tras perder una vida, los puntos SI se conservan)
    static nuevaPartida()
    {
        Settings.marcadores.puntos = 0;
        Settings.marcadores.vidas = Settings.VIDAS_INICIALES;
        Settings.marcadores.nivel = 1;
    }

    static cameraScores =
    {
        x: 0,
        y: 0,
        ancho: 256,
        alto: 32,
        scrollX: 0,
        scrollY: -32
    };

    // getters & setters
    static getLayer1()
    {
        return Settings.layer1;
    }

    static getCameraScores()
    {
        return Settings.cameraScores;
    }
}
