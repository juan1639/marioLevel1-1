
export function hitBrick(player, tile, context)
{
    const body = player.body;

    // Verificamos si hay bloqueo en la 'cabeza' del jugador:
    const isBlockeUp = player.body.blocked.up;

    // Bloques id:
    const BLOQUE_LADRILLO = 15;
    const BLOQUE_INTERROGACION = 14;

    // ¿Está el jugador claramente por debajo del tile?
    //const touchingBottomOfTile = body.y <= tile.getBottom();
    //console.log(body.y, tile.getBottom());

    // Confirmamos tile correcto y dirección de impacto
    if (tile.index === BLOQUE_LADRILLO && isBlockeUp)
    {
        context.layer1.removeTileAt(tile.x, tile.y);
    }
}

export function play_sonidos(id, loop, volumen)
{
    id.volume = volumen;
    id.loop = loop;
    id.play();
}
