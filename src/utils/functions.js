import { AnimaBloques } from "../components/anima-bloques.js";
import { Settings } from "../scenes/settings.js";

export function hitBrick(player, tile, context)
{
    // Verificamos si hay bloqueo en la 'cabeza' del jugador:
    const isBlockeUp = player.body.blocked.up;

    // Bloques id:
    const BLOQUE_LADRILLO = 15;
    const BLOQUE_INTERROGACION = 14;
    const BLOQUE_USADO = 41; // bloque '?' ya golpeado (tile propio para que no se pueda volver a golpear)
    const CIELO_AZUL = 1;

    // ¿Está el jugador claramente por debajo del tile?
    //const touchingBottomOfTile = body.y <= tile.getBottom();
    //console.log(tile.getLeft(), tile.getBottom());

    // Confirmamos tile correcto y dirección de impacto
    if (tile.index === BLOQUE_LADRILLO && isBlockeUp)
    {
        if (context.mario.esGrande())
        {
            // Mario grande: rompe el ladrillo
            context.layer1.putTileAt(CIELO_AZUL, tile.x, tile.y);

            // Lanza partículas desde el centro del tile
            context.emisor.explotar(tile.getCenterX(), tile.getCenterY());

            sumar_puntos(0, 10, context);

            play_sonidos(context.bricks_fall, false, 0.3);
        }
        else
        {
            // Mario pequeño: el ladrillo solo rebota
            rebotarBloque(tile, BLOQUE_LADRILLO, context);
            play_sonidos(context.push_block, false, 0.8);
        }
    }

    if (tile.index === BLOQUE_INTERROGACION && isBlockeUp)
    {
        // Datos del bloque ANTES de sustituirlo (putTileAt crea un tile nuevo)
        const tileX = tile.x;
        const tileY = tile.y;
        const worldX = tile.getCenterX();
        const worldTop = tile.getTop();
        const contenido = context.contenidoBloques.get(`${tileX},${tileY}`);

        // El bloque pasa a ser un bloque 'usado' (solido, ya no se puede volver a golpear):
        const bloqueUsado = context.layer1.putTileAt(BLOQUE_USADO, tileX, tileY);

        // La moneda sale al momento; las setas, al terminar el rebote del bloque
        if (contenido === 'moneda')
        {
            context.monedas.sacar(worldX, worldTop);
            sumar_puntos(0, Settings.MONEDA.PUNTOS, context);
            play_sonidos(context.sonido_moneda, false, 0.8);
        }

        rebotarBloque(bloqueUsado, BLOQUE_USADO, context, () =>
        {
            if (contenido === 'seta' || contenido === '1up')
            {
                context.setas.sacar(worldX, worldTop, contenido);
            }
        });

        play_sonidos(context.push_block, false, 0.8);
    }
}

// Animacion de 'rebote' de un bloque golpeado desde abajo. El tile se oculta mientras dura
// (lo sustituye un sprite que sube y baja), pero sigue siendo solido.
function rebotarBloque(tile, indiceTile, context, alTerminar)
{
    // Evita lanzar otra animacion si el bloque ya esta rebotando
    if (tile.rebotando)
    {
        return;
    }

    tile.rebotando = true;
    tile.setVisible(false);

    const animaBloque = new AnimaBloques(context, {
        offsetY: -16, easeEtc: 'Sine.easeOut', duracion: 450, conYoyo: true,
        frame: indiceTile - 1
    });

    animaBloque.create(tile.getCenterX(), tile.getCenterY(), () =>
    {
        tile.setVisible(true);
        tile.rebotando = false;

        if (alTerminar)
        {
            alTerminar();
        }
    });
}

/* export function enemigos_hitBrick(enemigos, tile, context)
{
    context.goombas.get().children.iterate(enemigo =>
    {
        // Verificamos si hay bloqueo en la 'cabeza' del jugador:
        const isBlockeLeft = enemigo.body.blocked.left;
        const isBlockeRight = enemigo.body.blocked.right;

        // Bloques id:
        const ARRAY_BLOQUES_SOLIDOS = [14, 15, 16, 21, 22, 27, 28];

        if (ARRAY_BLOQUES_SOLIDOS.includes(tile.index) && isBlockeLeft)
        {
            enemigo.setVelocityX(-Settings.GOOMBA.VEL_X);
        }
        else if (ARRAY_BLOQUES_SOLIDOS.includes(tile.index) && isBlockeRight)
        {
            enemigo.setVelocityX(Settings.GOOMBA.VEL_X);
        }
    });
} */

export function hitVsGoombas(mario, goomba, context)
{
    const marioBody = mario.body;
    const goombaBody = goomba.body;

    // Valor 'validador' que indica Mario cae encima Goomba:
    const VALOR_VALIDADOR = (Settings.screen.TILE_Y * Settings.getLayer1().scaleY) / 3;

    // Verifica si Mario cae encima de Goomba
    const pisando = marioBody.velocity.y > 0 && marioBody.bottom <= goombaBody.top + VALOR_VALIDADOR;

    if (pisando)
    {
        // Goomba aplastado y Rebote de Mario sobre el Goomba:
        play_sonidos(context.goomba_aplastado, false, 0.8);
        goombaDeath(goomba, context);
        marioBody.velocity.y = -Settings.MARIO.VEL_SALTO;
    }
    else
    {
        // Mario grande encoge; Mario pequeño muere
        context.mario.recibirGolpe();
    }
}

export function cogerSeta(mario, seta, context)
{
    const tipo = seta.getData('tipo');
    seta.destroy();

    play_sonidos(context.sonido_powerup, false, 0.8);

    if (tipo === '1up')
    {
        Settings.marcadores.vidas ++;
        context.marcadores.update(3, Settings.marcadores.vidas);
        return;
    }

    sumar_puntos(0, Settings.SETA.PUNTOS, context);
    context.mario.crecer();
}

export function goombaDeath(goomba, context)
{
    // Desactiva cuerpo
    //goomba.disableBody(true, true);
        
    goomba.anims.play('goomba-aplastado');
    goomba.body.setVelocityX(0);
    goomba.body.setEnable(false);

    // O destruir tras retraso
    context.time.delayedCall(1200, () => goomba.destroy());
}

export function sumar_puntos(id, valor, context)
{
    Settings.marcadores.puntos += valor;
    context.marcadores.update(id, Settings.marcadores.puntos);
}

// Crea una animacion solo si no existe ya. Las animaciones son GLOBALES (del juego, no de la escena),
// asi que al reiniciar la escena Game ya existen y anims.create() daria un aviso por clave duplicada.
export function crear_animacion(scene, config)
{
    if (!scene.anims.exists(config.key))
    {
        scene.anims.create(config);
    }
}

// Texto con unos puntos que sube y desaparece (x, y en coordenadas del mundo)
export function mostrar_puntos(scene, puntos, x, y)
{
    const TILE = Settings.screen.TILE_Y * Settings.getLayer1().scaleY;

    const txt = scene.add.text(x, y, `${puntos}`, {
        fontFamily: 'arial, sans-serif', fontStyle: 'bold', fontSize: 22, color: '#fff',
        stroke: '#111', strokeThickness: 4
    }).setOrigin(0.5).setDepth(10);

    scene.tweens.add({
        targets: txt,
        y: y - TILE * 2,
        alpha: 0,
        duration: 1200,
        onComplete: () => txt.destroy()
    });
}

// ms que faltan para que termine un sonido (0 si ya no esta sonando)
export function ms_restantes(sonido)
{
    if (!sonido.isPlaying)
    {
        return 0;
    }

    return Math.max(0, (sonido.duration - sonido.seek) * 1000);
}

export function play_sonidos(id, loop, volumen)
{
    id.volume = volumen;
    id.loop = loop;
    id.play();
}
