// --- Elementos del mapa de tiles json ---
// 1 cielo, 2 al 8 nube, 9 a 10 bandera, 11 moneda, 12 seta, 13 17 mastil
// 14 interrogacion, 15 plataforma ladrillo, 16 tile piramides, 18 seta
// 21 22 tuberia, 23 al 29 tile castillo, 30 ... montaña verde, 40 tile suelo

export class Settings
{
    static screen = {
        width: 256,
        height: 240
    };

    static layer1 = {
        scaleX: 1,
        scaleY: 1
    };

    static velScroll = 0;
    static velSalto = 310;

    static aceleracion = 3;
    static maxVelScroll = 250;
    static maxVelSalto = 500;

    static gameOver = false;

    static marcadores = {
        puntos: 0,
        nivel: 1,
        hi: 5000
    };

    static cameraScores = {
        x: 0,
        y: 0,
        ancho: 256,
        alto: 32,
        scrollX: 0,
        scrollY: -32
    };

    // getters & setters
    static getVelScroll()
    {
        return Settings.velScroll;
    }

    static getVelSalto()
    {
        return Settings.velSalto;
    }

    static getAceleracion()
    {
        return this.aceleracion;
    }

    static getMaxVelScroll()
    {
        return Settings.maxVelScroll;
    }

    static getMaxVelSalto()
    {
        return Settings.maxVelSalto;
    }

    static getLayer1()
    {
        return Settings.layer1;
    }

    static getCameraScores()
    {
        return Settings.cameraScores;
    }
}
