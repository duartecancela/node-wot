WoT.requestThingDescription("https://localhost:8080/coffee-machine").then((td) => {
    WoT.consume(td).then(async (thing) => {
        try {
            const drinks = await thing.readProperty("possibleDrinks");
            console.log("Available drinks:", await drinks.value());

            const result = await thing.invokeAction("makeDrink", "latte");
            const value = typeof result.value === "function" ? await result.value() : result;
            console.log("Result:", value);
        } catch (err) {
            if (err.message?.includes("Unauthorized")) {
                console.error("🚫 Acesso negado: token inválido ou sem permissões.");
            } else {
                console.error("Erro ao aceder ao recurso:", err);
            }
            readline?.close?.();
        }
    });
});
