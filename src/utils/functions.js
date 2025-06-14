import { AnimaBloques } from "../components/anima-bloques.js";

export function hitBrick(player, tile, context)
{
    const body = player.body;

    // Verificamos si hay bloqueo en la 'cabeza' del jugador:
    const isBlockeUp = player.body.blocked.up;

    // Bloques id:
    const BLOQUE_LADRILLO = 15;
    const BLOQUE_INTERROGACION = 14;
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
        context.emisor.create(worldX, worldY);

        play_sonidos(context.bricks_fall, false, 0.3);
    }

    if (tile.index === BLOQUE_INTERROGACION && isBlockeUp)
    {
        // context.layer1.removeTileAt(tile.x, tile.y);
        context.layer1.putTileAt(CIELO_AZUL, tile.x, tile.y);

        // Coordenadas del tile en píxeles
        const worldX = tile.getCenterX();
        const worldY = tile.getCenterY();

        // Anima bloque-push:
        const dura = 450;      
        const animaBloque = new AnimaBloques(context, {
            offsetY: -16, easeEtc: 'Sine.easeOut', duracion: dura, conYoyo: true
        });
        animaBloque.create(worldX, worldY);

        context.time.delayedCall(dura * 1.5, () => context.layer1.putTileAt(BLOQUE_INTERROGACION, tile.x, tile.y), null);

        play_sonidos(context.push_block, false, 0.8);
    }
}

export function config_marcadores_txt(context)
{
    const marcadoresCoorY = -40;

    context.marcadorptos.create({
        x: context.mapa_scores.x + 8,
        y: marcadoresCoorY,
        origin: [0, 0],
        texto: 'Puntos: ' + context.mario.get().x.toString(), size: 32, style: 'bold',  fll: '#ffa',
        family: 'arial, sans-serif',
        strokeColor: '#ee9011', strokeSize: 8, ShadowColor: '#111111',
        bool1: true, bool2: true
    });

    context.marcadorhi.create({
        x: context.sys.game.config.width / 1.8,
        y: marcadoresCoorY,
        origin: [0.5, 0],
        texto: 'Hi: 5000', size: 32, style: 'bold',  fll: '#ffa',
        family: 'arial, sans-serif',
        strokeColor: '#ee9011', strokeSize: 8, ShadowColor: '#111111',
        bool1: true, bool2: true
    });
}

export function play_sonidos(id, loop, volumen)
{
    id.volume = volumen;
    id.loop = loop;
    id.play();
}
