import React, { useMemo, useState} from "react";
import {render, Box, Text, useApp, useInput} from "ink";

function App() {
    const { exit } = useApp();
    const [count, setCount] = useState(0);

    useInput((input, key) => {
        if (input === "q" || key.escape ) exit();
        if (key.return) setCount((c) => c+1);
        if (key.leftArrow) setCount((c) => Math.max(0, c - 1));
        if (key.rightArrow) setCount((c) => c + 1);
    })

    const  help = useMemo(
        () => "Enter/+Right: +1 | Left: -1 | q/Esq: quit",
        []
    )
    return (
        <Box flexDirection="column" padding={1}>
            <Text bold>Initial TUI</Text>
            <Text>Count: {count}</Text>
            <Text dimColor>{help}</Text>
        </Box>
    )
}

render(<App />)
