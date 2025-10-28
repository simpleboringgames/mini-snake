# Mini Snake

A tiny fast snake game.

This is the classic snake game. It is simply a snake that either follows the pointer or you can control it with your keyboard (WASD or Arrow Keys).

I made this game to make the landing page of Simple Boring Games (https://simpleboringgames.com) a bit more interesting.

## Consuming the library

I have not set up a build pipeline and proper packaging yet so the best way to consume is:

```
pnpm install github:simpleboringgames/mini-snake#0.3.0
```

## Building the library

```
pnpm install
pnpm run build
pnpm run start
```

## Future

Some things I would like to do in the future (unless someone wants to contribute!?):

- Snake chases mouse in a better way (currently requires exactly diagonal - hard to predict - less reactive as I would like)
- Online multiplayer mode
- Less code (but still readable)!
- Smaller output size (currently at 316.03 kB)
- Faster code (but still readable)!
