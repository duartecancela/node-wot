const mqtt = require("mqtt");
const fs = require("fs");
const readline = require("readline");

const { Servient } = require("@node-wot/core");
const MqttClientFactory = require("@node-wot/binding-mqtt").MqttClientFactory;

// MQTT manual client
const mqttClient = mqtt.connect("mqtt://localhost:1883");
let waterLevel = 100;

// MQTT WoT consumer setup
const servient = new Servient();
servient.addClientFactory(new MqttClientFactory());

servient.start().then(async (WoT) => {
    const td = JSON.parse(fs.readFileSync(__dirname + "/td-coffee-machine-mqtt.json", "utf8"));
    const thing = await WoT.consume(td);

    thing.observeProperty("waterAlert", async (data) => {
        const result = await data.value(); // Espera objeto JSON como { value: "..." }
        console.log("🔔 [WoT MQTT] Alert via TD:", result.value);
    });
});

// Manual MQTT fallback (para debug e validação)
mqttClient.on("connect", () => {
    mqttClient.subscribe("coffee-machine/alert/water", () => {
        console.log("📡 Subscribed to manual MQTT alert as backup");
    });
});

mqttClient.on("message", (topic, message) => {
    try {
        const parsed = JSON.parse(message.toString());
        console.log(`🔔 [Manual MQTT] ${parsed.value}`);
    } catch {
        console.log(`🔔 [Manual MQTT] ${message.toString()}`);
    }
});

// CLI menu
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function menu() {
    console.log("\n1. Decrease water manually");
    console.log("2. Decrease randomly");
    console.log("3. Exit");
    rl.question("Select: ", (opt) => {
        if (opt === "1") {
            rl.question("How much to decrease (%): ", (val) => {
                waterLevel = Math.max(0, waterLevel - parseInt(val));
                if (waterLevel < 20) {
                    const payload = JSON.stringify({ value: `Manual water alert: ${waterLevel}%` });
                    mqttClient.publish("coffee-machine/alert/water", payload);
                }
                console.log(`💧 Water: ${waterLevel}%`);
                menu();
            });
        } else if (opt === "2") {
            const rand = Math.floor(Math.random() * 10) + 5;
            waterLevel = Math.max(0, waterLevel - rand);
            if (waterLevel < 20) {
                const payload = JSON.stringify({ value: `Random water alert: ${waterLevel}%` });
                mqttClient.publish("coffee-machine/alert/water", payload);
            }
            console.log(`💧 Water: ${waterLevel}%`);
            menu();
        } else {
            console.log("👋 Bye");
            rl.close();
            mqttClient.end();
        }
    });
}

menu();
