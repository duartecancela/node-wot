const td = {
    "@context": "https://www.w3.org/2019/wot/td/v1",
    title: "coffee-machine",
    id: "urn:dev:wot:oauth:coffee",
    securityDefinitions: {
        oauth2_sc: {
            scheme: "oauth2",
            flow: "client",
            token: "https://localhost:3000/token",
            scopes: ["coffee:access"],
        },
    },
    security: ["oauth2_sc"],
    properties: {
        availableResourceLevel: {
            type: "number",
            readOnly: true,
        },
        possibleDrinks: {
            type: "array",
            items: { type: "string" },
            readOnly: true,
        },
        maintenanceNeeded: {
            type: "boolean",
            readOnly: true,
        },
    },
    actions: {
        makeDrink: {
            input: { type: "string" },
        },
    },
};

const availableDrinks = ["espresso", "cappuccino", "latte"];
let level = 5;
let maintenance = false;

WoT.produce(td).then((thing) => {
    thing.setPropertyReadHandler("availableResourceLevel", async () => level);
    thing.setPropertyReadHandler("possibleDrinks", async () => availableDrinks);
    thing.setPropertyReadHandler("maintenanceNeeded", async () => maintenance);

    thing.setActionHandler("makeDrink", async (input) => {
        try {
            let drink = input;
            if (typeof input === "object" && typeof input.value === "function") {
                drink = await input.value();
            }
            console.log("Parsed drink:", drink);

            if (!availableDrinks.includes(drink)) {
                throw new Error("Invalid drink");
            }

            if (level <= 0) {
                throw new Error("Out of resources");
            }

            level--;
            if (level <= 1) maintenance = true;

            // Estado atual nos logs
            console.log("📦 Estado atual:");
            console.log("- availableResourceLevel:", level);
            console.log("- maintenanceNeeded:", maintenance);
            console.log("- possibleDrinks:", availableDrinks.join(", "));

            return `Served ${drink}`;
        } catch (err) {
            console.error("makeDrink error:", err.message);
            throw err;
        }
    });

    thing.expose();
});
