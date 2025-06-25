# Smart Coffee Machine with MQTT Alerts ☕

Este projeto baseia-se na máquina de café inteligente do repositório [Eclipse Thingweb node-wot](https://github.com/eclipse-thingweb/node-wot), tendo sido estendido para emitir e detetar eventos via protocolo MQTT. O sistema permite simular a redução de níveis de água e notificar clientes sempre que o nível ficar abaixo de um limiar pré-definido.

## 🧩 Componentes do Projeto

-   **Produtor WoT (Thing)**: `smart-coffee-machine-mqtt.js`
    -   Expõe um _Thing_ WoT via HTTP
    -   Publica alertas MQTT no tópico `coffee-machine/alert/water` sempre que o nível de água fica inferior a 20%
-   **Consumidor MQTT (Client)**: `smart-coffee-consumer.js`
    -   Subscreve ao tópico MQTT
    -   Simula redução do nível de água por teclado ou aleatoriamente
    -   Lê a Thing Description (TD) e observa a propriedade `waterAlert` usando binding MQTT

---

## 🚀 Como correr o projeto

### 1. Pré-requisitos

-   Node.js instalado
-   Broker MQTT local (ex: Mosquitto)

### 2. Instalar dependências

```bash
npm install @node-wot/core @node-wot/binding-http @node-wot/binding-mqtt mqtt
```

---

### 3. Iniciar o broker Mosquitto

**Windows:**

```bash
mosquitto -v
```

**Linux:**

```bash
sudo service mosquitto start
```

---

### 4. Executar o produtor

```bash
node examples/scripts/smart-coffee-machine-mqtt.js
```

---

### 5. Executar o consumidor

```bash
node examples/scripts/smart-coffee-consumer.js
```

---

## 📘 Uso de Binding Templates (MQTT)

Este projeto utiliza uma Thing Description (TD) com o protocolo MQTT, conforme os binding templates descritos pelo W3C.

A propriedade `waterAlert` está definida com:

-   `"op": ["observeproperty"]`
-   `"mqv:controlPacket": "PUBLISH"`
-   `"contentType": "application/json"`
-   Tipo: `object` com subpropriedade `"value": "string"`

---

## 📡 Exemplo de mensagem publicada

As mensagens publicadas no tópico `coffee-machine/alert/water` seguem agora este formato:

```json
{ "value": "Manual water alert: 8%" }
```

---

## 🧾 Excerto da Thing Description (TD)

```json
"waterAlert": {
  "type": "object",
  "observable": true,
  "properties": {
    "value": { "type": "string" }
  },
  "forms": [
    {
      "href": "mqtt://localhost:1883/coffee-machine/alert/water",
      "op": ["observeproperty"],
      "contentType": "application/json",
      "mqv:controlPacket": "PUBLISH"
    }
  ]
}
```
