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

    // Golpe desde abajo a un bloque: derrota a los goombas que tenga encima
    if ((tile.index === BLOQUE_LADRILLO || tile.index === BLOQUE_INTERROGACION) && isBlockeUp)
    {
        golpearEnemigosEncima(tile.getLeft(), tile.getRight(), tile.getTop(), context);
    }

    // Ladrillo de varias monedas (no se rompe aunque Mario sea grande)
    const claveLadrillo = `${tile.x},${tile.y}`;

    if (tile.index === BLOQUE_LADRILLO && isBlockeUp && context.ladrillosMonedas.has(claveLadrillo))
    {
        golpearLadrilloMonedas(tile, claveLadrillo, BLOQUE_USADO, context);
        return;
    }

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
            sumar_moneda(context);
            play_sonidos(context.sonido_moneda, false, 0.8);
        }

        rebotarBloque(bloqueUsado, BLOQUE_USADO, context, () =>
        {
            if (contenido === 'seta' || contenido === '1up' || contenido === 'estrella')
            {
                context.setas.sacar(worldX, worldTop, contenido);
            }
        });

        play_sonidos(context.push_block, false, 0.8);
    }
}

// Cada golpe da una moneda. El tiempo empieza con el primer golpe; cuando se acaba (o se llega
// al maximo), el siguiente golpe da la ultima moneda y el ladrillo pasa a ser un bloque usado.
function golpearLadrilloMonedas(tile, clave, bloqueUsado, context)
{
    const CONFIG = Settings.LADRILLOS_MONEDAS;
    const estado = context.ladrillosMonedas.get(clave);
    const ahora = context.time.now;

    if (ahora - estado.ultimoGolpe < CONFIG.CADENCIA)
    {
        return;
    }

    estado.ultimoGolpe = ahora;

    if (estado.fin === null)
    {
        estado.fin = ahora + CONFIG.TIEMPO;
    }

    // Moneda:
    context.monedas.sacar(tile.getCenterX(), tile.getTop());
    sumar_puntos(0, Settings.MONEDA.PUNTOS, context);
    sumar_moneda(context);
    play_sonidos(context.sonido_moneda, false, 0.8);

    estado.monedas ++;

    if (ahora >= estado.fin || estado.monedas >= CONFIG.MAX)
    {
        // Ultima moneda: queda como bloque usado
        context.ladrillosMonedas.delete(clave);
        const usado = context.layer1.putTileAt(bloqueUsado, tile.x, tile.y);
        rebotarBloque(usado, bloqueUsado, context);
    }
    else
    {
        rebotarBloque(tile, tile.index, context);
    }

    play_sonidos(context.push_block, false, 0.8);
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

    // Con la estrella, cualquier contacto elimina al goomba
    if (context.mario.tieneEstrella())
    {
        goombaDerrotado(goomba, context);
        return;
    }

    // Verifica si Mario cae encima de Goomba
    const pisando = marioBody.velocity.y > 0 && marioBody.bottom <= goombaBody.top + VALOR_VALIDADOR;

    if (pisando)
    {
        // Goomba aplastado y Rebote de Mario sobre el Goomba:
        play_sonidos(context.goomba_aplastado, false, 0.8);
        sumar_puntos(0, Settings.GOOMBA.PUNTOS, context);
        mostrar_puntos(context, Settings.GOOMBA.PUNTOS, goomba.x, goombaBody.top);
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
        sumar_vida(context);
        return;
    }

    if (tipo === 'estrella')
    {
        sumar_puntos(0, Settings.ESTRELLA.PUNTOS, context);
        context.mario.activarEstrella();
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

// Goomba derrotado por la estrella o por un golpe desde abajo:
// sale despedido boca abajo y cae fuera de la pantalla
export function goombaDerrotado(goomba, context)
{
    if (!goomba.body.enable)
    {
        return; // ya estaba muerto
    }

    const TILE = Settings.screen.TILE_Y * Settings.getLayer1().scaleY;

    goomba.body.setEnable(false);
    goomba.anims.stop();
    goomba.setFlipY(true);

    play_sonidos(context.goomba_aplastado, false, 0.8);
    sumar_puntos(0, Settings.GOOMBA.PUNTOS, context);
    mostrar_puntos(context, Settings.GOOMBA.PUNTOS, goomba.x, goomba.y - TILE);

    context.tweens.chain({
        targets: goomba,
        tweens: [
            { y: goomba.y - TILE * 1.5, duration: 250, ease: 'Quad.easeOut' },
            { y: context.cameras.main.worldView.bottom + TILE * 2, duration: 700, ease: 'Quad.easeIn' }
        ],
        onComplete: () => goomba.destroy()
    });
}

// Al golpear un bloque desde abajo, los goombas que esten encima de el quedan derrotados
// (izq, der, top = bordes del bloque en pixeles del mundo)
function golpearEnemigosEncima(izq, der, top, context)
{
    const MARGEN = 6;

    context.goombas.get().getChildren().slice().forEach(goomba =>
    {
        const body = goomba.body;

        if (body.enable && body.right > izq && body.left < der && Math.abs(body.bottom - top) <= MARGEN)
        {
            goombaDerrotado(goomba, context);
        }
    });
}

// Suma una moneda al contador; al llegar a Settings.MONEDA.PARA_VIDA, vida extra y vuelve a 0
export function sumar_moneda(context)
{
    Settings.marcadores.monedas ++;

    if (Settings.marcadores.monedas >= Settings.MONEDA.PARA_VIDA)
    {
        Settings.marcadores.monedas -= Settings.MONEDA.PARA_VIDA;
        sumar_vida(context);
        play_sonidos(context.sonido_powerup, false, 0.8);
    }

    context.marcadores.update(4, Settings.marcadores.monedas);
}

export function sumar_vida(context)
{
    Settings.marcadores.vidas ++;
    context.marcadores.update(3, Settings.marcadores.vidas);
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
