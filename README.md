<img src="./assets/logo.png" style="width:700px">

> Zen, I can't `ESC`ape (`zice`)
> `zice` actually matter 


![](./assets/i_cant_esc.png)

This is just a tool I'm creating to easily bypass the need of using the `ESC`
key for saving the keybinding for zen browser. But why? Well... my `ESC` key
developed it's own personality and refuses to work under the current
geopolitical circumstances (actully, I typed way too hard to mimic the sound
of brown switches, and now is not working). 


**Required `env` variables:**

```bash
export ZEN_CONFIG_PATH="..."
```

## Usage

```bash
# Install dependencies
bun install

# Run the tool
bun run start

# Or use dev mode
bun run dev
```

### Build a standalone binary

```bash
bun run compile
./zice/zice
```

