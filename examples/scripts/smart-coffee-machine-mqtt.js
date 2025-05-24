const { Servient } = require("@node-wot/core");
const HttpServer = require("@node-wot/binding-http").HttpServer;
const mqtt = require("mqtt");

// Connect to MQTT broker
const mqttClient = mqtt.connect("mqtt://localhost:1883");

// Set up WoT Servient
const servient = new Servient();
servient.addServer(new HttpServer({ port: 8080 }));

servient.start().then((WoT) => {
    WoT.produce({
        title: "SmartCoffeeMachine",
        id: "urn:dev:wot:coffee-machine",
        properties: {
            waterLevel: {
                type: "integer",
                observable: true,
                readOnly: false,
            },
        },
        actions: {
            decreaseWater: {
                description: "Decrease the water level randomly",
            },
        },
    }).then((thing) => {
        let waterLevel = 100;

        thing.setPropertyReadHandler("waterLevel", async () => waterLevel);

        thing.setActionHandler("decreaseWater", async () => {
            const amount = Math.floor(Math.random() * 20) + 1;
            waterLevel = Math.max(0, waterLevel - amount);
            console.log(`💧 New water level: ${waterLevel}%`);

            if (waterLevel < 20) {
                mqttClient.publish("coffee-machine/alert/water", `Water too low: ${waterLevel}%`);
                thing.emitPropertyChange("waterLevel");
            }

            return waterLevel;
        });

        thing.expose().then(() => {
            console.log("🚀 Coffee Machine exposed at http://localhost:8080/smart-coffee-machine");
        });
    });
});
