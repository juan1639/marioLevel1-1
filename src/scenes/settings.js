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
        // X_INICIAL: Phaser.Game.sys.game.config.width / 2,
        // Y_INICIAL: Phaser.Game.sys.game.config.height / 2
    }

    static GOOMBA =
    {
        VEL_X: -60  
    };

    static gameOver = false;

    static marcadores =
    {
        puntos: 0,
        nivel: 1,
        hi: 5000
    };

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
