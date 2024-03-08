// Elementos del mapa de tiles json
// 1 cielo, 2 al 8 nube, 9 a 10 bandera, 11 moneda, 12 seta, 13 17 mastil
// 14 interrogacion, 15 plataforma ladrillo, 16 tile piramides, 18 seta
// 21 22 tuberia, 23 al 29 tile castillo, 30 ... montaña verde, 40 tile suelo

export class Settings {

    static screen = {
        width: 256,
        height: 240
    };

    static layer1 = {
        scaleX: 1,
        scaleY: 1
    };

    static velScroll = 90;
    static velSalto = -400;

    // getters & setters
    static getVelScroll()
    {
        return Settings.velScroll;
    }

    static getVelSalto()
    {
        return Settings.velSalto;
    }

    static getLayer1()
    {
        return Settings.layer1;
    }
}
