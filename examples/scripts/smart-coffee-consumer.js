const mqtt = require("mqtt");
const readline = require("readline");

let waterLevel = 100;
const mqttClient = mqtt.connect("mqtt://localhost:1883");

mqttClient.on("connect", () => {
    console.log("✅ Consumer connected to MQTT broker");
    mqttClient.subscribe("coffee-machine/alert/water", (err) => {
        if (!err) console.log("📡 Subscribed to water alerts");
    });
});

mqttClient.on("message", (topic, message) => {
    console.log(`🔔 ALERT: ${message.toString()}`);
});

// CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function menu() {
    console.log("\n1. Decrease manually");
    console.log("2. Decrease randomly");
    console.log("3. Exit");
    rl.question("Select option: ", (option) => {
        if (option === "1") {
            rl.question("Amount to decrease: ", (amount) => {
                waterLevel = Math.max(0, waterLevel - parseInt(amount));
                if (waterLevel < 20) {
                    mqttClient.publish("coffee-machine/alert/water", `Water too low (manual): ${waterLevel}%`);
                }
                console.log(`💧 Water level is now ${waterLevel}%`);
                menu();
            });
        } else if (option === "2") {
            const rand = Math.floor(Math.random() * 15) + 5;
            waterLevel = Math.max(0, waterLevel - rand);
            if (waterLevel < 20) {
                mqttClient.publish("coffee-machine/alert/water", `Water too low (random): ${waterLevel}%`);
            }
            console.log(`💧 Water level is now ${waterLevel}%`);
            menu();
        } else {
            console.log("👋 Exiting...");
            rl.close();
            mqttClient.end();
        }
    });
}

menu();
