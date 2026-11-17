// ===========================================================================
//  ELEMENTOS DEL MAPA DE TILES (json)
//
//  1.cielo                 | 1-3 5-7.nube              | 9-10.bandera
//  11.moneda               | 12.seta(roja)             | 13,17.mastil
//  14.bloque-interrog.     | 15.bloque-ladrillo        | 16.bloque-piramides
//  18.seta(marron)         | 19.estrella               | 21-22, 27-28 tuberia
//  23-25.bloque-castillo   | 30-32.montaña verde       | 36-38 matorral
//  40.bloque-suelo         | 41.bloque-interrog. ya usado
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
        MAX_VEL_ANDAR: 200,   // velocidad maxima andando
        MAX_VEL_CORRER: 300,  // velocidad maxima corriendo (SHIFT / Z, o joystick al fondo)
        CORTE_SALTO: 0.45,    // al soltar el salto mientras sube, la velocidad se multiplica por esto
        JOYSTICK_CORRER: 0.85, // fraccion del radio del joystick a partir de la cual se corre
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

    static TIEMPO =
    {
        INICIAL: 400,
        MS_POR_UNIDAD: 400,    // ms reales que dura cada unidad de tiempo
        AVISO: 100,            // al llegar aqui la musica se acelera
        VELOCIDAD_AVISO: 1.3,  // velocidad de la musica a partir del aviso
        PUNTOS_POR_UNIDAD: 50, // puntos por cada unidad que sobra al terminar el nivel
        MS_RECUENTO: 10        // ms por unidad al convertir el tiempo sobrante en puntos
    };

    static MONEDA =
    {
        PUNTOS: 200,
        PARA_VIDA: 100 // cada 100 monedas, una vida extra
    };

    // Ladrillos que dan varias monedas (coordenadas en TILES). En el mapa pueden ser
    // bloques '?' o ladrillos: al cargar el nivel se convierten en ladrillo.
    static LADRILLOS_MONEDAS =
    {
        POSICIONES: [[94, 9]],
        TIEMPO: 4000,  // ms desde el primer golpe; despues, el siguiente golpe da la ultima moneda
        MAX: 10,       // monedas maximas por ladrillo
        CADENCIA: 200  // ms minimos entre golpes que cuentan (evita contar 2 veces el mismo golpe)
    };

    static ESTRELLA =
    {
        DURACION: 9700,       // ms de invencibilidad (lo que dura estrella.mp3)
        VEL_X: 130,
        VEL_SALTO: 420,       // la estrella va dando saltos
        PUNTOS: 1000,
        COLORES: [0xff5555, 0xffffff, 0x55ff55, 0xffee55] // parpadeo de Mario invencible
    };

    static SETA =
    {
        VEL_X: 100,
        DURACION_SALIDA: 700, // ms que tarda en salir del bloque
        PUNTOS: 1000,
        SALTO_GOLPE: 380      // salto de una seta/estrella al golpear desde abajo el bloque en el que esta
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

    // Duracion (ms) de la subida del bloque al golpearlo desde abajo (la bajada dura lo mismo)
    static DURACION_REBOTE_BLOQUE = 225;

    static GOOMBA =
    {
        VEL_X: -60,
        PUNTOS: 100 // al aplastarlo, golpearlo desde abajo o con la estrella
    };

    static COLLIDERS_INVISIBLES =
    [
        [69, 12], [70, 12],
        [86, 12], [88, 12],
        [153, 12], [154, 12],
    ];

    static VIDAS_INICIALES = 3;

    static marcadores =
    {
        puntos: 0,
        hi: 9000,
        hiNombre: '', // nombre de quien tiene el record ('' = sin nombre)
        vidas: Settings.VIDAS_INICIALES,
        monedas: 0,
        tiempo: 400 // se reinicia a TIEMPO.INICIAL al empezar el nivel (y tras perder una vida)
    };

    // Reinicia los valores que NO deben conservarse entre partidas
    // (al reiniciar la escena tras perder una vida, los puntos SI se conservan)
    // Record (Hi) guardado en el navegador, para que no se pierda al recargar la pagina
    static CLAVE_RECORD = 'marioLevel1-1.hi';
    static CLAVE_NOMBRE_RECORD = 'marioLevel1-1.hiNombre';
    static MAX_NOMBRE = 6;
    static recordEnPartida = false; // ¿se ha batido el record en la partida actual?

    static cargarRecord()
    {
        try
        {
            const guardado = parseInt(localStorage.getItem(Settings.CLAVE_RECORD), 10);

            if (guardado > Settings.marcadores.hi)
            {
                Settings.marcadores.hi = guardado;
                Settings.marcadores.hiNombre = localStorage.getItem(Settings.CLAVE_NOMBRE_RECORD) || '';
            }
        }
        catch (e) {} // localStorage no disponible (p.ej. modo privado): se usa el valor por defecto
    }

    // Si los puntos actuales superan el record, lo actualiza y lo guarda. Devuelve true si hay nuevo record.
    static actualizarRecord()
    {
        if (Settings.marcadores.puntos <= Settings.marcadores.hi)
        {
            return false;
        }

        Settings.marcadores.hi = Settings.marcadores.puntos;
        Settings.recordEnPartida = true;

        // El nombre se pide en el Game Over; hasta entonces el record queda sin nombre
        // (para que no se quede con el nombre de quien tenia el record anterior)
        Settings.marcadores.hiNombre = '';

        try
        {
            localStorage.setItem(Settings.CLAVE_RECORD, String(Settings.marcadores.hi));
            localStorage.setItem(Settings.CLAVE_NOMBRE_RECORD, '');
        }
        catch (e) {}

        return true;
    }

    static guardarNombreRecord(nombre)
    {
        Settings.marcadores.hiNombre = nombre;

        try
        {
            localStorage.setItem(Settings.CLAVE_NOMBRE_RECORD, nombre);
        }
        catch (e) {}
    }

    static nuevaPartida()
    {
        Settings.marcadores.puntos = 0;
        Settings.marcadores.vidas = Settings.VIDAS_INICIALES;
        Settings.marcadores.monedas = 0;
        Settings.recordEnPartida = false;
        Settings.reiniciarNivel();
    }

    // Segundo punto de reaparicion (en TILES): al pasar por aqui, tras perder una vida
    // Mario reaparece aqui en vez de al principio del nivel.
    static CHECKPOINT =
    {
        X: 103,
        Y: 9
    };

    // Estado del nivel que se CONSERVA al perder una vida (la escena se reinicia, pero los bloques
    // ya golpeados siguen igual). Se borra al empezar una partida nueva o al completar el nivel.
    //  - tilesCambiados: 'x,y' -> indice de tile (ladrillos rotos, bloques '?' usados...)
    //  - ladrillosMonedas: estado de los ladrillos de varias monedas (null = aun sin crear)
    //  - checkpoint: true si Mario ya ha pasado por el CHECKPOINT
    static nivel = Settings.estadoNivelInicial();

    static estadoNivelInicial()
    {
        return { tilesCambiados: new Map(), ladrillosMonedas: null, checkpoint: false };
    }

    static reiniciarNivel()
    {
        Settings.nivel = Settings.estadoNivelInicial();
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
