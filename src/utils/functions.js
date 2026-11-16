import { AnimaBloques } from "../components/anima-bloques.js";
import { Settings } from "../scenes/settings.js";

export function hitBrick(player, tile, context)
{
    const body = player.body;

    // Verificamos si hay bloqueo en la 'cabeza' del jugador:
    const isBlockeUp = player.body.blocked.up;

    // Bloques id:
    const BLOQUE_LADRILLO = 15;
    const BLOQUE_INTERROGACION = 14;
    const BLOQUE_USADO = 16; // El tileset no tiene bloque 'vacio': se usa el bloque-piramide
    const CIELO_AZUL = 1;

    // ¿Está el jugador claramente por debajo del tile?
    //const touchingBottomOfTile = body.y <= tile.getBottom();
    //console.log(tile.getLeft(), tile.getBottom());

    // Confirmamos tile correcto y dirección de impacto
    if (tile.index === BLOQUE_LADRILLO && isBlockeUp)
    {
        // context.layer1.removeTileAt(tile.x, tile.y);
        context.layer1.putTileAt(CIELO_AZUL, tile.x, tile.y);

        // Coordenadas del tile en píxeles
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Lanza partículas desde ese punto
        context.emisor.explotar(worldX, worldY);

        sumar_puntos(0, 10, context);

        play_sonidos(context.bricks_fall, false, 0.3);
    }

    if (tile.index === BLOQUE_INTERROGACION && isBlockeUp)
    {
        // Coordenadas del tile en píxeles
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // El bloque pasa a ser un bloque 'usado' (solido, ya no se puede volver a golpear).
        // Se oculta mientras dura la animacion, pero sigue siendo solido:
        const bloqueUsado = context.layer1.putTileAt(BLOQUE_USADO, tile.x, tile.y);
        bloqueUsado.setVisible(false);

        // Anima bloque-push:
        const dura = 450;
        const animaBloque = new AnimaBloques(context, {
            offsetY: -16, easeEtc: 'Sine.easeOut', duracion: dura, conYoyo: true,
            frame: BLOQUE_USADO - 1
        });
        animaBloque.create(worldX, worldY, () => bloqueUsado.setVisible(true));

        play_sonidos(context.push_block, false, 0.8);
    }
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
        // Mario muere
        context.mario.morir(true);
    }
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

export function play_sonidos(id, loop, volumen)
{
    id.volume = volumen;
    id.loop = loop;
    id.play();
}
